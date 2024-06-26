import { TrackHandler } from './track_handler'
import { FileUploader } from './fileuploader'
import WaveformPlaylist from './waveform-playlist.umd'
//import { getComposition, doAfterCompositionFetched } from './composition_helper'
import { Recorder } from './record'
import { TestLatencyMLS } from './latencymls/test'
import { TestLatency } from './latencymeasure/testlatency'
import { TestLatRingBuf } from './latencyadenot/testlatency'
import detectBrowser from '../../../common/js/detect-browser.js'
import DynamicModal from '../../../common/js/modaldialog'
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
  triggerLatencyTestHandler()
}

export const recorder = new Recorder()

export const TEST_LAT_BTN_ID = 'testlatencybtn'

export const TEST_LAT_MLS_BTN_ID = 'testlatencymlsbtn'

const compositionId = COMPOSITION_ID

const testLatFinishCallback = () => {
  if(TestLatRingBuf.running){
    console.log('Adenot Test Running')
    TestLatRingBuf.stopTest()
  }
  if(TestLatency.startbutton.innerText === 'STOP'){
    TestLatency.finishTest()
  }  
}

const openLatencyTestDialog = () => {
  
  DynamicModal.dynamicModalDialog(
    `<p>Place your mic as close as possible to the speakers/headphones.</p><br>
    <a class="nav-link" href="#" id="${TEST_LAT_MLS_BTN_ID}" data-toggle="modal" 
      data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected"></a><br>    
    <a class="nav-link" href="#" id="btn-start">
      TEST LATENCY</a><span id="roundtriplatency-val" class="badge badge-info"></span><br>
    <a class="nav-link" href="#" id="${TEST_LAT_BTN_ID}" data-toggle="modal" 
      data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
      Test Latency</a><br>`,
    null,
    '',
    'Close',
    'Latency Test',
    'bg-success',
    testLatFinishCallback
  )
  if(!TestLatencyMLS.audioContext){
    TestLatencyMLS.initialize(playlist, TEST_LAT_MLS_BTN_ID)
    TestLatRingBuf.initialize(playlist.ac, MEDIA_CONSTRAINTS) // Adenot
    TestLatency.initialize(playlist.ac)
  } else {
    console.log('here')
    TestLatencyMLS.displayStart()
    TestLatency.displayStart()
    TestLatRingBuf.buttonHandlers()
  }
}

const triggerLatencyTestHandler = () => {
  document.getElementById('trigger-lat-test-btn').onclick = openLatencyTestDialog
}
const testMicButtonForSafari = () => {
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

const triggerTestLatencyButton = () => {
  return `<li class="nav-item">
  <a class="nav-link" href="#" id="trigger-lat-test-btn" data-toggle="modal" 
    data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
    LATENCY TEST</a>
</li>`}


const createTestButtons = () => {
  document.getElementById('useroptions').innerHTML = `${triggerTestLatencyButton()}${testMicButtonForSafari()}`
}

activateGoHomeLink()
createTestButtons()
const browserId = detectBrowser()
console.log(browserId)

// if(compositionId === 'demopage'){ 
//   alert(`WARNING: Be careful, the music you record or upload won't be saved, as you are not a registered user and this is only a test feature!`)  
// }

recorder.init(compositionId)