/* Source: https://github.com/superpoweredSDK/WebBrowserAudioLatencyMeasurement */
import { latencyMeasurer } from './latencyMeasurer.js'
import { MEDIA_CONSTRAINTS } from '../../../../common/js/utils'
import { TEST_LAT_BTN_ID } from '../latencytesthandler'

export const NUMBER_TRIALS = 6
const TOTAL_TRIALS = NUMBER_TRIALS - 1

export class TestLatScriptProc {
    
    constructor() {
        this.currentlatency = null
        this.audioInput = null
    }

    static setCurrentLatency(latvalue){
        localStorage.setItem('latency', latvalue)
        TestLatScriptProc.currentlatency = latvalue   
    }
    static getCurrentLatency () {
        return TestLatScriptProc.currentlatency
    }

    static initialize(ac) {

        const currentlatency = localStorage.getItem('latency')
        TestLatScriptProc.currentlatency = currentlatency ? parseInt(currentlatency):null

        TestLatScriptProc.audioContext = TestLatScriptProc.audioNode = null

        TestLatScriptProc.audioContext = ac

        //TestLatScriptProc.content = document.getElementById(TEST_LAT_BTN_ID)        
        
        // let audioWorklet = (typeof AudioWorkletNode === 'function') ? 1 : 0
        // TestLatScriptProc.data = {
        //     buffersize: audioWorklet ? 128 : 512,
        //     samplerate: TestLatScriptProc.audioContext.samplerate,
        //     audioWorklet: audioWorklet
        // }
        // /TestLatScriptProc.runningon = '?'
        TestLatScriptProc.displayStart()        
    }

    static displayStart() {
        //if (TestLatScriptProc.audioContext != null) TestLatScriptProc.audioContext.close()
        //TestLatScriptProc.audioContext = TestLatScriptProc.audioNode = null
        TestLatScriptProc.audioNode = null
        TestLatScriptProc.content = document.getElementById(TEST_LAT_BTN_ID)
        TestLatScriptProc.content.innerHTML = ''
        TestLatScriptProc.startbutton = document.createElement('a')
        TestLatScriptProc.startbutton.innerText = 'TEST LATENCY'
        TestLatScriptProc.startbutton.classList.add('btn-outline-warning')
        TestLatScriptProc.startbutton.onclick = TestLatScriptProc.start
        TestLatScriptProc.content.appendChild(TestLatScriptProc.startbutton)
        $('#'+TEST_LAT_BTN_ID).popover('hide')
        $('#'+TEST_LAT_BTN_ID).popover({
            trigger: 'focus'            
        })
    }

    static onAudioInputPermissionDenied(error) {
        console.log(error)
    }

    static onMessageFromAudioScope(message) {
        if (message.latency > 0) {
            TestLatScriptProc.setCurrentLatency(message.latency)
            const trialNum = message.state - 1
            $('#'+TEST_LAT_BTN_ID).attr('data-content', trialNum + '/' + TOTAL_TRIALS + ' trials. Current latency: ' + message.latency + ' ms.')
            $('#'+TEST_LAT_BTN_ID).popover('show')
        } else {
            $('#'+TEST_LAT_BTN_ID).attr('data-content', 'No input detected')
            $('#'+TEST_LAT_BTN_ID).popover('show')
        }
       
        if (message.state >= NUMBER_TRIALS) {
            TestLatScriptProc.finishTest(message.latency)
        }
    }

    static onAudioSetupFinished() {
        TestLatScriptProc.audioInput = TestLatScriptProc.audioContext.createMediaStreamSource(TestLatScriptProc.inputStream)
        TestLatScriptProc.audioInput.connect(TestLatScriptProc.audioNode)
        TestLatScriptProc.audioNode.connect(TestLatScriptProc.audioContext.destination)
        TestLatScriptProc.startbutton.innerText = 'STOP'
        TestLatScriptProc.startbutton.classList.remove('btn-outline-warning')
        TestLatScriptProc.startbutton.classList.add('btn-outline-danger')
        TestLatScriptProc.startbutton.onclick = TestLatScriptProc.finishTest
    }

    static displayResultLatency(latency) {        
        TestLatScriptProc.startbutton.innerText = 'TEST AGAIN '
        if(typeof latency !== 'object'){
            TestLatScriptProc.startbutton.innerHTML += `<span class="badge badge-info">latency: ${latency} ms.</span>`
        }        
        TestLatScriptProc.startbutton.classList.remove('btn-outline-danger')
        TestLatScriptProc.startbutton.classList.add('btn-outline-primary')
    }
    static finishTest(latency) {
        //if (TestLatScriptProc.audioContext != null) TestLatScriptProc.audioContext.close()
        //TestLatScriptProc.audioContext = TestLatScriptProc.audioNode = null        
        TestLatScriptProc.audioInput.disconnect(TestLatScriptProc.audioNode)
        TestLatScriptProc.audioNode.disconnect(TestLatScriptProc.audioContext.destination)
        TestLatScriptProc.audioNode = null
        TestLatScriptProc.displayResultLatency(latency)
        // TestLatScriptProc.startbutton.innerText = 'TEST AGAIN '
        // TestLatScriptProc.startbutton.innerHTML += `<span class="badge badge-info">latency: ${latency} ms.</span>`
        // TestLatScriptProc.startbutton.classList.remove('btn-outline-danger')
        // TestLatScriptProc.startbutton.classList.add('btn-outline-primary')
        TestLatScriptProc.startbutton.onclick = TestLatScriptProc.displayStart
        $('#'+TEST_LAT_BTN_ID).popover('hide') 
    }

    static onAudioPermissionGranted(inputStream) {

        TestLatScriptProc.inputStream = inputStream
        TestLatScriptProc.latencyMeasurer = new latencyMeasurer()
        TestLatScriptProc.latencyMeasurer.toggle()
        TestLatScriptProc.lastState = 0        
        // TODO: bufferSize 256 for ScriptProcessor works better to estimate the latency rather than 512
        TestLatScriptProc.audioNode = TestLatScriptProc.audioContext.createScriptProcessor(256, 2, 2)

        TestLatScriptProc.audioNode.onaudioprocess = function (e) {

            TestLatScriptProc.latencyMeasurer.processInput(e.inputBuffer.getChannelData(0), e.inputBuffer.getChannelData(1), TestLatScriptProc.audioContext.sampleRate, e.inputBuffer.length)
            TestLatScriptProc.latencyMeasurer.processOutput(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1))

            if (TestLatScriptProc.lastState != TestLatScriptProc.latencyMeasurer.state) {
                TestLatScriptProc.lastState = TestLatScriptProc.latencyMeasurer.state
                TestLatScriptProc.onMessageFromAudioScope({ state: TestLatScriptProc.lastState, latency: TestLatScriptProc.latencyMeasurer.latencyMs })
            }
        }

        TestLatScriptProc.onAudioSetupFinished()     
    }

    static async start() {
        $('#'+TEST_LAT_BTN_ID).popover('hide')
        //let AudioContext = window.AudioContext || window.webkitAudioContext || false
        //TestLatScriptProc.audioContext = new AudioContext({ latencyHint: 0 })
        //TestLatScriptProc.data.samplerate = TestLatScriptProc.audioContext.sampleRate
        
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS).then(TestLatScriptProc.onAudioPermissionGranted).catch(TestLatScriptProc.onAudioInputPermissionDenied)
        }
        else {
            TestLatScriptProc.onAudioInputPermissionDenied(`Can't access getUserMedia.`)
        }
    }
}