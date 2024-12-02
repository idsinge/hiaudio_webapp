import DynamicModal from '../../../../common/js/modaldialog'
import Metronome from './metronome'

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
            if(valid_num >= 0){
                metronome.tempo = valid_num
                tempo.textContent = metronome.tempo
            }
        })
    }
}

const accentChangeHandler = () => {
    const accent = document.getElementById('accent')
    accent.textContent = metronome.accent
    const accentChangeButtons = document.querySelectorAll(`[data-id='accent-change']`)
    for (let i = 0; i < accentChangeButtons.length; i++) {
        accentChangeButtons[i].addEventListener('click', function() {
            const val_add = parseInt(this.dataset.change)
            const valid_num = metronome.accent + val_add
            if(valid_num >= 0){
                metronome.accent = valid_num
                accent.textContent = metronome.accent
            }
        })
    }
}

const barChangeHandler = () => {
    const bar = document.getElementById('bar')
    bar.textContent = metronome.barLength
    const barChangeButtons = document.querySelectorAll(`[data-id='bar-change']`)
    for (let i = 0; i < barChangeButtons.length; i++) {
        barChangeButtons[i].addEventListener('click', function() {
            const val_add = parseInt(this.dataset.change)
            const valid_num = metronome.barLength + val_add
            if(valid_num >= 0){
                metronome.barLength = valid_num
                bar.textContent = metronome.barLength
            }
        })
    }
}

const swingChangeHandler = () => {
    const swing = document.getElementById('swing')
    swing.textContent = metronome.swing
    const swingChangeButtons = document.querySelectorAll(`[data-id='swing-change']`)
    for (let i = 0; i < swingChangeButtons.length; i++) {
        swingChangeButtons[i].addEventListener('click', function() {
            const val_add = parseInt(this.dataset.change)
            const valid_num = metronome.swing + val_add
            if(valid_num >= 0){
                metronome.swing = valid_num
                swing.textContent = metronome.swing
            }
        })
    }
}

const animateMetronomeIcon = () => {
    document.getElementById('metronome-stick').classList.add('metronome-animated')
}

const stopMetronomeIcon = () => {
    document.getElementById('metronome-stick').classList.remove('metronome-animated')
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
    document.getElementById('metronome-icon').hidden = !metronome.activate
}

const openMetronomeDialog = () => {
    DynamicModal.dynamicModalDialog(
        `<div class="metronome-controls">
            <div class="metronome-switch custom-control custom-switch">
                <input type="checkbox" class="custom-control-input" id="metronomeSwitch">
                <label class="custom-control-label" for="metronomeSwitch">Activate</label>
            </div>
        </div>
        <div class="metronome-controls">
            <button id="play-button" class="metronome-button play-pause-metronome-button btn-success">
                <div id="play-pause-icon" class="play-metronome-icon"></div>
            </button>
        </div>        
        <div class="metronome-controls">
        
            <button data-id="tempo-change" class="metronome-button" data-change="-5">-5</button>
            <button data-id="tempo-change" class="metronome-button" data-change="-1">-</button>

            <div class="tempo-container">
                <div id="tempo" class="number-metronome">120</div>
                <div class="subtext-metronome">bpm</div>
            </div>

            <button data-id="tempo-change" class="metronome-button" data-change="+1">+</button>
            <button data-id="tempo-change" class="metronome-button" data-change="+5">+5</button>
        </div>    

        <div class="metronome-controls">
            <button data-id="accent-change" class="metronome-button" data-change="-1">-</button>
            <div class="bar-container">
                <div id="accent" class="number-metronome">4</div>
                <div class="subtext-metronome">accent</div>
            </div>
            <button data-id="accent-change" class="metronome-button" data-change="+1">+</button>
        </div>

        <div class="metronome-controls">
            <button data-id="bar-change" class="metronome-button" data-change="-1">-</button>
            <div class="tempo-container">
                <div id="bar" class="number-metronome">0</div>
                <div class="subtext-metronome">1/8 in bar</div>
            </div>
            <button data-id="bar-change" class="metronome-button" data-change="+1">+</button>
        </div>

        <div class="metronome-controls">
            <button data-id="swing-change" class="metronome-button" data-change="-5">-5</button>
            <button data-id="swing-change" class="metronome-button" data-change="-1">-</button>

            <div class="tempo-container">
                <div id="swing" class="number-metronome">0</div>
                <div class="subtext-metronome">swing</div>
            </div>

            <button data-id="swing-change" class="metronome-button" data-change="+1">+</button>
            <button data-id="swing-change" class="metronome-button" data-change="+5">+5</button>
        </div>
       `,
        null,
        '',
        'Close',
        'Metronome',
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
    document.getElementById('metronome-icon').hidden = !metronome.activate
    
    document.getElementById('play-button').onclick = playButtonHandler
    tempoChangeHandler()
    accentChangeHandler()
    barChangeHandler()
    swingChangeHandler()
    metronomeSwitch.onclick = activationHandler
}

export const triggerMetronomeButton = () => {
    return `<li class='nav-item'>
    <a class='nav-link' href='#' id='trigger-metronome-btn' data-toggle='modal' 
      data-toggle='popover' data-placement='bottom'  title='Tic Tac...' data-content='Volume please'>
      METRONOME <div id="metronome-icon" class="m-container" hidden>
        <div class="m-body">
        </div>
        <div id="metronome-stick" class="m-stick"></div>
      </div>
    </a>
  </li>`}

export const triggerLMetronomeHandler = () => {

    document.getElementById('trigger-metronome-btn').onclick = () => {
        openMetronomeDialog()
    }
}