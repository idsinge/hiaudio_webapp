/* https://github.com/naomiaro/waveform-playlist/blob/master/dist/waveform-playlist/js/record.js */
import { playlist } from './composition'
import { isSafari } from '../../../common/js/utils'
import detectBrowser from '../../../common/js/detect-browser.js'
import { TestMic } from './webdictaphone/webdictaphone'

export class Recorder {
    constructor() {
        this.recordGainNode = null
    }

    init() {
        let userMediaStream
        //const resultsDefault = detectBrowser()
        //console.log(resultsDefault)
        let echoCancel = false
        // if((resultsDefault.os === 'linux' || resultsDefault.os === 'windows') && (resultsDefault.browser === 'chrome')){
        //     echoCancel = true
        // }
        const constraints = { audio: {echoCancellation:echoCancel, noiseSuppression:false, autoGainControl:false, latency: 0, channelCount: 1 }}
        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia)

        const gotStream = (stream) => {            
            userMediaStream = this.getCorrectStreamForSafari(stream)  
            userMediaStream.getTracks().forEach(async function(track) {                
                console.log('getSettings', track.getSettings())
            })
            playlist.initRecorder(userMediaStream, undefined, "Voice Track");
            $(".btn-record").removeClass("disabled")
            this.setRecordGainNodeForTest(this.recordGainNode)
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
    getCorrectStreamForSafari(stream){
        const safariVersionIndex = navigator.userAgent.indexOf('Version/')
        const versionString =  navigator.userAgent.substring(safariVersionIndex + 8)
        const safariVersion = parseFloat(versionString)        
        if(isSafari && safariVersion > 16){
            const micsource = playlist.ac.createMediaStreamSource(stream)
            this.recordGainNode = playlist.ac.createGain()
            micsource.connect(this.recordGainNode)
            const micGain = localStorage.getItem('micgain')
            const defaultGain = micGain ? parseInt(micGain) : 1
            this.recordGainNode.gain.value = defaultGain
            const dest = playlist.ac.createMediaStreamDestination()
            this.recordGainNode.connect(dest)
            return dest.stream
        } else {
            return stream
        }
    }
    setRecordGainNodeForTest(recordGainNode){
        const safariVersionIndex = navigator.userAgent.indexOf('Version/')
        const versionString =  navigator.userAgent.substring(safariVersionIndex + 8)
        const safariVersion = parseFloat(versionString)        
        if(isSafari && safariVersion > 16){
          const testMic = new TestMic()
          testMic.init(recordGainNode)
        }
    }
}
