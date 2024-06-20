import MeasureProcessor from 'worklet:./processor.js'

const safariVersionIndex = navigator.userAgent.indexOf('Version/')
const versionString = navigator.userAgent.substring(safariVersionIndex + 8)
const safariVersion = parseFloat(versionString)
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export class TestLatency {

    ac = null

    worklet_node = null

    btnstart = null

    btnstop = null

    latval = null

    static async initialize(audioContext, constraints) {
               
        TestLatency.buttonHandlers()

        try {
            
            let stream = await navigator.mediaDevices.getUserMedia(constraints)

            TestLatency.ac = new AudioContext()
            //TestLatency.ac = audioContext
            
            await TestLatency.ac.audioWorklet.addModule(MeasureProcessor)

            var mic_source = TestLatency.ac.createMediaStreamSource(stream)

            TestLatency.worklet_node = new AudioWorkletNode(TestLatency.ac, 'measure-processor', { outputChannelCount: [1] });
            TestLatency.worklet_node.channelCount = 1;

            // For Safari 16 and above when using echocancellation to false
            // the input is dramatically reduced
            let defaultGain = 1
            if (isSafari && safariVersion > 16) {
                defaultGain = 50
            }
            const gainNode = TestLatency.ac.createGain()
            gainNode.gain.value = defaultGain

            mic_source.connect(gainNode)

            gainNode.connect(TestLatency.worklet_node)            

            TestLatency.worklet_node.port.onmessage = function (e) {
                TestLatency.displayResults(e)
            }

        } catch (e) {
            console.log(e)
        }
    }

    static buttonHandlers() {
        TestLatency.btnstart = document.getElementById('btn-start')
        TestLatency.btnstop = document.getElementById('btn-stop')
        TestLatency.btnstart.onclick = TestLatency.startTest;
        TestLatency.btnstop.onclick = TestLatency.stopTest;
        TestLatency.btnstop.disabled = true;
    }

    static displayResults(e){
        TestLatency.latvalue = (e.data.latency * 1000)
        document.getElementById('roundtriplatency-val').innerText = TestLatency.latvalue + " ms"
        //document.getElementById('outputlatency-val').innerText = (TestLatency.ac.outputLatency * 1000) + "ms"
    }

    static async startTest() {
        console.log(TestLatency.ac.state)
        // if(TestLatency.ac.state === 'suspended'){
        //     await TestLatency.ac.resume()
        // }
        TestLatency.worklet_node.connect(TestLatency.ac.destination)
        document.getElementById('roundtriplatency-val').hidden = false        
        TestLatency.btnstop.disabled = false
        TestLatency.btnstart.disabled = true
    }

    static async stopTest() {
        localStorage.setItem('latency', TestLatency.latvalue)
        document.getElementById('roundtriplatency-val').hidden = true
        TestLatency.worklet_node.disconnect(TestLatency.ac.destination)
        TestLatency.btnstop.disabled = true
        TestLatency.btnstart.disabled = false
    }

}