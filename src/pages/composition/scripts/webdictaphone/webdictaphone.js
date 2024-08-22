import { setCanvasData } from './webdictaphone_ui'

/* SOURCE: https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone */

const gainSlider = document.getElementById('gainSliderTestMic')

export class TestMic {
    
    constructor() {
        this.CURRENT_GAIN_TEST_MIC = 1
        this.audioCtxTestMic = null
        this.analyser = null
        this.gainNode = null
        this.recordGainNode = null
    }  

    init(recordGainNode){
        
        const me  = this
        
        if (navigator.mediaDevices.getUserMedia) {

            const constraints = { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }

            const onSuccess = function (stream) {
                me.recordGainNode = recordGainNode
                me.getUserMediaOnSuccess(stream)
            }

            const onError = function (err) {
                console.log('The following error occured: ' + err)
            }

            navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)

        } else {
            console.log('MediaDevices.getUserMedia() not supported on your browser!')
        }
    }
    getUserMediaOnSuccess(stream){

        const micGain = localStorage.getItem('micgain')
        this.CURRENT_GAIN_TEST_MIC = micGain ? parseInt(micGain) : this.CURRENT_GAIN_TEST_MIC
        
        if (!this.audioCtxTestMic) {
            this.audioCtxTestMic = new AudioContext()
        }
    
        const micsource = this.audioCtxTestMic.createMediaStreamSource(stream)
    
        this.gainNode = this.audioCtxTestMic.createGain()
        this.gainNode.gain.value = this.CURRENT_GAIN_TEST_MIC
    
        micsource.connect(this.gainNode)
        this.analyser = this.audioCtxTestMic.createAnalyser()
        this.analyser.fftSize = 2048
        this.gainNode.connect(this.analyser)
        const dest = this.audioCtxTestMic.createMediaStreamDestination()
        this.gainNode.connect(dest)
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
            me.gainNode.gain.value = newGainValue
            me.recordGainNode.gain.value = newGainValue
            localStorage.setItem('micgain', newGainValue)
            document.getElementById('current-input-gain-test-mic').value = newGainValue
        })
    }
}