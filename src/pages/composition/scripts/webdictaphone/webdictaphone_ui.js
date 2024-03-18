const canvasRealTime = document.querySelector('.visualizer-test-mic')
const canvasCtx = canvasRealTime.getContext('2d')
const mainSection = document.querySelector('.main-controls-test-mic')

export const setCanvasData = (bufferLength, dataArray) => {
    canvasRealTime.width = mainSection.offsetWidth
    const WIDTH = canvasRealTime.width
    const HEIGHT = canvasRealTime.height

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

    canvasCtx.lineTo(canvasRealTime.width, canvasRealTime.height / 2)
    canvasCtx.stroke()
}

export const buttonHandlers = (mediaRecorder) => {
    const recordButton = document.querySelector('.record-test-mic')
    const stopButton = document.querySelector('.stop-test-mic')
    stopButton.disabled = true
    recordButton.onclick = function () {
        mediaRecorder.start()
        recordButton.style.background = 'red'
        stopButton.disabled = false
        recordButton.disabled = true
    }

    stopButton.onclick = function () {
        mediaRecorder.stop()
        recordButton.style.background = ''
        recordButton.style.color = ''
        stopButton.disabled = true
        recordButton.disabled = false
    }   
}


export const mediaRecorderStopUI = (audioURL) => {
    const clipContainer = createClipContainer(audioURL)
    const soundClips = document.querySelector('.sound-clips-test-mic')
    soundClips.appendChild(clipContainer)
}

const createClipContainer = (audioURL) => {

    const clipLabel = createClipNameLabel()
    const audioElem = createAudioElem(audioURL)
    const deleteButton = createDeleteButton()

    const clipContainer = document.createElement('article')
    clipContainer.classList.add('clip-test-mic')
    clipContainer.appendChild(audioElem)
    clipContainer.appendChild(clipLabel)
    clipContainer.appendChild(deleteButton)

    return clipContainer
}

const createClipNameLabel = () => {
    const clipName = 'test (' + new Date().toLocaleTimeString() + ')'   
    const clipLabel = document.createElement('span')
    clipLabel.textContent = clipName
    return clipLabel
}

const createAudioElem = (audioURL) => {
    const audioElem = document.createElement('audio')
    audioElem.setAttribute('controls', '')
    audioElem.classList.add('audio-test-mic')
    audioElem.controls = true
    audioElem.src = audioURL
    return audioElem
}

const createDeleteButton = () => {
    const deleteButton = document.createElement('button')
    deleteButton.textContent = 'Delete'
    deleteButton.className = 'button-test-mic delete'
    deleteButton.onclick = function (e) {
        e.target.closest('.clip-test-mic').remove()
    }
    return deleteButton
}