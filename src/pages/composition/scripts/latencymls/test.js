import { isSafari, MEDIA_CONSTRAINTS } from '../../../../common/js/utils'
import { drawResults, findPeak, clearCanvas, calculateCrossCorrelation } from './helper'
import { generateMLS } from './mls'
import { TestMic } from '../webdictaphone/webdictaphone'

const warningMessageBeforeTest = `Please, be careful as a noise will be played through the speakers, so don't put the volume to the max. `

const CANVAS = `<div class="container" id="audio-area">
                    <canvas id="leftChannelCanvas" width="800" height="100" style="border:1px solid #000000;"></canvas>
                    <canvas id="rightChannelCanvas" width="800" height="100" style="border:1px solid #000000;"></canvas>
                    <canvas id="autocorrelationCanvas1" style="border:1px solid #000000;"></canvas>
                    <canvas id="autocorrelationCanvas2" style="border:1px solid #000000;"></canvas>
                </div>`

export class TestLatencyMLS {

    currentlatency = null

    noiseBuffer = null

    silenceBuffer = null

    debugCanvas = false

    playlist = null

    static setCurrentLatency(latvalue) {
        localStorage.setItem('latency', latvalue)
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
            const micGain = localStorage.getItem('micgain')
            const defaultGain = micGain ? parseInt(micGain) : 1
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


    static async initialize(playlist, btnId) {
        console.log('AudioContext', playlist.ac)
        const debugCanvas = document.location.search.indexOf('debug') !== -1
         
        if(debugCanvas){
            TestLatencyMLS.debugCanvas = debugCanvas
            document.getElementById('page-header').insertAdjacentHTML('afterend', CANVAS)
        }        
        const currentlatency = localStorage.getItem('latency')
        TestLatencyMLS.currentlatency = currentlatency ? parseInt(currentlatency) : null
        TestLatencyMLS.playlist = playlist
        TestLatencyMLS.audioContext = TestLatencyMLS.audioNode = null
        TestLatencyMLS.content = document.getElementById(btnId)
        TestLatencyMLS.start()
    }

    static onAudioPermissionGranted(inputStream) {
        TestLatencyMLS.audioContext = TestLatencyMLS.playlist.ac
        const noisemls = generateMLS(15)
        TestLatencyMLS.noiseBuffer = TestLatencyMLS.generateAudio(noisemls, TestLatencyMLS.audioContext.sampleRate)
        TestLatencyMLS.silenceBuffer = TestLatencyMLS.generateSilence(noisemls, TestLatencyMLS.audioContext.sampleRate)
        const userMediaStream =  TestLatencyMLS.getCorrectStreamForSafari(inputStream)
        TestLatencyMLS.setRecordGainNodeForTest(TestLatencyMLS.recordGainNode)
        TestLatencyMLS.inputStream = userMediaStream
        if(TestLatencyMLS.debugCanvas){
            userMediaStream.getTracks().forEach(async function(track) {
                console.log('getSettings', track.getSettings())
            })
        }
        TestLatencyMLS.displayStart()
    }

    static start() {

        $('#testlatency').popover('hide')        
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS).then(TestLatencyMLS.onAudioPermissionGranted).catch(TestLatencyMLS.onAudioInputPermissionDenied)
        }
        else {
            TestLatencyMLS.onAudioInputPermissionDenied(`Can't access getUserMedia.`)
        }
    }

    static displayStart() {

        TestLatencyMLS.content.innerHTML = ''
        TestLatencyMLS.startbutton = document.createElement('a')
        TestLatencyMLS.startbutton.innerText = 'TEST LATENCY'
        TestLatencyMLS.startbutton.classList.add('btn-outline-success')
        TestLatencyMLS.startbutton.onclick = TestLatencyMLS.onAudioSetupFinished

        TestLatencyMLS.content.appendChild(TestLatencyMLS.startbutton)
        $('#testlatency').popover('hide')
        $('#testlatency').popover({
            trigger: 'focus'
        })

        if(TestLatencyMLS.debugCanvas){
            clearCanvas()
        }
    }

    static onAudioInputPermissionDenied(error) {
        console.log(error)
    }

    static async onAudioSetupFinished() {
        // workaround for Safari in case alert is displayed for detleting a track
        if (TestLatencyMLS.audioContext.state === 'suspended') {
            await TestLatencyMLS.audioContext.resume()
        }
        if(!TestLatencyMLS.getCurrentLatency()){
            const doTestLatency = window.confirm(`${warningMessageBeforeTest}`)
            if(isSafari){
                TestLatencyMLS.playlist.getEventEmitter().emit('resume')
            } 
            if (!doTestLatency) {     
              return 
            }
        }
        TestLatencyMLS.startbutton.innerText = 'STOP'
        TestLatencyMLS.startbutton.classList.remove('btn-outline-success')
        TestLatencyMLS.startbutton.classList.add('btn-outline-danger')
        TestLatencyMLS.startbutton.onclick = TestLatencyMLS.displayStart

        TestLatencyMLS.prepareAudioToPlayAndrecord()

    }

    static prepareAudioToPlayAndrecord() {

        const silenceSource = TestLatencyMLS.audioContext.createBufferSource();

        silenceSource.buffer = TestLatencyMLS.silenceBuffer;

        silenceSource.connect(TestLatencyMLS.audioContext.destination);
       
        const doTheTest = () => {
            const noiseSource = TestLatencyMLS.audioContext.createBufferSource();

            noiseSource.buffer = TestLatencyMLS.noiseBuffer;

            const splitter = TestLatencyMLS.audioContext.createChannelSplitter(2);
            const merger = TestLatencyMLS.audioContext.createChannelMerger(2);

            noiseSource.connect(splitter);
            splitter.connect(merger, 0, 0); // Connect only the left channel to the right output
            merger.connect(TestLatencyMLS.audioContext.destination);

            //noiseSource.connect(TestLatencyMLS.audioContext.destination)
            
            TestLatencyMLS.audioContext.createMediaStreamSource(TestLatencyMLS.inputStream)

            let chunks = []

            const mediaRecorder = new MediaRecorder(TestLatencyMLS.inputStream)

            mediaRecorder.ondataavailable = async (event) => {
                chunks.push(event.data)
            }
            mediaRecorder.onstop = async () => {
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
        $('#testlatency').popover('hide')
    }
    static async blobToAudioBuffer(audioContext, blob) {
        const arrayBuffer = await blob.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    }
    static async displayAudioTagElem(chunks, mimeType) {

        const recordedAudio = new Blob(chunks, { type: mimeType })
       //const recordedAudioURL = URL.createObjectURL(recordedAudio)
        //const signalrecorded = await fetchAudioContext(recordedAudioURL, TestLatencyMLS.audioContext)
        const signalrecorded = await TestLatencyMLS.blobToAudioBuffer(TestLatencyMLS.audioContext, recordedAudio)
        let mlssignal = TestLatencyMLS.noiseBuffer
        if(TestLatencyMLS.debugCanvas){
            console.log('signalrecorded', signalrecorded)
            console.log('mlssignal', mlssignal)
        }
        const maxDelayExpected = 0.500
        const maxLag = maxDelayExpected * TestLatencyMLS.audioContext.sampleRate
        const correlation = calculateCrossCorrelation(signalrecorded.getChannelData(0), mlssignal.getChannelData(0), maxLag)

        const peak = findPeak(correlation)
        const roundtriplatency = peak.peakIndex / mlssignal.sampleRate * 1000
        console.log('Latency = ', roundtriplatency + ' ms')
        URL.revokeObjectURL(recordedAudio)
        TestLatencyMLS.setCurrentLatency(roundtriplatency)
        TestLatencyMLS.startbutton.innerText = 'TEST AGAIN '
        TestLatencyMLS.startbutton.innerHTML += `<span class='badge badge-info'>lat: ${roundtriplatency} ms.</span>`
        TestLatencyMLS.startbutton.classList.remove('btn-outline-danger')
        if(TestLatencyMLS.debugCanvas) {
            drawResults(signalrecorded.getChannelData(0), 'leftChannelCanvas', 'autocorrelationCanvas1', correlation)
            console.log('signalrecorded.numberOfChannels', signalrecorded.numberOfChannels)
            if(signalrecorded.numberOfChannels>1){
                const correlation2 = calculateCrossCorrelation(signalrecorded.getChannelData(1), mlssignal.getChannelData(0), maxLag)
                drawResults(signalrecorded.getChannelData(1),  'rightChannelCanvas', 'autocorrelationCanvas2', correlation2)
                const peak2 = findPeak(correlation2)
                const roundtriplatency2 = peak2.peakIndex / mlssignal.sampleRate * 1000
                console.log('Latency 2 = ', roundtriplatency2 + ' ms')
            }
        }
    }

    /* White Noise Mozilla: https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode*/
    static generateAudio(mlsSequence, frequency = 44100) {

        // IMPORTANT: Check the frequency of the system if different from 44100

        const audioBuffer = TestLatencyMLS.audioContext.createBuffer(1, mlsSequence.length, frequency)
        let bufferData = audioBuffer.getChannelData(0)
        for (let i = 0; i < mlsSequence.length; i++) {
            // Convert binary sequence to audio signal
            bufferData[i] = mlsSequence[i] === 1 ? 1.0 : -1.0  // Map 1 to 1.0 and 0 to -1.0
        }
        return audioBuffer
    }

    static generateSilence(mlsSequence, frequency = 44100) {  

        const audioBuffer = TestLatencyMLS.audioContext.createBuffer(1, mlsSequence.length, frequency)
        let bufferData = audioBuffer.getChannelData(0)        
        const silenght = Math.trunc(mlsSequence.length/8)
        for (let i = 0; i < silenght ; i++) {
            bufferData[i] = 0
        }
        return audioBuffer
    }
}