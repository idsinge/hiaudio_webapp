import { getAllTracksInCompositionList } from './home_helper'

const changeFaIcon = (trackid, isAudioPaused) => {
    const iconElement = document.querySelector(`[data-trackid='${trackid}']`).firstChild.nextSibling
    if (isAudioPaused) {
        iconElement.classList.remove('fa-play')
        iconElement.classList.add('fa-pause')
    } else {
        iconElement.classList.remove('fa-pause')
        iconElement.classList.add('fa-play')
    }
}

const changeFloatingIcon = (startPlaying) => {
    const floatingPlayButton = document.getElementById('playfloatingbutton').firstChild.nextSibling
    if (startPlaying) {
        floatingPlayButton.classList.remove('fa-play')
        floatingPlayButton.classList.add('fa-pause')
    } else {
        floatingPlayButton.classList.remove('fa-pause')
        floatingPlayButton.classList.add('fa-play')
    }
}

const clickOnSameTrack = (audio, trackid) => {
    if (audio.paused) {
        changeFaIcon(trackid, audio.paused)
        changeFloatingIcon(true)
        audio.play()
    } else {
        changeFaIcon(trackid, audio.paused)
        audio.pause()
        changeFloatingIcon(false)
    }
}

const handleCurrentTrack = (currentTrack, audio, trackid) => {
    let is_same_track = false
    if (currentTrack) {
        if (currentTrack === trackid) {
            is_same_track = true
        } else {
            audio.setAttribute('data-currentaudio', trackid)
        }
    } else {
        audio.setAttribute('data-currentaudio', trackid)
    }
    return is_same_track
}

const checkAudioPausedNotSameTrack = (audio, trackid, currentTrack) => {
    if (!audio.paused) {
        changeFaIcon(trackid, !audio.paused)
        changeFaIcon(currentTrack, audio.paused)
        audio.pause()
    } else {
        currentTrack && changeFaIcon(currentTrack, !audio.paused)
        changeFaIcon(trackid, audio.paused)
    }
}

const playTrackButtonHandler = (trackid) => {
    const audio = document.getElementById('audio_last_track')
    const currentTrack = audio.getAttribute('data-currentaudio')
    let is_same_track = handleCurrentTrack(currentTrack, audio, trackid)
    if (is_same_track) {
        clickOnSameTrack(audio, trackid)
    } else {
        checkAudioPausedNotSameTrack(audio, trackid, currentTrack)
        loadAudioTrack(trackid, doPlay = true)
        changeFloatingIcon(true)
    }
}

const loadTrackSuccess = (audioSrc, trackid, doPlay) => {
    const audio = document.getElementById('audio_last_track')
    const currentTrack = audio.getAttribute('data-currentaudio')
    const source = document.getElementById('audioTrackSource')
    if (!currentTrack) {
        audio.setAttribute('data-currentaudio', trackid)
    }
    source.src = audioSrc
    audio.load()
    if (doPlay) {
        audio.play()
    }
    audio.onerror = (err) => { console.log('onerror', err) } // TODO: not tested
    audio.onended = (event) => {
        changeFloatingIcon(false)
        changeFaIcon(trackid, false)
    }
}

const loadTrackError = (trackid) => {
    const playElemUI = document.querySelector(`[data-trackid='${trackid}']`)
    playElemUI.onclick = null
    const iconElement = playElemUI.firstChild.nextSibling
    iconElement.classList.remove('fa-play')
    iconElement.classList.add('fa-times')
    changeFloatingIcon(false)
    alert('Error playing track')
}

export const prepareAudioTrackPlaylist = (compositionsList) => {
    const all_tracks = getAllTracksInCompositionList(compositionsList)
    if (all_tracks.length) {
        loadAudioTrack(all_tracks[all_tracks.length - 1].uuid)
    }
}

export const loadAudioTrack = async (trackid, doPlay) => {

    const audioSrc = window.location.origin + '/trackfile/' + trackid
    const response = await fetch(audioSrc)
    if (response.ok) {
        loadTrackSuccess(audioSrc, trackid, doPlay)
    } else {
        loadTrackError(trackid)
    }
}

export const setPlayButtonsHandler = () => {
    const elements = document.querySelectorAll('[data-trackid]')
    elements.forEach(element => {
        const trackid = element.getAttribute('data-trackid')
        element.onclick = () => {
            playTrackButtonHandler(trackid)
        }
    })
}

const fabPlayButtonCurrentTrackHandler = () => {
    const audio = document.getElementById('audio_last_track')
    const currentTrack = audio.getAttribute('data-currentaudio')
    if (currentTrack) {
        fabPlayButtonIsCurrentTrack(audio, currentTrack)
    } else {
        if(audio.readyState){
            audio.play()
            changeFloatingIcon(true)
        }
    }
}

const fabPlayButtonIsCurrentTrack = (audio, currentTrack) => {
    if (!audio.paused) {
        audio.pause()
        changeFaIcon(currentTrack, !audio.paused)
        changeFloatingIcon(false)
    } else {
        audio.play()
        changeFaIcon(currentTrack, !audio.paused)
        changeFloatingIcon(true)
    }
}

export const fabPlayButtonClickHandler = () => {
    const floatingPlayButton = document.getElementById('playfloatingbutton')
    floatingPlayButton.onclick = () => {
        fabPlayButtonCurrentTrackHandler()
    }
}