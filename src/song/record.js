/* https://github.com/naomiaro/waveform-playlist/blob/master/dist/waveform-playlist/js/record.js */
import { playlist } from './song'


export class Recorder {

    init() {
        let userMediaStream
        // const constraints = { audio: true }
        const constraints = {  }

        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia)

        const gotStream = (stream) => {
            console.log("gotStrem", stream);
            userMediaStream = stream
            playlist.initRecorder(userMediaStream)
            $(".btn-record").removeClass("disabled")
        }

        const logError = (err) => {
            console.log("error on getusermedi");
            console.error(err);
        }

        if (navigator.mediaDevices) {
            console.log("mediadevices", navigator.mediaDevices);
            // navigator.mediaDevices.getUserMedia(constraints)
            navigator.mediaDevices.getUserMedia()
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
