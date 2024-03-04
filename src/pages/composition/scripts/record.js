/* https://github.com/naomiaro/waveform-playlist/blob/master/dist/waveform-playlist/js/record.js */
import { playlist } from './composition'

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export class Recorder {

    init() {
        let userMediaStream
        const constraints = { audio: {echoCancellation:false, noiseSuppression:false, autoGainControl:false }}
        if (isSafari) {
            const safariVersionIndex = navigator.userAgent.indexOf('Version/')
            const versionString =  navigator.userAgent.substring(safariVersionIndex + 8)
            const safariVersion = parseFloat(versionString)
            console.log('Safari version:', safariVersion)
            if(safariVersion > 16){
                constraints.audio.echoCancellation = true
            }            
        }
        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia)

        const gotStream = (stream) => {            
            userMediaStream = stream
            playlist.initRecorder(userMediaStream)
            $(".btn-record").removeClass("disabled")
        }

        const logError = (err) => {            
            console.error(err);
        }

        if (navigator.mediaDevices) {            
            navigator.mediaDevices.getUserMedia(constraints)            
                .then(gotStream)
                .catch(logError)
        } else if (navigator.getUserMedia && 'MediaRecorder' in window) {
            navigator.getUserMedia(
                constraints,
                gotStream,
                logError
            )
        }
    }
}
