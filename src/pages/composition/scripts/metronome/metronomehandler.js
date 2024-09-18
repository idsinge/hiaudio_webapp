import DynamicModal from '../../../../common/js/modaldialog'
import { initMetronome, playMetronome, audioContext, isPlaying } from './metronome'


export let tempo = 80.0;  // tempo (in beats per minute)
export let noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note

const metronomeFinishCallback = () => {
    console.log('finish callback')
}

const tempoSliderHandler = (event) => {
    tempo = event.target.value
    document.getElementById('showTempo').innerText = event.target.value
}

const playButtonHandler = () => {
    document.getElementById('play-metronome-btn').innerText = playMetronome()
}

const noteResolutionHandler = (event) => {
    noteResolution = event.target.selectedIndex
}

const openMetronomeDialog = () => {
    DynamicModal.dynamicModalDialog(
        `<div id="controls">
            <div>
                <button id="play-metronome-btn" type="button" class="btn btn-primary btn-lg">play</button>
            </div><br>
            <div id="tempoBox">
                Tempo: <span id="showTempo">80</span>BPM 
                <input id="tempo-slider" type="range" min="30.0" max="160.0" step="1" value="80" style="height: 20px; width: 200px">
            </div>
            <div>
                Resolution:
                <select id="note-res-select">
                    <option>16th notes
                    <option>8th notes
                    <option>Quarter notes
                </select>
            </div>
        </div>
       `,
        null,
        '',
        'Close',
        'Metronome',
        'bg-success',
        metronomeFinishCallback
    )
    if (!audioContext) {
        initMetronome()
    }
    if (isPlaying) {
        document.getElementById('play-metronome-btn').innerText = 'stop'
    }
    document.getElementById('play-metronome-btn').onclick = playButtonHandler
    document.getElementById('tempo-slider').oninput = tempoSliderHandler
    document.getElementById('note-res-select').onchange = noteResolutionHandler

}

export const triggerMetronomeButton = () => {
    return `<li class='nav-item'>
    <a class='nav-link' href='#' id='trigger-metronome-btn' data-toggle='modal' 
      data-toggle='popover' data-placement='bottom'  title='Tic Tac...' data-content='Volume please'>
      METRONOME</a>
  </li>`}

export const triggerLMetronomeHandler = () => {

    document.getElementById('trigger-metronome-btn').onclick = () => {
        openMetronomeDialog()
    }
}