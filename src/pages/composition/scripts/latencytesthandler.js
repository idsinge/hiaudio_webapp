import { TestLatencyMLS } from './latencymls/test'
import { TestLatScriptProc } from './latencymeasure/testlatency'
import { TestLatRingBuf } from './latencyadenot/testlatency'
import { MEDIA_CONSTRAINTS } from '../../../common/js/utils'
import DynamicModal from '../../../common/js/modaldialog'
import { playlist } from './composition'

export const TEST_LAT_BTN_ID = 'testlatencybtn'

export const TEST_LAT_MLS_BTN_ID = 'testlatencymlsbtn'

export const triggerTestLatencyButton = () => {
    return `<li class="nav-item">
    <a class="nav-link" href="#" id="trigger-lat-test-btn" data-toggle="modal" 
      data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
      LATENCY TEST</a>
  </li>`}


const testLatFinishCallback = () => {
    if (TestLatRingBuf.running) {
        TestLatRingBuf.stopTest()
    }
    if (TestLatScriptProc.startbutton.innerText === 'STOP') {
        TestLatScriptProc.finishTest()
    }
}

const openLatencyTestDialog = () => {

    DynamicModal.dynamicModalDialog(
        `<p>Place your mic as close as possible to the speakers/headphones.</p><br>
      <a class="nav-link" href="#" id="${TEST_LAT_BTN_ID}" data-toggle="modal" 
        data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected">
        Test Latency</a><br>
      <a class="nav-link" href="#" id="${TEST_LAT_MLS_BTN_ID}" data-toggle="modal" 
        data-toggle="popover" data-placement="bottom"  title="Testing ..." data-content="No input detected"></a><br>    
      <a id="btn-start" class="nav-link" href="#">TEST LATENCY
        
        </a><br>`,
        null,
        '',
        'Close',
        'Latency Test',
        'bg-success',
        testLatFinishCallback
    )
    if (!TestLatencyMLS.audioContext) {
        TestLatencyMLS.initialize(playlist.ac, TEST_LAT_MLS_BTN_ID)
        TestLatRingBuf.initialize(playlist.ac, MEDIA_CONSTRAINTS) // Adenot
        TestLatScriptProc.initialize(playlist.ac)
    } else {
        TestLatencyMLS.displayStart()
        TestLatScriptProc.displayStart()
        TestLatRingBuf.buttonHandlers()
    }
}

export const triggerLatencyTestHandler = () => {
    document.getElementById('trigger-lat-test-btn').onclick = openLatencyTestDialog
}