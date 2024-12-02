export default class Metronome {

    audioContext = null
    notesInQueue = []
    currentQuarterNote = 0    
    tempo = 120
    lookahead = 25          // How frequently to call scheduling function (in milliseconds)
    scheduleAheadTime = 0.1   // How far ahead to schedule audio (sec)
    nextNoteTime = 0.0     // when the next note is due
    isRunning = false
    timerWorker = null
    swing = 0 // a value for 'swing' between zero and one hundred
    accent = 4
    barLength = 8
    currentEighthNote = 0
    activate = false

    init() {
        this.timerWorker = new Worker(
            new URL('metronomeworker.js', import.meta.url),
            { type: 'module' }
        )
        this.timerWorker.onmessage = (e) => {
            if (e.data === 'tick') {
                this.scheduler()
            }
        }
        this.timerWorker.postMessage({ 'interval': this.lookahead })
    }

    nextNote() {
        const sw = this.swing / 100
        // Advance current note and time by a quarter note (crotchet if you're posh)
        const secondsPerBeat = 60.0 / this.tempo // Notice this picks up the CURRENT tempo value to calculate beat length.     
        if (this.currentEighthNote == 0) {
            this.nextNoteTime += secondsPerBeat * sw
        }
        else {
            this.nextNoteTime += secondsPerBeat * (1 - sw)
        }
        this.currentQuarterNote++    // Advance the beat number, wrap to zero
        if (this.currentQuarterNote == (this.barLength)) {
            this.currentQuarterNote = 0
        }
        if (this.currentEighthNote == 0) {
            this.currentEighthNote = 1
        }
        else { this.currentEighthNote = 0 }
    }

    scheduleNote(beatNumber, time) {
        // push the note on the queue, even if we're not playing.
        this.notesInQueue.push({ note: beatNumber, time: time })        
        const osc = this.audioContext.createOscillator()
        const envelope = this.audioContext.createGain()
        if (this.currentQuarterNote == 0) {
            osc.frequency.value = 2000
        }
        else {
            osc.frequency.value = (beatNumber % this.accent == 0) ? 1000 : 800
        }
        envelope.gain.value = 1
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001)
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02)
        osc.connect(envelope)
        envelope.connect(this.audioContext.destination)
        osc.start(time)
        osc.stop(time + 0.03)
    }

    scheduler() {
        // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentQuarterNote, this.nextNoteTime)
            this.nextNote()
        }
    }

    start() {
        if (this.isRunning) return

        if (this.audioContext == null) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }

        this.isRunning = true

        this.currentQuarterNote = 0
        this.nextNoteTime = this.audioContext.currentTime + 0.05

        this.timerWorker.postMessage('start')

        document.getElementById('metronome-stick').classList.add('metronome-animated')
    }

    stop() {
        this.isRunning = false
        this.timerWorker.postMessage('stop')
        document.getElementById('metronome-stick').classList.remove('metronome-animated')
    }

    startStop() {
        if (this.isRunning) {
            this.stop()
        }
        else {
            this.start()
        }
    }
}