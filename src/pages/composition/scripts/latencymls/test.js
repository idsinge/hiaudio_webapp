import { isSafari, MEDIA_CONSTRAINTS } from '../../../../common/js/utils'
import { drawResults, clearCanvas } from './helper'
import { generateMLS } from './mls'
import { TestMic } from '../webdictaphone/webdictaphone'
import { displayLatencyUI } from '../latencytesthandler'

const CANVAS = `<div class='container' id='audio-area'>
                    <canvas id='leftChannelCanvas' width='800' height='100' style='border:1px solid #000000;'></canvas>
                    <canvas id='rightChannelCanvas' width='800' height='100' style='border:1px solid #000000;' hidden></canvas>
                    <canvas id='autocorrelationCanvas1' style='border:1px solid #000000;'></canvas>
                    <canvas id='autocorrelationCanvas2' style='border:1px solid #000000;' hidden></canvas>
                </div>`

export class TestLatencyMLS {

    currentlatency = null

    noiseBuffer = null

    silenceBuffer = null

    debugCanvas = false
    
    audioContext = null

    worker = null

    signalrecorded = null
    
    btnId = null

    static setCurrentLatency(latvalue) {
        localStorage.setItem('latency', latvalue)
        displayLatencyUI(latvalue)
        TestLatencyMLS.currentlatency = latvalue
    }
    static getCurrentLatency() {
        return TestLatencyMLS.currentlatency
    }

    static getCorrectStreamForSafari(stream){
        const safariVersionIndex = navigator.userAgent.indexOf('Version/')
        const versionString =  navigator.userAgent.substring(safariVersionIndex + 8)
        const safariVersion = parseFloat(versionString)        
        if(isSafari && safariVersion > 16){
            const micsource = TestLatencyMLS.audioContext.createMediaStreamSource(stream)
            TestLatencyMLS.recordGainNode = TestLatencyMLS.audioContext.createGain()
            micsource.connect(TestLatencyMLS.recordGainNode)
            const defaultGain = 50 // force the gain to be 50 so it does not depend on manual control
            TestLatencyMLS.recordGainNode.gain.value = defaultGain
            const dest = TestLatencyMLS.audioContext.createMediaStreamDestination()
            TestLatencyMLS.recordGainNode.connect(dest)
            return dest.stream
        } else {
            return stream
        }
    }
    static setRecordGainNodeForTest(recordGainNode){
        const safariVersionIndex = navigator.userAgent.indexOf('Version/')
        const versionString =  navigator.userAgent.substring(safariVersionIndex + 8)
        const safariVersion = parseFloat(versionString)        
        if(isSafari && safariVersion > 16){
          const testMic = new TestMic()
          testMic.init(recordGainNode)
        }
    }

    static async initialize(ac, btnId) {

        TestLatencyMLS.btnId = btnId

        TestLatencyMLS.worker = new Worker(
            new URL('worker.js', import.meta.url),
            {type: 'module'}
        )
        TestLatencyMLS.worker.addEventListener('message', (message) => {
            TestLatencyMLS.workerMessageHanlder(message)
        })

        const debugCanvas = document.location.search.indexOf('debug') !== -1
                 
        if(debugCanvas){
            console.log('AudioContext', ac)
            TestLatencyMLS.debugCanvas = debugCanvas
            document.getElementById('page-header').insertAdjacentHTML('afterend', CANVAS)
        }        
        const currentlatency = localStorage.getItem('latency')
        TestLatencyMLS.currentlatency = currentlatency ? parseInt(currentlatency) : null        
        TestLatencyMLS.audioContext = ac
        TestLatencyMLS.start()
    }

    static onAudioPermissionGranted(inputStream) {
        
        const noisemls = generateMLS(15)
        TestLatencyMLS.noiseBuffer = TestLatencyMLS.generateAudio(noisemls, TestLatencyMLS.audioContext.sampleRate)
        TestLatencyMLS.silenceBuffer = TestLatencyMLS.generateSilence(noisemls, TestLatencyMLS.audioContext.sampleRate)
        const userMediaStream =  TestLatencyMLS.getCorrectStreamForSafari(inputStream)
        TestLatencyMLS.setRecordGainNodeForTest(TestLatencyMLS.recordGainNode)
        TestLatencyMLS.inputStream = userMediaStream
        if(TestLatencyMLS.debugCanvas){
            userMediaStream.getTracks().forEach(async function(track) {
                console.log('Test Latency Track Settings', track.getSettings())
            })
        }
        TestLatencyMLS.displayStart()
    }

