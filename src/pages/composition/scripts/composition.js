import { TrackHandler } from './track_handler'
import { FileUploader } from './fileuploader'
import WaveformPlaylist from './waveform-playlist.umd'
import { getComposition, doAfterCompositionFetched } from './composition_helper'
import { Recorder } from './record'
import { TestLatencyMLS } from './latencymls/test'
import { activateGoHomeLink, isSafari } from '../../../common/js/utils'

const queryString = window.location.search
export const COMPOSITION_ID = queryString.split('compositionId=')[1]
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

const testMicButtonForSafari  = () => {
  const safariVersionIndex = navigator.userAgent.indexOf('Version/')
  const versionString =  navigator.userAgent.substring(safariVersionIndex + 8)
  const safariVersion = parseFloat(versionString)
  if(isSafari && safariVersion > 16){   
    return `<li class="nav-item">
              <a class="nav-link" href="#" id="testmicrophone" data-toggle="modal" data-target="#testMicrophoneModal">
                <i class="fa-solid fa-microphone"></i> TEST MIC
              </a>
            </li>`
  } else {
    return ''
  }  
}

const newTestLatencyButton  = () => {
  
  return `<li class="nav-item">
  <a class="nav-link" href="#" id="newtestlatency" data-toggle="modal" 
    data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
    Test Latency</a>`  
}

const createTestButtons = () => {
  document.getElementById('useroptions').innerHTML = `${newTestLatencyButton()}${testMicButtonForSafari()}`
}

activateGoHomeLink()
createTestButtons()
TestLatencyMLS.initialize(playlist.ac)

if(compositionId === 'demopage'){ 
  alert(`WARNING: Be careful, the music you record or upload won't be saved, as you are not a registered user and this is only a test feature!`)  
}
getComposition(compositionId, doAfterCompositionFetched)

