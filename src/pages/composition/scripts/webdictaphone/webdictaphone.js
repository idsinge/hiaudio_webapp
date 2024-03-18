import { isSafari } from '../../../../common/js/utils'
import { setCanvasData, buttonHandlers, mediaRecorderStopUI } from './webdictaphone_ui'

/* SOURCE: https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone */

const gainSlider = document.getElementById('gainSliderTestMic')

let CURRENT_GAIN_TEST_MIC = 1

let audioCtxTestMic
let analyser
let gainNode

if (navigator.mediaDevices.getUserMedia) {

    const constraints = { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }

    const onSuccess = function (stream) {
        getUserMediaOnSuccess(stream)
    }

    const onError = function (err) {
        console.log('The following error occured: ' + err)
    }

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)

} else {
    console.log('MediaDevices.getUserMedia() not supported on your browser!')
}

const getUserMediaOnSuccess = (stream) => {

    if (!audioCtxTestMic) {
        audioCtxTestMic = new AudioContext()
    }

    const micsource = audioCtxTestMic.createMediaStreamSource(stream)

    gainNode = audioCtxTestMic.createGain()
    gainNode.gain.value = CURRENT_GAIN_TEST_MIC

    micsource.connect(gainNode)
    analyser = audioCtxTestMic.createAnalyser()
    analyser.fftSize = 2048
    gainNode.connect(analyser)

    const mediaRecorder = new MediaRecorder(stream)

    draw()
    buttonHandlers(mediaRecorder)
    mediaRecoderHandlers(mediaRecorder)
}

const mediaRecoderHandlers = (mediaRecorder) => {
    let chunks = []
    mediaRecorder.onstop = function (event) {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
        chunks = []
        const audioURL = window.URL.createObjectURL(blob)
        mediaRecorderStopUI(audioURL)
    }
    mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data)
    }
}

const draw = () => {
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)
    setCanvasData(bufferLength, dataArray)
    requestAnimationFrame(() => {
        draw()
    })
}

$('#testMicrophoneModal').on('show.bs.modal', async (event) => {
    document.getElementById('current-input-gain-test-mic').value = CURRENT_GAIN_TEST_MIC
    analyser.connect(audioCtxTestMic.destination)
    if (isSafari) {
        console.log(`Audio context state change: ${audioCtxTestMic.state}`)
        if (audioCtxTestMic.state === 'suspended') {
            await audioCtxTestMic.resume()
        }
    }
})

$('#testMicrophoneModal').on('hide.bs.modal', async (event) => {
    analyser.disconnect()
})

gainSlider.addEventListener('input', function () {
    const newGainValue = parseFloat(this.value)
    CURRENT_GAIN_TEST_MIC = newGainValue
    gainNode.gain.value = newGainValue
    document.getElementById('current-input-gain-test-mic').value = newGainValue
})