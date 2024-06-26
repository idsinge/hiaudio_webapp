import { TestLatencyMLS } from './latencymls/test'
import { TestLatScriptProc } from './latencymeasure/testlatency'
import { TestLatRingBuf } from './latencyadenot/testlatency'
import { MEDIA_CONSTRAINTS } from '../../../common/js/utils'
import DynamicModal from '../../../common/js/modaldialog'
import detectBrowser from '../../../common/js/detect-browser.js'
import { playlist } from './composition'

export const TEST_LAT_BTN_ID = 'testlatencybtn'

export const TEST_LAT_MLS_BTN_ID = 'testlatencymlsbtn'

export const triggerTestLatencyButton = () => {
    return `<li class="nav-item">
    <a class="nav-link" href="#" id="trigger-lat-test-btn" data-toggle="modal" 
      data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
      LATENCY TEST</a>
  </li>`}

const active_lat_test = {mls:true,ringbuf:false,scrptprc:false}

const testLatFinishCallback = () => {
    if (active_lat_test.ringbuf && TestLatRingBuf.running) {
        TestLatRingBuf.stopTest()
    }
    if (active_lat_test.scrptprc && TestLatScriptProc.startbutton.innerText === 'STOP') {
        TestLatScriptProc.finishTest()
    }
}

const openLatencyTestDialog = () => {

    DynamicModal.dynamicModalDialog(
        `<p>Place your mic as close as possible to the speakers/headphones.</p><br>
        ${active_lat_test.scrptprc ? `<a class="nav-link" href="#" id="${TEST_LAT_BTN_ID}" data-toggle="modal" 
        data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
        Test Latency</a><br>`: ''}      
        ${active_lat_test.mls ? `<a class="nav-link" href="#" id="${TEST_LAT_MLS_BTN_ID}" data-toggle="modal" 
        data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected"></a><br>`: ''}
        ${active_lat_test.ringbuf ? `<a id="btn-start" class="nav-link" href="#">TEST LATENCY</a><br>` : ''}`,
        null,
        '',
        'Close',
        'Latency Test',
        'bg-success',
        testLatFinishCallback
    )
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