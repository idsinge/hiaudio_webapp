import { TestLatencyMLS } from './latencymls/test'
import DynamicModal from '../../../common/js/modaldialog'
import detectBrowser from '../../../common/js/detect-browser.js'
import { playlist, MIC_ERROR, displayMicErrorPopUp } from './composition'

export const TEST_LAT_BTN_ID = 'testlatencybtn'

export const TEST_LAT_MLS_BTN_ID = 'testlatencymlsbtn'

let latencyTestInitialized = false

const browserId = detectBrowser()

const imageUrl = new URL('../../../common/img/imgtestlatdemo.jpg?as=webp', import.meta.url)

export const displayLatencyUI = (value) =>{
    const uielem = document.getElementById('current-lat-val')
    if(uielem){
        uielem.innerText = value
    }
}

export const triggerTestLatencyButton = () => {
    return `<li class='nav-item'>
    <a class='nav-link' href='#' id='trigger-lat-test-btn' data-toggle='modal' 
      data-toggle='popover' data-placement='bottom'  title='Testing ...' data-content='No input detected'>
      LATENCY TEST</a>
  </li>`}

let active_lat_test = {mls:true}

const latencyWarningModal = `<div class="modal fade" id="latencyTestWarning" tabindex="-1" aria-labelledby="latencyTestWarningLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-warning">
              <h5 class="modal-title" id="latencyTestWarning">Latency Test Issue</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
                <p>It seems there's a problem trying to estimate the latency. Please check the audio settings of your device carefully.</p> 
                <!-- If you have any issue you can also visit our support page. <p>More information at: <span> <a href="${window.location.origin}/static/support.html" target="_blank">${window.location.origin}/static/support.html</a></span></p> -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
    </div>`

const manualSetLatencyHandler = () => {
    document.getElementById('latencyslider').onchange = (event) =>{
        localStorage.setItem('latency', event.target.value) 
        document.getElementById('latinputval').value = event.target.value
        displayLatencyUI(event.target.value)
    }
    document.getElementById('latinputval').onchange = (event) =>{
        localStorage.setItem('latency', event.target.value)
        document.getElementById('latencyslider').value = event.target.value
        displayLatencyUI(event.target.value)
    }
}
const openLatencyTestDialog = (stream) => {
    const debugCanvas = document.location.search.indexOf('debug') !== -1
    const currentLat = localStorage.getItem('latency')    
    DynamicModal.dynamicModalDialog(
        `<img src='${imageUrl}' class='mx-auto d-block visible-animate' alt='...' width='266' height='266'>
        <p>Place your mic as close as possible to the speakers/headphones.</p>
        <p class='alert alert-danger'><b>WARNING!</b> Be careful with the volume as a noise will be played through the speakers.</p>
        <p>${currentLat ? '<i>Current latency: ' + '<span id="current-lat-val">'+currentLat+'</span>' + ' ms.</i>': ''}</p>
        ${active_lat_test.mls ? `<a class='nav-link' href='#' id='${TEST_LAT_MLS_BTN_ID}' data-toggle='modal' 
        data-toggle='popover' data-placement='bottom'  title='Testing ...' data-content='No input detected'></a><br>`: ''}       
        <details ${debugCanvas?'':'hidden'}>
            <summary>Advanced</summary>
            <br/>
            <p><label for='formControlLatRange'>Set the value manually (ms): </label>
                <div class='form-group col-md-5'>
                <input id='latinputval' type='number' min='0' max='500' class='form-control' placeholder='${currentLat  || 0}'>
                </div>
                <input type='range' min='0' max='500' class='form-control-range' id='latencyslider' value='${currentLat || 0}'>
            </p>
        </details>
        ${latencyWarningModal}
       `,
        null,
        '',
        'Close',
        'Latency Test',
        'bg-success',
        null
    )
    manualSetLatencyHandler()
    
    if (!latencyTestInitialized) {
        latencyTestInitialized = true
        active_lat_test.mls && TestLatencyMLS.initialize(playlist.ac, stream, TEST_LAT_MLS_BTN_ID, debugCanvas, browserId)
    } else {
        active_lat_test.mls && TestLatencyMLS.displayStart()
    }
}

let wakeLock = null
const enableWakeLock = async() => {
  if ('wakeLock' in navigator) {    
    try {
      wakeLock = await navigator.wakeLock.request('screen')
      console.log('Wake Lock Activated')
    } catch (err) {
      wakeLock = false
      // The Wake Lock request has failed - usually system related, such as battery.
      console.log('Error', err)
    }
  }
}

export const triggerLatencyTestHandler = (stream) => {
    console.log(browserId)
    document.getElementById('trigger-lat-test-btn').onclick =  async() => {
        if(!MIC_ERROR){
            if(wakeLock === null){
                await enableWakeLock()
            }
            openLatencyTestDialog(stream)
        } else {
            displayMicErrorPopUp()
        }
    } 
}