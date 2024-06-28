import MeasureProcessor from 'worklet:./processor.js'
import { displayLatencyUI } from '../latencytesthandler'

const safariVersionIndex = navigator.userAgent.indexOf('Version/')
const versionString = navigator.userAgent.substring(safariVersionIndex + 8)
const safariVersion = parseFloat(versionString)
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export class TestLatRingBuf {

    ac = null

    worklet_node = null

    btnstart = null

    running = false

    latvalue = 0
    
    static async initialize(audioContext, constraints) {

        TestLatRingBuf.buttonHandlers()

        try {
            
            let stream = await navigator.mediaDevices.getUserMedia(constraints)

            TestLatRingBuf.ac = audioContext
            
            await TestLatRingBuf.ac.audioWorklet.addModule(MeasureProcessor)

            const mic_source = TestLatRingBuf.ac.createMediaStreamSource(stream)

            TestLatRingBuf.worklet_node = new AudioWorkletNode(TestLatRingBuf.ac, 'measure-processor', { outputChannelCount: [1] })
            TestLatRingBuf.worklet_node.channelCount = 1

            // For Safari 16 and above when using echocancellation to false
            // the input is dramatically reduced
            let defaultGain = 1
            if (isSafari && safariVersion > 16) {
                defaultGain = 50
            }
            const gainNode = TestLatRingBuf.ac.createGain()
            gainNode.gain.value = defaultGain

            mic_source.connect(gainNode)

            gainNode.connect(TestLatRingBuf.worklet_node)            

            TestLatRingBuf.worklet_node.port.onmessage = function (e) {
                TestLatRingBuf.displayResults(e)
            }

        } catch (e) {
            console.log(e)
        }
    }

    static buttonHandlers() {
        TestLatRingBuf.btnstart = document.getElementById('btn-start')
        TestLatRingBuf.btnstart.onclick = TestLatRingBuf.startTest
    }

    static displayResults(e){
        if(TestLatRingBuf.running && e.data.latency){
            TestLatRingBuf.latvalue = Number(e.data.latency * 1000).toFixed(2)
            TestLatRingBuf.btnstart.innerHTML = `STOP <span class='badge badge-info'>lat: ${TestLatRingBuf.latvalue} ms.</span>`
            displayLatencyUI(TestLatRingBuf.latvalue)
        }        
    }

    static startTest() {
        TestLatRingBuf.latvalue = 0
        TestLatRingBuf.worklet_node.connect(TestLatRingBuf.ac.destination)
        TestLatRingBuf.btnstart.innerText = 'STOP'
        TestLatRingBuf.btnstart.onclick = TestLatRingBuf.stopTest
        TestLatRingBuf.running = true
    }

    static async stopTest() {
        if(TestLatRingBuf.latvalue && TestLatRingBuf.latvalue !== 0){
            localStorage.setItem('latency', TestLatRingBuf.latvalue)
            TestLatRingBuf.btnstart.innerHTML = `START <span class='badge badge-info'>lat: ${TestLatRingBuf.latvalue} ms.</span>`
        } else {
            TestLatRingBuf.btnstart.innerHTML = 'START'
        }
        TestLatRingBuf.worklet_node.disconnect(TestLatRingBuf.ac.destination)
        TestLatRingBuf.btnstart.onclick = TestLatRingBuf.startTest
        TestLatRingBuf.running = false
    }
}