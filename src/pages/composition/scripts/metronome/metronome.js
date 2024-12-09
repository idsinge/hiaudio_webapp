export class Metronome {

    constructor() {
        this.audioContext = null
        this.notesInQueue = [] // Notes that have been put into the web audio and may or may not have been played yet {note, time}
        this.currentBeatInBar = 0
        this.beatsPerBar = 4
        this.noteDuration = 4 // Denominator: the note value of each beat (e.g., 4 = quarter, 8 = eighth, etc.)
        this.tempo = 120
        this.lookahead = 25 // How frequently to call the scheduling function (in milliseconds)
        this.scheduleAheadTime = 0.1 // How far ahead to schedule audio (sec)
        this.nextNoteTime = 0.0 // When the next note is due
        this.isRunning = false
        this.timerWorker = null
        this.activate = false
        this.callback_start = null
        this.callback_stop = null
        this.prevBeatBar = 4 // to control if you change the beat in the moment currentBeatInBar is a multiple of beatsPerBar
    }

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
        this.timerWorker.postMessage({ interval: this.lookahead })
    }

    nextNote() {
        // Advance current note and time based on note duration
        const secondsPerBeat = (60.0 / this.tempo) * (4 / this.noteDuration)
        this.nextNoteTime += secondsPerBeat // Add note duration time to the last beat time
        this.currentBeatInBar++ // Advance the beat number, wrap to zero
        if ((this.currentBeatInBar === this.beatsPerBar) || (this.prevBeatBar !== this.beatsPerBar)) {
            this.currentBeatInBar = 0
            this.prevBeatBar = this.beatsPerBar
        }
    }

    scheduleNote(beatNumber, time) {
        // Push the note on the queue, even if we're not playing
        this.notesInQueue.push({ note: beatNumber, time: time })
        const osc = this.audioContext.createOscillator()
        const envelope = this.audioContext.createGain()
        // Set a higher frequency for the first beat of the bar
        osc.frequency.value = beatNumber === 0 ? 1000 : 800
        envelope.gain.value = 1
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001)
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02)
        osc.connect(envelope)
        envelope.connect(this.audioContext.destination)
        osc.start(time)
        osc.stop(time + 0.03)
    }

    scheduler() {
        // While there are notes that will need to play before the next interval, schedule them and advance the pointer
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeatInBar, this.nextNoteTime)
            this.nextNote()
        }
    }

    start(startTime = 0) {
        if (this.isRunning) return

        if (this.audioContext === null) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }

        this.isRunning = true

        // Calculate seconds per beat and align to the global timeline
        const secondsPerBeat = (60.0 / this.tempo) * (4 / this.noteDuration)
        const beatsElapsed = Math.floor(startTime / secondsPerBeat)
        const timeInCurrentBar = startTime % (secondsPerBeat * this.beatsPerBar)

        this.currentBeatInBar = beatsElapsed % this.beatsPerBar
        this.nextNoteTime = this.audioContext.currentTime + 0.05 - timeInCurrentBar

        this.timerWorker.postMessage('start')

        if (this.callback_start) this.callback_start()
    }

    stop() {
        this.isRunning = false
        this.timerWorker.postMessage('stop')
        if (this.callback_stop) this.callback_stop()
    }

    startStop(startTime = 0) {
        if (this.isRunning) {
            this.stop()
        } else {
            this.start(startTime)
        }
    }
}