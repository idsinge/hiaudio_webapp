/* Source: https://github.com/superpoweredSDK/WebBrowserAudioLatencyMeasurement */
import { latencyMeasurer } from './latencyMeasurer.js'
import { isSafari } from '../../../../common/js/utils'
import { playlist } from '../composition'

export const NUMBER_TRIALS = 10

const warningMessageBeforeTest = `Please Make sure you are in a quiet place (so the browser can hear itself). Set both input and output audio volume to near maximum. This may be LOUD. Note: not all browsers on all devices will allow the browser permission to the speakers and microphone. If they don't, the test will not function.`

export class TestLatency {
    
    currentlatency = null

    static setCurrentLatency(latvalue){
        localStorage.setItem('latency', latvalue)
        TestLatency.currentlatency = latvalue   
    }
    static getCurrentLatency () {
        return TestLatency.currentlatency
    }

    static initialize(e) {

        const currentlatency = localStorage.getItem('latency')
        TestLatency.currentlatency = currentlatency ? parseInt(currentlatency):null

        TestLatency.audioContext = TestLatency.audioNode = null

        TestLatency.content = document.getElementById('testlatency')
        
        let audioWorklet = (typeof AudioWorkletNode === 'function') ? 1 : 0
        TestLatency.data = {
            buffersize: audioWorklet ? 128 : 512,
            samplerate: '?',
            audioWorklet: audioWorklet
        }
        TestLatency.runningon = '?'
        TestLatency.displayStart()        
    }

    static displayStart() {
        if (TestLatency.audioContext != null) TestLatency.audioContext.close()
        TestLatency.audioContext = TestLatency.audioNode = null
        TestLatency.content.innerHTML = ''
        TestLatency.startbutton = document.createElement('a')
        TestLatency.startbutton.innerText = 'TEST LATENCY'
        TestLatency.startbutton.classList.add('btn-outline-success')
        TestLatency.startbutton.onclick = TestLatency.start
        TestLatency.content.appendChild(TestLatency.startbutton)
        $('#testlatency').popover({
            trigger: 'focus'            
        })
    }

    static onAudioInputPermissionDenied(error) {
        console.log(error)
    }

    static onMessageFromAudioScope(message) {
        if (message.latency > 0) {
            TestLatency.setCurrentLatency(message.latency) 
        }
        $('#testlatency').attr('data-content', message.state + '/' + NUMBER_TRIALS + ' trials. Current latency: ' + message.latency + ' ms.')
        $('#testlatency').popover('show')
       
        if (message.state == NUMBER_TRIALS) {
            TestLatency.finishTest()
        }
    }

    static onAudioSetupFinished() {
        let audioInput = TestLatency.audioContext.createMediaStreamSource(TestLatency.inputStream)
        audioInput.connect(TestLatency.audioNode)
        TestLatency.audioNode.connect(TestLatency.audioContext.destination)
        TestLatency.startbutton.innerText = 'CANCEL'
        TestLatency.startbutton.classList.remove('btn-outline-success')
        TestLatency.startbutton.classList.add('btn-outline-danger')
        TestLatency.startbutton.onclick = TestLatency.displayStart
    }

    static finishTest() {
        if (TestLatency.audioContext != null) TestLatency.audioContext.close()
        TestLatency.audioContext = TestLatency.audioNode = null
        TestLatency.startbutton.innerText = 'TEST AGAIN'        
        TestLatency.startbutton.classList.remove('btn-outline-danger')
        TestLatency.startbutton.classList.add('btn-outline-primary')
        TestLatency.startbutton.onclick = TestLatency.displayStart
        $('#testlatency').popover('hide')
        if(isSafari){
            playlist.getEventEmitter().emit('resume')
        }        
    }

    static onAudioPermissionGranted(inputStream) {

        TestLatency.inputStream = inputStream
        TestLatency.latencyMeasurer = new latencyMeasurer()
        TestLatency.latencyMeasurer.toggle()
        TestLatency.lastState = 0        
        // TODO: bufferSize (512) needs to be reviewed
        TestLatency.audioNode = TestLatency.audioContext.createScriptProcessor(512, 2, 2)

        TestLatency.audioNode.onaudioprocess = function (e) {

            TestLatency.latencyMeasurer.processInput(e.inputBuffer.getChannelData(0), e.inputBuffer.getChannelData(1), TestLatency.data.samplerate, e.inputBuffer.length)
            TestLatency.latencyMeasurer.processOutput(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1))

            if (TestLatency.lastState != TestLatency.latencyMeasurer.state) {
                TestLatency.lastState = TestLatency.latencyMeasurer.state
                TestLatency.onMessageFromAudioScope({ state: TestLatency.lastState, latency: TestLatency.latencyMeasurer.latencyMs })
            }
        }

        TestLatency.onAudioSetupFinished()     
    }

    static start(e) {
        
        if(!TestLatency.getCurrentLatency()){
            const doTestLatency = window.confirm(`${warningMessageBeforeTest}`)
            if(isSafari){
                playlist.getEventEmitter().emit('resume')
            } 
            if (!doTestLatency) {     
              return 
            }
        }
        let AudioContext = window.AudioContext || window.webkitAudioContext || false
        TestLatency.audioContext = new AudioContext({ latencyHint: 0 })
        TestLatency.data.samplerate = TestLatency.audioContext.sampleRate
        const constraints = { audio: {echoCancellation:false, noiseSuppression:false, autoGainControl:false }}
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints).then(TestLatency.onAudioPermissionGranted).catch(TestLatency.onAudioInputPermissionDenied)
        }
        else {
            TestLatency.onAudioInputPermissionDenied(`Can't access getUserMedia.`)
        }
    }
}