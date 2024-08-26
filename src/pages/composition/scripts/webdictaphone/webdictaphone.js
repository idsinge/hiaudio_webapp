import { setCanvasData } from './webdictaphone_ui'

/* SOURCE: https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone */

const gainSlider = document.getElementById('gainSliderTestMic')

export class TestMic {
    
    constructor() {
        this.CURRENT_GAIN_TEST_MIC = 1
        this.audioCtxTestMic = null
        this.analyser = null
        this.recordGainNode = null
    }  

    init(recordGainNode, audioctxt){
        this.recordGainNode = recordGainNode
        this.audioCtxTestMic = audioctxt
        this.getUserMediaOnSuccess()
    }
    getUserMediaOnSuccess(){

        const micGain = localStorage.getItem('micgain')
        this.CURRENT_GAIN_TEST_MIC = micGain ? parseInt(micGain) : this.CURRENT_GAIN_TEST_MIC
       
        this.analyser = this.audioCtxTestMic.createAnalyser()
        this.analyser.fftSize = 2048
       
        this.recordGainNode.connect(this.analyser)
       
        this.draw()
        this.uiHandlers()
    }
    draw(){
        const me  = this
        const bufferLength = this.analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        this.analyser.getByteTimeDomainData(dataArray)
        setCanvasData(bufferLength, dataArray)
        requestAnimationFrame(() => {
            me.draw()
        })
    }
    async connectSource(){
        this.analyser.connect(this.audioCtxTestMic.destination)
    }
    disconnectSource(){
        this.analyser.disconnect()
    }
    uiHandlers(){
        const me = this
        $('#testMicrophoneModal').on('show.bs.modal', (event) => {
            gainSlider.value = me.CURRENT_GAIN_TEST_MIC
            document.getElementById('current-input-gain-test-mic').value = me.CURRENT_GAIN_TEST_MIC
        })
        $('#testMicrophoneModal').on('hide.bs.modal', async (event) => {
            me.analyser.disconnect()
        })
        
        gainSlider.addEventListener('input', function () {
            const newGainValue = parseFloat(this.value)
            me.CURRENT_GAIN_TEST_MIC = newGainValue
            me.recordGainNode.gain.value = newGainValue
            localStorage.setItem('micgain', newGainValue)
            document.getElementById('current-input-gain-test-mic').value = newGainValue
        })
    }
}