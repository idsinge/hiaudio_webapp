import DynamicModal from '../../../../common/js/modaldialog'
import {Metronome} from './metronome'

export let metronome = null

const metronomeFinishCallback = () => {
    if(metronome?.isRunning){
        metronome.stop()
    }
}

const tempoChangeHandler = () => {
    const tempo = document.getElementById('tempo')
    tempo.textContent = metronome.tempo
    const tempoChangeButtons = document.querySelectorAll(`[data-id='tempo-change']`)
    for (let i = 0; i < tempoChangeButtons.length; i++) {
        tempoChangeButtons[i].addEventListener('click', function() {
            const val_add = parseInt(this.dataset.change)
            const valid_num = metronome.tempo + val_add
            if(valid_num >= 5 && valid_num <= 500){
                metronome.tempo = valid_num
                tempo.textContent = metronome.tempo
                updateMetronomeBlink()
            }
        })
    }
}

const beatsperbarChangeHandler = () => {
    const beatsperbar = document.getElementById('beatsperbar')
    beatsperbar.textContent = metronome.beatsPerBar
    const beatsperbarChangeButtons = document.querySelectorAll(`[data-id='beatsperbar-change']`)
    for (let i = 0; i < beatsperbarChangeButtons.length; i++) {
        beatsperbarChangeButtons[i].addEventListener('click', function() {
            const val_add = parseInt(this.dataset.change)
            const valid_num = metronome.beatsPerBar + val_add
            if(valid_num >= 1 && valid_num <= 50){
                metronome.beatsPerBar = valid_num
                beatsperbar.textContent = metronome.beatsPerBar
                document.getElementById('topnumbersignature').textContent = metronome.beatsPerBar
                updateMetronomeBlink()
            }
        })
    }
}

const notes_duration_symbols = {1:'\uE1D2', 2:'\uE1D3', 4:'\uE1D5', 8:'\uE1D7',16:'\uE1D9'} //Standard Music Font Layout: Unicode for musical symbols
const noteDurationChangeHandler = () => {
    const notedurationselectable = document.getElementById('notedurationselectable')
    notedurationselectable.onchange = () => {
        metronome.noteDuration = notedurationselectable.value
        document.getElementById('bottomnumbersignature').textContent = notedurationselectable.value
        document.getElementById('noteMusicSymbol').textContent = notes_duration_symbols[notedurationselectable.value]
        updateMetronomeBlink()
    }
}

const updateMetronomeBlink = () => {
    if(metronome?.isRunning){
        const secondsPerBeat = (60 / metronome.tempo) * (4 / metronome.noteDuration)
        const blinkDuration = secondsPerBeat
        const icon = document.getElementById('metronome-fonticon')
        icon.style.animation = `blink ${blinkDuration}s infinite`
    }
}

const animateMetronomeIcon = () => {
    document.getElementById('metronome-fonticon').classList.remove('text-success')
    document.getElementById('metronome-fonticon').classList.add('text-warning')
    updateMetronomeBlink()
}

const stopMetronomeIcon = () => {
    document.getElementById('metronome-fonticon').classList.remove('text-warning')
    if(metronome.activate){
        document.getElementById('metronome-fonticon').classList.add('text-success')
    }
    const icon = document.getElementById('metronome-fonticon')
    icon.style.animation = 'none'
}

const playButtonHandler = () => {
    
    const playPauseIcon = document.getElementById('play-pause-icon')
    metronome.startStop()
    if (metronome.isRunning) {
        playPauseIcon.className = 'pause-metronome-icon'
    }
    else {
        playPauseIcon.className = 'play-metronome-icon'
    }
}

const activationHandler = () => {
    metronome.activate = !metronome.activate
    if(metronome.activate){
        document.getElementById('metronome-fonticon').classList.add('text-success')
    } else {
        document.getElementById('metronome-fonticon').classList.remove('text-success')
    }
}

