import { TrackHandler } from './track_handler'
import { FileUploader } from './fileuploader'
import WaveformPlaylist from './waveform-playlist.umd'
import { Recorder } from './record'
import { triggerTestLatencyButton, triggerLatencyTestHandler } from './latencytesthandler'
import DynamicModal from '../../../common/js/modaldialog'
import { activateGoHomeLink } from '../../../common/js/utils'
import detectBrowser from '../../../common/js/detect-browser.js'

const queryString = window.location.search
export const COMPOSITION_ID = queryString.split('compositionId=')[1]
export let USER_PERMISSION = false
export let MIC_ERROR = null

export const setUserPermission = (permission) => {
  USER_PERMISSION = permission
}

export const setMicError = (err) => {
  MIC_ERROR = err
}

export let playlist = null

export let trackHandler = null
export let fileUploader = null

export const createWaveformPlaylist = (audCtxt, stream) => {
  playlist = WaveformPlaylist({
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
      width: 200,
      widgets: {
        stereoPan: true,
        collapse: false,
        remove: true,
      },
    },
    zoomLevels: [500, 1000, 3000, 5000],
    isAutomaticScroll: true,
    timescale: true,
    ac: audCtxt
  })
  trackHandler = new TrackHandler()
  fileUploader = new FileUploader(COMPOSITION_ID, trackHandler)
  triggerLatencyTestHandler(stream)
}

const browserId = detectBrowser()
export const recorder = new Recorder(browserId)

const compositionId = COMPOSITION_ID

const testMicButtonForSafari = () => {
  const browserVersion = parseInt(recorder.browserId.version)
  if((recorder.browserId.browser === 'safari') && (browserVersion >= 16)) {
    return `<li class='nav-item'>
              <a class='nav-link' href='#' id='testmicrophone' data-toggle='modal' data-target='#testMicrophoneModal'>
                <i class='fa-solid fa-microphone'></i> TEST MIC
              </a>
            </li>`
  } else {
    return ''
  }
}

const createTestButtons = () => {
  document.getElementById('useroptions').innerHTML = `${triggerTestLatencyButton()}${testMicButtonForSafari()}`
}

export const displayHiddenControls = () => {
  const hiddenElems = document.querySelectorAll('.hidden-first')
  if(hiddenElems.length){
    for(let i = 0 ; i < hiddenElems.length; i++){
      hiddenElems[i].classList.add('visible-animate')
    }
  }
}

export const displayMicErrorPopUp =  (err) => {
  DynamicModal.dynamicModalDialog(
      `<p>Please, verify the following error related to your microphone/input: &#10;&#13;</p>
      <p><b><i>${err || MIC_ERROR}</i></b></p>`,
      null,
      '',
      'Close',
      'Warning!',
      'bg-warning'
  )
}

activateGoHomeLink()
createTestButtons()
recorder.init(compositionId)

if (compositionId === 'demopage') {
  document.getElementById('download-mix-btn').hidden = false
  DynamicModal.dynamicModalDialog(
    `Be careful, the music you record or upload won't be saved, as you are not a registered user and this is only a test feature!`,
    null,
    '',
    'Close',
    'Warning!',
    'bg-warning',
    displayHiddenControls
  )
}