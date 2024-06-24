import { TrackHandler } from './track_handler'
import { FileUploader } from './fileuploader'
import WaveformPlaylist from './waveform-playlist.umd'
//import { getComposition, doAfterCompositionFetched } from './composition_helper'
import { Recorder } from './record'
import { TestLatencyMLS } from './latencymls/test'
//import { TestLatency } from './latencymeasure/testlatency'
import { TestLatency } from './latencyadenot/testlatency'
import detectBrowser from '../../../common/js/detect-browser.js'
import { activateGoHomeLink, isSafari, MEDIA_CONSTRAINTS } from '../../../common/js/utils'

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
      width:200,
      widgets: {
        stereoPan: true,
        collapse:false,      
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
  TestLatencyMLS.initialize(playlist, TEST_LAT_BTN_ID)
  //TestLatency.initialize(playlist.ac, MEDIA_CONSTRAINTS) // Adenot
}

export const recorder = new Recorder()

export const TEST_LAT_BTN_ID = 'testlatencybtn'

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
  <a class="nav-link" href="#" id="${TEST_LAT_BTN_ID}" data-toggle="modal" 
    data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
    Test Latency</a>
</li>`}

// Buttons for Paul Adenot method
// const newTestLatencyButton  = () => {  
//   return `<li class="nav-item">
//   <div id=latency-ui>
//         <button id=btn-start>Start measure</button>
//         <button id=btn-stop>Stop measure</button>
//         <p>Measured rountrip: <span id=roundtriplatency-val hidden>...</span></p>
//       </div>
// </li>`}

const createTestButtons = () => {
  document.getElementById('useroptions').innerHTML = `${newTestLatencyButton()}${testMicButtonForSafari()}`
}

activateGoHomeLink()
createTestButtons()
const browserId = detectBrowser()
console.log(browserId)
//if(browserId.os === 'iphone' || browserId.os === 'ipad' || browserId.os === 'android'){
  //TestLatency.initialize(playlist.ac, MEDIA_CONSTRAINTS)
//} else {
  //TestLatencyMLS.initialize(playlist, TEST_LAT_BTN_ID)
//}

// if(compositionId === 'demopage'){ 
//   alert(`WARNING: Be careful, the music you record or upload won't be saved, as you are not a registered user and this is only a test feature!`)  
// }

recorder.init(compositionId)

//getComposition(compositionId, doAfterCompositionFetched)