const openMetronomeDialog = () => {
    DynamicModal.dynamicModalDialog(
        `<div class='subtext-metronome'>Time signature: <span id='topnumbersignature'>4</span>/<span id='bottomnumbersignature'>4</span></div>
        <div class='metronome-controls'>
            <div class='metronome-switch custom-control custom-switch'>
                <input type='checkbox' class='custom-control-input' id='metronomeSwitch'>
                <label class='custom-control-label' for='metronomeSwitch'>Activate</label>
            </div>
        </div>
        <div class='metronome-controls'>
            <button id='play-button' type='button' class='btn metronome-button play-pause-metronome-button btn-success'>
                <div id='play-pause-icon' class='play-metronome-icon'></div>
            </button>
        </div>        
        <div class='metronome-controls'>
        
            <button data-id='tempo-change' type='button' class='btn btn-secondary metronome-button' data-change='-5'>-5</button>
            <button data-id='tempo-change' type='button' class='btn btn-light metronome-button' data-change='-1'>-</button>

            <div class='tempo-container'>
                <div id='tempo' class='number-metronome'>120</div>
                <div class='subtext-metronome'>bpm</div>
            </div>

            <button data-id='tempo-change' type='button' class='btn btn-light metronome-button' data-change='+1'>+</button>
            <button data-id='tempo-change' type='button' class='btn btn-secondary metronome-button' data-change='+5'>+5</button>
        </div>
        <div class='metronome-controls'>
            <button data-id='beatsperbar-change' type='button' class='btn btn-light metronome-button' data-change='-1'>-</button>
            <div class='bar-container'>
                <div id='beatsperbar' class='number-metronome'>4</div>
                <div class='subtext-metronome'>&nbsp;beats / bar</div>                
            </div>
            <button data-id='beatsperbar-change' type='button' class='btn btn-light metronome-button' data-change='+1'>+</button>            
        </div>
        <div class='metronome-controls'>
            <div class='tempo-container'>
                <label class='subtext-metronome' for='notedurationselectable'>Note value:&nbsp;</label>
                <span id='noteMusicSymbol' class='music-symbols'>
                    &#xE1D3;
                </span>
                <select class='custom-select' id='notedurationselectable'>
                    <option value='1'>1 = Whole note (semibreve)</option>
                    <option value='2'>2 = Minim</option>
                    <option value='4' selected>4 = Crotchet</option>
                    <option value='8'>8 = Quaver</option>
                    <option value='16'>16 = Semi-Quaver</option>
                </select>
            </div>
        </div>`,
        null,
        '',
        'Close',
        `<i class='fas fa-music'></i>&nbsp;&nbsp;<span>Metronome</span>`,
        'bg-secondary',
        metronomeFinishCallback
    )
    if (!metronome) {
        metronome = new Metronome()
        metronome.init()
        metronome.callback_start = animateMetronomeIcon
        metronome.callback_stop = stopMetronomeIcon
    }
    if (metronome.isRunning) {
        document.getElementById('play-pause-icon').className = 'pause-metronome-icon'
    }
    
    const metronomeSwitch = document.getElementById('metronomeSwitch')    
    metronomeSwitch.checked = metronome.activate
    
    document.getElementById('play-button').onclick = playButtonHandler
    tempoChangeHandler()
    beatsperbarChangeHandler()
    noteDurationChangeHandler()
    metronomeSwitch.onclick = activationHandler
    document.getElementById('topnumbersignature').textContent = metronome.beatsPerBar
    document.getElementById('bottomnumbersignature').textContent = metronome.noteDuration
    document.getElementById('notedurationselectable').value = metronome.noteDuration
    document.getElementById('noteMusicSymbol').textContent = notes_duration_symbols[metronome.noteDuration]
}

export const triggerMetronomeButton = () => {
    return `<li class='nav-item'>
    <a class='nav-link' href='#' id='trigger-metronome-btn' data-toggle='modal' 
      data-toggle='popover' data-placement='bottom'  title='Tic Tac...' data-content='Volume please'>
      METRONOME  <i id='metronome-fonticon' class='fas fa-square'>&nbsp;</i></a>
  </li>`}

export const triggerLMetronomeHandler = () => {

    document.getElementById('trigger-metronome-btn').onclick = () => {
        openMetronomeDialog()
    }
}