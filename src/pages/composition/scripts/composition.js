import { TrackHandler } from './track_handler'
import { FileUploader } from './fileuploader'
import WaveformPlaylist from './waveform-playlist.umd'
import { Recorder } from './record'
import { triggerTestLatencyButton, triggerLatencyTestHandler } from './latencytesthandler'
import DynamicModal from '../../../common/js/modaldialog'
import { activateGoHomeLink, isSafari } from '../../../common/js/utils'

const queryString = window.location.search
export const COMPOSITION_ID = queryString.split('compositionId=')[1]
export let USER_PERMISSION = false

export const setUserPermission = (permission) => {
  USER_PERMISSION = permission
}

export let playlist = null

export let trackHandler = null
export let fileUploader = null

export const createWaveformPlaylist = (audCtxt) => {
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
  triggerLatencyTestHandler()
}

export const recorder = new Recorder()

const compositionId = COMPOSITION_ID

const testMicButtonForSafari = () => {
  const safariVersionIndex = navigator.userAgent.indexOf('Version/')
  const versionString = navigator.userAgent.substring(safariVersionIndex + 8)
  const safariVersion = parseFloat(versionString)
  if (isSafari && safariVersion > 16) {
    return `<li class="nav-item">
              <a class="nav-link" href="#" id="testmicrophone" data-toggle="modal" data-target="#testMicrophoneModal">
                <i class="fa-solid fa-microphone"></i> TEST MIC
              </a>
            </li>`
  } else {
    return ''
  }
}

const createTestButtons = () => {
  document.getElementById('useroptions').innerHTML = `${triggerTestLatencyButton()}${testMicButtonForSafari()}`
}

activateGoHomeLink()
createTestButtons()

if (compositionId === 'demopage') {
  DynamicModal.dynamicModalDialog(
    `Be careful, the music you record or upload won't be saved, as you are not a registered user and this is only a test feature!`,
    null,
    '',
    'Close',
    'Warning!',
    'bg-warning'
  )
}

recorder.init(compositionId)