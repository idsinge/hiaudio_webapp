/* https://github.com/naomiaro/waveform-playlist/blob/master/dist/waveform-playlist/js/record.js */
import { createWaveformPlaylist, playlist } from './composition'
import { getComposition, doAfterCompositionFetched } from './composition_helper'
import { MEDIA_CONSTRAINTS } from '../../../common/js/utils'
import { TestMic } from './webdictaphone/webdictaphone'
import {initEventEmitter, enableUpdatesOnEmitter} from './eventemitter'

let AudioContext = window.AudioContext || window.webkitAudioContext || false

export class Recorder {
    constructor(browserId) {
        this.recordGainNode = null
        this.browserId = browserId
    }

    init(compositionId) {
        let userMediaStream
        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia)

        const gotStream = (stream) => {
            const audCtxt = new AudioContext({ latencyHint: 0 })
            createWaveformPlaylist(audCtxt, stream)
            userMediaStream = this.getCorrectStreamForSafari(stream)  
            // userMediaStream.getTracks().forEach(async function(track) {
            //     console.log('Record Track ', track)
            //     console.log('Record Track Settings', track.getSettings())
            //     console.log('Record Track Capabilities', track.getCapabilities())
            // })
            playlist.initRecorder(userMediaStream, undefined, "Voice Track")
            $(".btn-record").removeClass("disabled")
            this.setRecordGainNodeForTest(this.recordGainNode)
            initEventEmitter()
            enableUpdatesOnEmitter()
            getComposition(compositionId, doAfterCompositionFetched)
        }

        const logError = (err) => {
            console.error(err)
            const audCtxt = new AudioContext({ latencyHint: 0 })
            createWaveformPlaylist(audCtxt)
            initEventEmitter()
            enableUpdatesOnEmitter()
            getComposition(compositionId, doAfterCompositionFetched)
        }

        if (navigator.mediaDevices) {            
            navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)            
                .then(gotStream)
                .catch(logError)
        } else if (navigator.getUserMedia && 'MediaRecorder' in window) {
            navigator.getUserMedia(
                MEDIA_CONSTRAINTS,
                gotStream,
                logError
            )
        }
    }
    getCorrectStreamForSafari(stream){
        const browserVersion = parseInt(this.browserId.version)
        if((this.browserId.browser === 'safari') && (browserVersion >= 16)) {
            const micsource = playlist.ac.createMediaStreamSource(stream)
            this.recordGainNode = playlist.ac.createGain()
            micsource.connect(this.recordGainNode)
            const micGain = localStorage.getItem('micgain')
            const defaultGain = micGain ? parseInt(micGain) : 1
            this.recordGainNode.gain.value = defaultGain
            const dest = playlist.ac.createMediaStreamDestination()
            dest.channelCount = 1
            this.recordGainNode.connect(dest)
            return dest.stream
        } else {
            return stream
        }
    }
    setRecordGainNodeForTest(recordGainNode){
        const browserVersion = parseInt(this.browserId.version)
        if((this.browserId.browser === 'safari') && (browserVersion >= 16)) {
          const testMic = new TestMic()
          testMic.init(recordGainNode, playlist.ac)
        }
    }
}