    static start() {

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS).then(TestLatencyMLS.onAudioPermissionGranted).catch(TestLatencyMLS.onAudioInputPermissionDenied)
        }
        else {
            TestLatencyMLS.onAudioInputPermissionDenied(`Can't access getUserMedia.`)
        }
    }

    static displayStart() {

        TestLatencyMLS.content = document.getElementById(TestLatencyMLS.btnId)
        TestLatencyMLS.content.innerHTML = ''        
        TestLatencyMLS.startbutton = document.createElement('a')
        TestLatencyMLS.startbutton.innerText = 'TEST LATENCY'
        TestLatencyMLS.startbutton.classList.add('btn-outline-success')
        TestLatencyMLS.startbutton.onclick = TestLatencyMLS.onAudioSetupFinished
        TestLatencyMLS.content.appendChild(TestLatencyMLS.startbutton)
    
        if(TestLatencyMLS.debugCanvas){
            clearCanvas()
        }
    }

    static onAudioInputPermissionDenied(error) {
        console.log(error)
    }

    static async onAudioSetupFinished() {
        TestLatencyMLS.startbutton.innerText = 'STOP'
        TestLatencyMLS.startbutton.classList.remove('btn-outline-success')
        TestLatencyMLS.startbutton.classList.add('btn-outline-danger')
        TestLatencyMLS.startbutton.onclick = TestLatencyMLS.displayStart
        TestLatencyMLS.prepareAudioToPlayAndrecord()
    }

    static prepareAudioToPlayAndrecord() {

        TestLatencyMLS.signalrecorded = null

        const silenceSource = TestLatencyMLS.audioContext.createBufferSource()

        silenceSource.buffer = TestLatencyMLS.silenceBuffer

        silenceSource.connect(TestLatencyMLS.audioContext.destination)
       
        const doTheTest = () => {

            const noiseSource = TestLatencyMLS.audioContext.createBufferSource()
            noiseSource.buffer = TestLatencyMLS.noiseBuffer

            const splitter = TestLatencyMLS.audioContext.createChannelSplitter(2)
            const merger = TestLatencyMLS.audioContext.createChannelMerger(2)

            noiseSource.connect(splitter)
            splitter.connect(merger, 0, 0) // Connect only the left channel
            merger.connect(TestLatencyMLS.audioContext.destination)            
            
            TestLatencyMLS.audioContext.createMediaStreamSource(TestLatencyMLS.inputStream)

            let chunks = []

            const mediaRecorder = new MediaRecorder(TestLatencyMLS.inputStream)

            mediaRecorder.ondataavailable = async (event) => {
                chunks.push(event.data)
            }
            mediaRecorder.onstop = async () => {
                noiseSource.disconnect(splitter)
                splitter.disconnect(merger, 0, 0)
                merger.disconnect(TestLatencyMLS.audioContext.destination)
                TestLatencyMLS.displayAudioTagElem(chunks, mediaRecorder.mimeType)
            }

            mediaRecorder.start()

            noiseSource.start()
            noiseSource.onended = function () {
                mediaRecorder.stop()
                TestLatencyMLS.finishTest()
            }
        }
        silenceSource.start()
        silenceSource.onended = function () {
            silenceSource.disconnect(TestLatencyMLS.audioContext.destination)
            doTheTest()
        }
    }

    static finishTest() {
        TestLatencyMLS.startbutton.innerText = 'PROCESSING... '
        TestLatencyMLS.startbutton.classList.remove('btn-outline-danger')
        TestLatencyMLS.startbutton.classList.add('btn-outline-primary')
        TestLatencyMLS.startbutton.onclick = TestLatencyMLS.displayStart        
    }

    static async blobToAudioBuffer(audioContext, blob) {
        const arrayBuffer = await blob.arrayBuffer()
        return await audioContext.decodeAudioData(arrayBuffer)
    }

    static workerMessageHanlder(message){
        if(message.data.correlation){
            TestLatencyMLS.correlation = message.data.correlation
            TestLatencyMLS.worker.postMessage({
                command: 'findpeak',
                array: TestLatencyMLS.correlation,
                channel: message.data.channel
            })
        }
        if(message.data.peakValue){                
            TestLatencyMLS.displayresults(message.data, TestLatencyMLS.signalrecorded, TestLatencyMLS.noiseBuffer, TestLatencyMLS.correlation)
        }
    }
    static async displayAudioTagElem(chunks, mimeType) {
        
        const recordedAudio = new Blob(chunks, { type: mimeType })
        
        TestLatencyMLS.signalrecorded = await TestLatencyMLS.blobToAudioBuffer(TestLatencyMLS.audioContext, recordedAudio)
        
        if(TestLatencyMLS.debugCanvas){
            console.log('signalrecorded', TestLatencyMLS.signalrecorded)
            console.log('mlssignal', TestLatencyMLS.noiseBuffer)
        }
        
        TestLatencyMLS.correlation = null
        TestLatencyMLS.worker.postMessage({
            command: 'correlation',
            data1: TestLatencyMLS.signalrecorded.getChannelData(0), 
            data2: TestLatencyMLS.noiseBuffer.getChannelData(0), 
            maxLag: (0.600 * TestLatencyMLS.audioContext.sampleRate),
            channel: 0
        })
        URL.revokeObjectURL(recordedAudio)
    }

    static generateAudio(mlsSequence, frequency) {        

        const audioBuffer = TestLatencyMLS.audioContext.createBuffer(1, mlsSequence.length, frequency)
        let bufferData = audioBuffer.getChannelData(0)
        for (let i = 0; i < mlsSequence.length; i++) {
            // Convert binary sequence to audio signal
            bufferData[i] = mlsSequence[i] === 1 ? 1.0 : -1.0  // Map 1 to 1.0 and 0 to -1.0
        }
        return audioBuffer
    }

    static generateSilence(mlsSequence, frequency) {  

        const audioBuffer = TestLatencyMLS.audioContext.createBuffer(1, mlsSequence.length, frequency)
        let bufferData = audioBuffer.getChannelData(0)        
        const silenght = Math.trunc(mlsSequence.length/8)
        for (let i = 0; i < silenght ; i++) {
            bufferData[i] = 0
        }
        return audioBuffer
    }

    static displayresults(peak, signalrecorded, mlssignal, correlation, channel) {
       
        if(peak.channel === 0){
            const roundtriplatency = Number(peak.peakIndex / mlssignal.sampleRate * 1000).toFixed(2)
            const ratioIs = peak.peakValue / peak.mean
            console.log('Corr Ratio', ratioIs)
            //console.log('Corr ABS(Ratio)', Math.abs(ratioIs))
            TestLatencyMLS.setCurrentLatency(roundtriplatency)
            TestLatencyMLS.startbutton.innerText = 'TEST AGAIN '
            TestLatencyMLS.startbutton.innerHTML += `<span class='badge badge-info'>lat: ${roundtriplatency} ms.</span>`
            TestLatencyMLS.startbutton.classList.remove('btn-outline-danger')
            if(TestLatencyMLS.debugCanvas) {
                console.log('Latency = ', roundtriplatency + ' ms')
                drawResults(signalrecorded.getChannelData(0), 'leftChannelCanvas', 'autocorrelationCanvas1', correlation)
                console.log('signalrecorded.numberOfChannels', signalrecorded.numberOfChannels)
                if(signalrecorded.numberOfChannels>1){
                    document.getElementById('rightChannelCanvas').hidden = false
                    document.getElementById('autocorrelationCanvas2').hidden = false
                    TestLatencyMLS.correlation = null
                    TestLatencyMLS.worker.postMessage({
                        command: 'correlation',
                        data1: TestLatencyMLS.signalrecorded.getChannelData(1), 
                        data2: TestLatencyMLS.noiseBuffer.getChannelData(0), 
                        maxLag: (0.600 * TestLatencyMLS.audioContext.sampleRate),
                        channel: 1
                    })
                }
            }
        } else{
            console.log('Channel', peak.channel )
            const roundtriplatency = peak.peakIndex / mlssignal.sampleRate * 1000
            console.log('Latency = ', roundtriplatency + ' ms')
            const ratioIs = peak.peakValue / peak.mean
            console.log('Corr Ratio', ratioIs)
            drawResults(signalrecorded.getChannelData(1),  'rightChannelCanvas', 'autocorrelationCanvas2', TestLatencyMLS.correlation)
        }      
    }
}