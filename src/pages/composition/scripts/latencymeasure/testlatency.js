/* Source: https://github.com/superpoweredSDK/WebBrowserAudioLatencyMeasurement */
import { latencyMeasurer } from './latencyMeasurer.js'
import { isSafari, MEDIA_CONSTRAINTS } from '../../../../common/js/utils'
import { playlist, TEST_LAT_BTN_ID } from '../composition'

export const NUMBER_TRIALS = 6
const TOTAL_TRIALS = NUMBER_TRIALS - 1

const warningMessageBeforeTest = `Please Make sure you are in a quiet place (so the browser can hear itself). Set both input and output audio volume to near maximum. This may be LOUD. Note: not all browsers on all devices will allow the browser permission to the speakers and microphone. If they don't, the test will not function.`

export class TestLatency {
    
    constructor() {
        this.currentlatency = null
        this.audioInput = null
    }

    static setCurrentLatency(latvalue){
        localStorage.setItem('latency', latvalue)
        TestLatency.currentlatency = latvalue   
    }
    static getCurrentLatency () {
        return TestLatency.currentlatency
    }

    static initialize(ac) {

        const currentlatency = localStorage.getItem('latency')
        TestLatency.currentlatency = currentlatency ? parseInt(currentlatency):null

        TestLatency.audioContext = TestLatency.audioNode = null

        TestLatency.audioContext = ac

        //TestLatency.content = document.getElementById(TEST_LAT_BTN_ID)        
        
        // let audioWorklet = (typeof AudioWorkletNode === 'function') ? 1 : 0
        // TestLatency.data = {
        //     buffersize: audioWorklet ? 128 : 512,
        //     samplerate: TestLatency.audioContext.samplerate,
        //     audioWorklet: audioWorklet
        // }
        // /TestLatency.runningon = '?'
        TestLatency.displayStart()        
    }

    static displayStart() {
        //if (TestLatency.audioContext != null) TestLatency.audioContext.close()
        //TestLatency.audioContext = TestLatency.audioNode = null
        TestLatency.audioNode = null
        TestLatency.content = document.getElementById(TEST_LAT_BTN_ID)
        TestLatency.content.innerHTML = ''
        TestLatency.startbutton = document.createElement('a')
        TestLatency.startbutton.innerText = 'TEST LATENCY'
        TestLatency.startbutton.classList.add('btn-outline-warning')
        TestLatency.startbutton.onclick = TestLatency.start
        TestLatency.content.appendChild(TestLatency.startbutton)
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
            TestLatency.setCurrentLatency(message.latency)
            const trialNum = message.state - 1
            $('#'+TEST_LAT_BTN_ID).attr('data-content', trialNum + '/' + TOTAL_TRIALS + ' trials. Current latency: ' + message.latency + ' ms.')
            $('#'+TEST_LAT_BTN_ID).popover('show')
        } else {
            $('#'+TEST_LAT_BTN_ID).attr('data-content', 'No input detected')
            $('#'+TEST_LAT_BTN_ID).popover('show')
        }
       
        if (message.state >= NUMBER_TRIALS) {
            TestLatency.finishTest(message.latency)
        }
    }

    static onAudioSetupFinished() {
        TestLatency.audioInput = TestLatency.audioContext.createMediaStreamSource(TestLatency.inputStream)
        TestLatency.audioInput.connect(TestLatency.audioNode)
        TestLatency.audioNode.connect(TestLatency.audioContext.destination)
        TestLatency.startbutton.innerText = 'STOP'
        TestLatency.startbutton.classList.remove('btn-outline-warning')
        TestLatency.startbutton.classList.add('btn-outline-danger')
        TestLatency.startbutton.onclick = TestLatency.finishTest
    }

    static displayResultLatency(latency) {        
        TestLatency.startbutton.innerText = 'TEST AGAIN '
        if(typeof latency !== 'object'){
            TestLatency.startbutton.innerHTML += `<span class="badge badge-info">latency: ${latency} ms.</span>`
        }        
        TestLatency.startbutton.classList.remove('btn-outline-danger')
        TestLatency.startbutton.classList.add('btn-outline-primary')
    }
    static finishTest(latency) {
        //if (TestLatency.audioContext != null) TestLatency.audioContext.close()
        //TestLatency.audioContext = TestLatency.audioNode = null        
        TestLatency.audioInput.disconnect(TestLatency.audioNode)
        TestLatency.audioNode.disconnect(TestLatency.audioContext.destination)
        TestLatency.audioNode = null
        TestLatency.displayResultLatency(latency)
        // TestLatency.startbutton.innerText = 'TEST AGAIN '
        // TestLatency.startbutton.innerHTML += `<span class="badge badge-info">latency: ${latency} ms.</span>`
        // TestLatency.startbutton.classList.remove('btn-outline-danger')
        // TestLatency.startbutton.classList.add('btn-outline-primary')
        TestLatency.startbutton.onclick = TestLatency.displayStart
        $('#'+TEST_LAT_BTN_ID).popover('hide') 
    }

    static onAudioPermissionGranted(inputStream) {

        TestLatency.inputStream = inputStream
        TestLatency.latencyMeasurer = new latencyMeasurer()
        TestLatency.latencyMeasurer.toggle()
        TestLatency.lastState = 0        
        // TODO: bufferSize 256 for ScriptProcessor works better to estimate the latency rather than 512
        TestLatency.audioNode = TestLatency.audioContext.createScriptProcessor(256, 2, 2)

        TestLatency.audioNode.onaudioprocess = function (e) {

            TestLatency.latencyMeasurer.processInput(e.inputBuffer.getChannelData(0), e.inputBuffer.getChannelData(1), TestLatency.audioContext.sampleRate, e.inputBuffer.length)
            TestLatency.latencyMeasurer.processOutput(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1))

            if (TestLatency.lastState != TestLatency.latencyMeasurer.state) {
                TestLatency.lastState = TestLatency.latencyMeasurer.state
                TestLatency.onMessageFromAudioScope({ state: TestLatency.lastState, latency: TestLatency.latencyMeasurer.latencyMs })
            }
        }

        TestLatency.onAudioSetupFinished()     
    }

    static async start() {
        $('#'+TEST_LAT_BTN_ID).popover('hide')
        //let AudioContext = window.AudioContext || window.webkitAudioContext || false
        //TestLatency.audioContext = new AudioContext({ latencyHint: 0 })
        //TestLatency.data.samplerate = TestLatency.audioContext.sampleRate
        
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS).then(TestLatency.onAudioPermissionGranted).catch(TestLatency.onAudioInputPermissionDenied)
        }
        else {
            TestLatency.onAudioInputPermissionDenied(`Can't access getUserMedia.`)
        }
    }
}