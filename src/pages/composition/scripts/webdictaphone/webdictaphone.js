import { isSafari } from '../../../../common/js/utils'

/* SOURCE: https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone */
const record = document.querySelector('.record-test-mic')
const stop = document.querySelector('.stop-test-mic')
const soundClips = document.querySelector('.sound-clips-test-mic')
const canvas = document.querySelector('.visualizer-test-mic')
const mainSection = document.querySelector('.main-controls-test-mic')
const gainSlider = document.getElementById('gainSliderTestMic')

let CURRENT_GAIN_TEST_MIC = 1

// Disable stop button while not recording
stop.disabled = true

// Visualiser setup - create web audio api context and canvas
let audioCtx
const canvasCtx = canvas.getContext('2d')

let analyser
let gainNode

// Main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {

    const constraints = { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }
    let chunks = []

    let onSuccess = function (stream) {
        if (!audioCtx) {
            audioCtx = new AudioContext()
        }
    
        const source = audioCtx.createMediaStreamSource(stream)
    
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
            
        // Create a GainNode to control the gain
        gainNode = audioCtx.createGain()
        // Set the desired gain value (experiment with different values)
        gainNode.gain.value = CURRENT_GAIN_TEST_MIC
    
        //source.connect(analyser)
    
        // Connect the microphone source to the gain node
        source.connect(gainNode)
    
        gainNode.connect(analyser)
    
        // Connect the gain node to the audio context destination (e.g., speakers)
        //gainNode.connect(audioCtx.destination)
    
        const mediaRecorder = new MediaRecorder(stream)

        visualize()

        record.onclick = function () {
            mediaRecorder.start()
            //console.log(mediaRecorder.state)
            //console.log('Recorder started.')
            record.style.background = 'red'

            stop.disabled = false
            record.disabled = true
        }

        stop.onclick = function () {
            mediaRecorder.stop()
            //console.log(mediaRecorder.state)
            //console.log('Recorder stopped.')
            record.style.background = ''
            record.style.color = ''

            stop.disabled = true
            record.disabled = false
        }

        mediaRecorder.onstop = function (e) {
            //console.log('Last data to read (after MediaRecorder.stop() called).')

            const clipName = 'test (' + new Date().toLocaleTimeString() + ')'
            const clipContainer = document.createElement('article')
            const clipLabel = document.createElement('span')
            const audio = document.createElement('audio')
            audio.classList.add('audio-test-mic')
            const deleteButton = document.createElement('button')

            clipContainer.classList.add('clip-test-mic')
            audio.setAttribute('controls', '')
            deleteButton.textContent = 'Delete'
            deleteButton.className = 'button-test-mic delete'
            clipLabel.textContent = clipName

            clipContainer.appendChild(audio)
            clipContainer.appendChild(clipLabel)
            clipContainer.appendChild(deleteButton)
            soundClips.appendChild(clipContainer)

            audio.controls = true
            const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
            chunks = []
            const audioURL = window.URL.createObjectURL(blob)
            audio.src = audioURL
            //console.log('recorder stopped')

            deleteButton.onclick = function (e) {
                e.target.closest('.clip-test-mic').remove()
            }
        }

        mediaRecorder.ondataavailable = function (e) {
            console.log('hey')
            chunks.push(e.data)
        }
    }

    let onError = function (err) {
        console.log('The following error occured: ' + err)
    }

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)
} else {
    console.log('MediaDevices.getUserMedia() not supported on your browser!')
}

function visualize() {
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    draw()

    function draw() {
        canvas.width = mainSection.offsetWidth

        const WIDTH = canvas.width
        const HEIGHT = canvas.height

        requestAnimationFrame(draw)

        analyser.getByteTimeDomainData(dataArray)

        canvasCtx.fillStyle = 'rgb(200, 200, 200)'
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

        canvasCtx.lineWidth = 2
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)'

        canvasCtx.beginPath()

        let sliceWidth = (WIDTH * 1.0) / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0
            let y = (v * HEIGHT) / 2

            if (i === 0) {
                canvasCtx.moveTo(x, y)
            } else {
                canvasCtx.lineTo(x, y)
            }

            x += sliceWidth
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2)
        canvasCtx.stroke()
    }
}

$('#testMicrophoneModal').on('show.bs.modal', async (event) => {
    document.getElementById('current-input-gain-test-mic').value = CURRENT_GAIN_TEST_MIC    
    analyser.connect(audioCtx.destination)
    if (isSafari) {
        console.log(`Audio context state change: ${audioCtx.state}`)
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume()
        }
    }
})

$('#testMicrophoneModal').on('hide.bs.modal', async (event) => {
    analyser.disconnect()
})

// Add an event listener to the range input to update the gain value when it changes
gainSlider.addEventListener('input', function () {
    const newGainValue = parseFloat(this.value)
    CURRENT_GAIN_TEST_MIC = newGainValue
    gainNode.gain.value = newGainValue
    document.getElementById('current-input-gain-test-mic').value = newGainValue    
})