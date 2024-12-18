import { getAllTracksInCompositionList } from './home_helper'

let tracks_dictionary = null
let composition_dictionary = null

let AUTO_PLAY = false

const getCurrentTrack = () => {
    const audio = document.getElementById('waveform')
    const currentTrack = audio.getAttribute('data-currentaudio')
    return currentTrack
}

const changeFaIcon = (trackid, startPlaying) => {
    const iconElement = document.querySelector(`[data-trackid='${trackid}']`)?.firstChild.nextSibling
    if (iconElement) {
        if (startPlaying) {
            iconElement.classList.remove('fa-play')
            iconElement.classList.add('fa-pause')
        } else {
            iconElement.classList.remove('fa-pause')
            iconElement.classList.add('fa-play')
        }
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

const clickOnSameTrack = () => {
    const isPlaying = wavesurfer.isPlaying()
    if (!isPlaying) {
        wavesurfer.play()
    } else {
        wavesurfer.pause()
    }
}

const checkAudioPausedNotSameTrack = (trackid) => {
    const isPlaying = wavesurfer.isPlaying()
    if (isPlaying) {
        changeFaIcon(trackid, true)
        wavesurfer.pause()
    } else {
        changeFaIcon(trackid, true)
    }
}

const playTrackButtonHandler = (trackid) => {
    const currentTrack = getCurrentTrack()
    let is_same_track = currentTrack === trackid
    if (is_same_track) {
        clickOnSameTrack()
    } else {
        checkAudioPausedNotSameTrack(trackid)
        loadAudioTrack(trackid, true)
        updateCurrentPlayInfo(trackid)
    }
}

const loadTrackSuccess = (audioSrc, trackid, doPlay) => {
    AUTO_PLAY = doPlay
    const audio = document.getElementById('waveform')
    audio.setAttribute('data-currentaudio', trackid)
    wavesurfer.seekTo(0)
    wavesurfer.load(audioSrc)
}

const loadTrackError = (trackid, error) => {
    const playElemUI = document.querySelector(`[data-trackid='${trackid}']`)
    playElemUI.onclick = null
    const iconElement = playElemUI.firstChild.nextSibling
    iconElement.classList.remove('fa-play')
    iconElement.classList.add('fa-times')
    changeFloatingIcon(false)
    alert('Error playing track: ' + error)
}

const updateCurrentPlayInfo = (track_id) => {
    const track_title = tracks_dictionary[track_id].title
    const comp_title = composition_dictionary[tracks_dictionary[track_id].comp_uuid].title
    document.getElementById('current-play-info').textContent = comp_title + ' / ' + track_title
}

export const prepareAudioTrackPlaylist = (compositionsList) => {
    const all_tracks = getAllTracksInCompositionList(compositionsList)
    if (all_tracks.tracksList.length) {
        document.querySelector('.sticky-container').style.display = 'block'
        tracks_dictionary = all_tracks.tracksDictionary
        composition_dictionary = all_tracks.compositionsDictionary
        const maxRandomPos = all_tracks.tracksList.length
        const randomInt = Math.floor(Math.random() * maxRandomPos)
        const lastTrackId = all_tracks.tracksList[randomInt].uuid
        updateCurrentPlayInfo(lastTrackId)
        loadAudioTrack(lastTrackId)
    }
}

export const loadAudioTrack = async (trackid, doPlay) => {
    const audioSrc = window.location.origin + '/trackfile/' + trackid
    // error 1 : 
    //const audioSrc = 'teto' +window.location.origin + '/trackfile/' + trackid
    //error 2:
    //const audioSrc = window.location.origin + '/trackfile/' + 'trackid'
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

const fabPlayButtonIsCurrentTrack = () => {
    const isPlaying = wavesurfer.isPlaying()
    if (isPlaying) {
        wavesurfer.pause()
    } else {
        wavesurfer.play()
    }
}

export const fabPlayButtonClickHandler = () => {
    const floatingPlayButton = document.getElementById('playfloatingbutton')
    floatingPlayButton.onclick = () => {
        fabPlayButtonIsCurrentTrack()
    }
}

const initializeWavesurfer = () => {
    return WaveSurfer.create({
        container: '#waveform',
        responsive: true,
        height: 80,
        waveColor: '#007bff',
        progressColor: '#6610f2',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
    })
}

const wavesurfer = initializeWavesurfer()

wavesurfer.on('finish', () => {
    const currentTrack = getCurrentTrack()
    changeFloatingIcon(false)
    changeFaIcon(currentTrack, false)
})

wavesurfer.on('ready', (duration) => {
    if (AUTO_PLAY) {
        wavesurfer.play()
    } else {
        changeFloatingIcon(false)
    }
})

wavesurfer.on('play', () => {
    const currentTrack = getCurrentTrack()
    changeFloatingIcon(true)
    changeFaIcon(currentTrack, true)
})

wavesurfer.on('pause', () => {
    const currentTrack = getCurrentTrack()
    changeFloatingIcon(false)
    changeFaIcon(currentTrack, false)
})

wavesurfer.on('error', (error) => {
    if(error){
        const currentTrack = getCurrentTrack()
        loadTrackError(currentTrack, error)
    }
}) 
