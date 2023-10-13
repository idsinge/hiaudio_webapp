import { TrackHandler } from './track_handler'
import { FileUploader } from './fileuploader'
import WaveformPlaylist from 'waveform-playlist'
import { getComposition, doAfterCompositionFetched } from './composition_helper'
import { Recorder } from './record'
import { TestLatency } from './latencymeasure/testlatency'

const queryString = window.location.search
export const COMPOSITION_ID = queryString.split('compositionId=')[1]

const goHomeLink = document.getElementById('goHome')
if(window.location.host === 'localhost:80' || window.location.origin === 'http://localhost'){
  goHomeLink.href = window.location.origin + '/index.html'
} else {
  goHomeLink.href = window.location.origin
}
  
export let USER_INFO = null
export let USER_PERMISSION = false

export const setUserPermission = (permission) => {
  USER_PERMISSION = permission
}

export const playlist = WaveformPlaylist({
  samplesPerPixel: 3000,
  waveHeight: 100,
  container: document.getElementById('playlist'),
  state: 'cursor',
  colors: {
    waveOutlineColor: '#E0EFF1',
    timeColor: 'grey',
    fadeColor: 'black'
  },
  controls: {
    show: true,
    width:200,
    widgets: {
      stereoPan: true,
      collapse:false,      
      remove: true,
    },
  },
  zoomLevels: [500, 1000, 3000, 5000],
  isAutomaticScroll: true,
  timescale: true
})

export const trackHandler = new TrackHandler()
export const fileUploader = new FileUploader(COMPOSITION_ID, trackHandler)
export const recorder = new Recorder()

const compositionId = COMPOSITION_ID
const createTestLatencyButton = () => {
  document.getElementById('useroptions').innerHTML = `<li class="nav-item">
  <a class="nav-link" href="#" id="testlatency" data-toggle="modal">Test Latency</a>
</li>
 `
}

createTestLatencyButton()
TestLatency.initialize()

if(compositionId === 'demopage'){ 
  alert(`WARNING: Be careful, the music you record or upload won't be saved, as you are not a registered user and this is only a test feature!`)  
}
getComposition(compositionId, doAfterCompositionFetched)

