import { TestLatencyMLS } from './latencymls/test'
import { TestLatScriptProc } from './latencymeasure/testlatency'
import { TestLatRingBuf } from './latencyadenot/testlatency'
import { MEDIA_CONSTRAINTS } from '../../../common/js/utils'
import DynamicModal from '../../../common/js/modaldialog'
import detectBrowser from '../../../common/js/detect-browser.js'
import { playlist } from './composition'

export const TEST_LAT_BTN_ID = 'testlatencybtn'

export const TEST_LAT_MLS_BTN_ID = 'testlatencymlsbtn'

const imageUrl = new URL(
    '../../../common/img/imgtestlatdemo.webp',
    import.meta.url
  );

export const triggerTestLatencyButton = () => {
    return `<li class="nav-item">
    <a class="nav-link" href="#" id="trigger-lat-test-btn" data-toggle="modal" 
      data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
      LATENCY TEST</a>
  </li>`}

const active_lat_test = {mls:true,ringbuf:true,scrptprc:true}

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
    }
    document.getElementById('latinputval').onchange = (event) =>{
        localStorage.setItem('latency', event.target.value)
        document.getElementById('latencyslider').value = event.target.value
    }
}
const openLatencyTestDialog = () => {
    const currentLat = localStorage.getItem('latency')    
    DynamicModal.dynamicModalDialog(
        `<img src="${imageUrl}" class="img-fluid" alt="...">
        <p>Place your mic as close as possible to the speakers/headphones.</p><br>
        ${active_lat_test.mls ? `<a class="nav-link" href="#" id="${TEST_LAT_MLS_BTN_ID}" data-toggle="modal" 
        data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected"></a><br>`: ''}       
        <details>
            <summary>Advanced</summary>
            <br/>
             ${active_lat_test.ringbuf ? `<label for="">Via AudioWorklet: </label>
             <a id="btn-start" class="nav-link" href="#">TEST LATENCY</a><br>` : ''}
             ${active_lat_test.scrptprc ? `<label for="">Via ScriptProcessor: </label>
             <a class="nav-link" href="#" id="${TEST_LAT_BTN_ID}" data-toggle="modal" 
                data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
                Test Latency</a><br>`: ''}
            <p><label for="formControlLatRange">Set the value manually (ms): </label>
                <div class="form-group col-md-5">
                <input id="latinputval" type="number" min="0" max="500" class="form-control" placeholder="${currentLat  || 0}">
                </div>
                <input type="range" min="0" max="500" class="form-control-range" id="latencyslider" value="${currentLat || 0}">
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
    // TODO: improve the way to check the test are initialized
    if (!TestLatencyMLS.audioContext) {
        active_lat_test.mls && TestLatencyMLS.initialize(playlist.ac, TEST_LAT_MLS_BTN_ID)
        active_lat_test.ringbuf && TestLatRingBuf.initialize(playlist.ac, MEDIA_CONSTRAINTS) // Adenot
        active_lat_test.scrptprc && TestLatScriptProc.initialize(playlist.ac)
    } else {
        active_lat_test.mls && TestLatencyMLS.displayStart()
        active_lat_test.scrptprc && TestLatScriptProc.displayStart()
        active_lat_test.ringbuf && TestLatRingBuf.buttonHandlers()
    }
}

export const triggerLatencyTestHandler = () => {
    const browserId = detectBrowser()
    console.log(browserId)
    document.getElementById('trigger-lat-test-btn').onclick = openLatencyTestDialog
}