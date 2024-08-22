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