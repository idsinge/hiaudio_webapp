import MeasureProcessor from 'worklet:./processor.js'

const safariVersionIndex = navigator.userAgent.indexOf('Version/')
const versionString = navigator.userAgent.substring(safariVersionIndex + 8)
const safariVersion = parseFloat(versionString)
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export class TestLatRingBuf {

    ac = null

    worklet_node = null

    btnstart = null

    running = false

    latval = null

    static async initialize(audioContext, constraints) {
               
        TestLatRingBuf.buttonHandlers()

        try {
            
            let stream = await navigator.mediaDevices.getUserMedia(constraints)

            //TestLatRingBuf.ac = new AudioContext()
            TestLatRingBuf.ac = audioContext
            
            await TestLatRingBuf.ac.audioWorklet.addModule(MeasureProcessor)

            var mic_source = TestLatRingBuf.ac.createMediaStreamSource(stream)

            TestLatRingBuf.worklet_node = new AudioWorkletNode(TestLatRingBuf.ac, 'measure-processor', { outputChannelCount: [1] });
            TestLatRingBuf.worklet_node.channelCount = 1;

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
        //TestLatRingBuf.btnstop = document.getElementById('btn-stop')
        TestLatRingBuf.btnstart.onclick = TestLatRingBuf.startTest;
        //TestLatRingBuf.btnstop.onclick = TestLatRingBuf.stopTest;
        //TestLatRingBuf.btnstop.disabled = true;
    }

    static displayResults(e){
        if(TestLatRingBuf.running){
            TestLatRingBuf.latvalue = Number(e.data.latency * 1000).toFixed(2)
            //TestLatRingBuf.btnstart.innerHTML += `<span class='badge badge-info'>lat: ${TestLatRingBuf.latvalue} ms.</span>`
            document.getElementById('roundtriplatency-val').innerText = TestLatRingBuf.latvalue + " ms"
        }        
        //document.getElementById('outputlatency-val').innerText = (TestLatRingBuf.ac.outputLatency * 1000) + "ms"
    }

    static async startTest() {
        // /console.log('TestLatRingBuf.ac.state', TestLatRingBuf.ac.state)
        // if(TestLatRingBuf.ac.state === 'suspended'){
        //     await TestLatRingBuf.ac.resume()
        // }
        TestLatRingBuf.worklet_node.connect(TestLatRingBuf.ac.destination)
        //document.getElementById('roundtriplatency-val').hidden = false
        TestLatRingBuf.btnstart.innerText = 'STOP'
        TestLatRingBuf.btnstart.onclick = TestLatRingBuf.stopTest;
        TestLatRingBuf.running = true
        //TestLatRingBuf.btnstop.disabled = false
        //TestLatRingBuf.btnstart.disabled = true
    }

    static async stopTest() {
        localStorage.setItem('latency', TestLatRingBuf.latvalue)
        //document.getElementById('roundtriplatency-val').hidden = true
        TestLatRingBuf.worklet_node.disconnect(TestLatRingBuf.ac.destination)
        //TestLatRingBuf.btnstop.disabled = true
        //TestLatRingBuf.btnstart.disabled = false
        TestLatRingBuf.btnstart.innerText = 'START'
        TestLatRingBuf.btnstart.onclick = TestLatRingBuf.startTest;
        TestLatRingBuf.running = false
    }

}