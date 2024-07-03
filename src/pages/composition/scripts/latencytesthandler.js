import { TestLatencyMLS } from './latencymls/test'
import { TestLatScriptProc } from './latencymeasure/testlatency'
import { TestLatRingBuf } from './latencyadenot/testlatency'
import DynamicModal from '../../../common/js/modaldialog'
import detectBrowser from '../../../common/js/detect-browser.js'
import { playlist } from './composition'

export const TEST_LAT_BTN_ID = 'testlatencybtn'

export const TEST_LAT_MLS_BTN_ID = 'testlatencymlsbtn'

let latencyTestInitialized = false

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

let active_lat_test = {mls:true,ringbuf:true,scrptprc:false}

const testLatFinishCallback = () => {
    if (active_lat_test.ringbuf && TestLatRingBuf.running) {
        TestLatRingBuf.stopTest()
    }
    if (active_lat_test.scrptprc && TestLatScriptProc.startbutton.innerText === 'STOP') {
        TestLatScriptProc.finishTest()
    }
}

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
        `<img src='${imageUrl}' class='img-fluid' alt='...'>
        <p>Place your mic as close as possible to the speakers/headphones.</p>
        <p><b>WARNING!</b> Be careful with the volume as a noise will be played through left speaker.</p>
        <p>${currentLat ? '<i>Current latency: ' + '<span id="current-lat-val">'+currentLat+'</span>' + ' ms.</i>': ''}</p>
        ${active_lat_test.mls ? `<a class='nav-link' href='#' id='${TEST_LAT_MLS_BTN_ID}' data-toggle='modal' 
        data-toggle='popover' data-placement='bottom'  title='Testing ...' data-content='No input detected'></a><br>`: ''}       
        <details ${debugCanvas?'':'hidden'}>
            <summary>Advanced</summary>
            <br/>
             ${active_lat_test.ringbuf ? `<label for=''><i>Test using AudioWorklet: </i></label>
             <a id='btn-start' class='nav-link' href='#'>START</a><br>` : ''}
             ${active_lat_test.scrptprc ? `<label for=''>Via ScriptProcessor: </label>
             <a class='nav-link' href='#' id='${TEST_LAT_BTN_ID}' data-toggle='modal' 
                data-toggle='popover' data-placement='bottom'  title='Testing ...' data-content='No input detected'>
                Test Latency</a><br>`: ''}
            <p><label for='formControlLatRange'>Set the value manually (ms): </label>
                <div class='form-group col-md-5'>
                <input id='latinputval' type='number' min='0' max='500' class='form-control' placeholder='${currentLat  || 0}'>
                </div>
                <input type='range' min='0' max='500' class='form-control-range' id='latencyslider' value='${currentLat || 0}'>
            </p>
        </details>
       `,
        null,
        '',
        'Close',
        'Latency Test',
        'bg-success',
        testLatFinishCallback
    )
    manualSetLatencyHandler()
    
    if (!latencyTestInitialized) {
        latencyTestInitialized = true
        active_lat_test.mls && TestLatencyMLS.initialize(playlist.ac, stream, TEST_LAT_MLS_BTN_ID, debugCanvas)
        active_lat_test.ringbuf && TestLatRingBuf.initialize(playlist.ac, stream)
        active_lat_test.scrptprc && TestLatScriptProc.initialize(playlist.ac)
    } else {
        active_lat_test.mls && TestLatencyMLS.displayStart()
        active_lat_test.ringbuf && TestLatRingBuf.buttonHandlers()
        active_lat_test.scrptprc && TestLatScriptProc.displayStart()
    }
}

export const triggerLatencyTestHandler = (stream) => {
    const browserId = detectBrowser()
    console.log(browserId)
    if(browserId.os === 'ipad' || browserId.os === 'iphone' || browserId.browsers === 'safari') {
        active_lat_test.ringbuf = false
    }
    document.getElementById('trigger-lat-test-btn').onclick = () => {
        openLatencyTestDialog(stream)
    } 
}