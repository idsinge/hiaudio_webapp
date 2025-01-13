import { getAllTracksInCompositionList } from './home_helper'

let tracks_dictionary = null
let composition_dictionary = null

let AUTO_PLAY = false

let wavesurfer = null
let reader = null

const controller = new AbortController()
const signal = controller.signal

const waveSurferOptions = {
    container: '#waveform',
    responsive: true,
    height: 80,
    waveColor: '#007bff',
    progressColor: '#6610f2',
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    cursorWidth: 0
}

const getCurrentTrack = () => {
    const audio = document.getElementById('waveform')
    const currentTrack = audio.getAttribute('data-currentaudio')
    return currentTrack
}

const changeFaIcon = (trackid, startPlaying) => {
    const iconElement = document.querySelector(`[data-trackid='${trackid}']`)?.firstChild.nextSibling
    if (iconElement) {
        if (startPlaying) {
            iconElement.classList.replace('fa-play', 'fa-volume-down')
        } else {
            iconElement.classList.replace('fa-volume-down','fa-play')
            iconElement.classList.remove('fa-beat')
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
    const isPlaying = wavesurfer?.isPlaying()
    if (isPlaying) {
        changeFaIcon(trackid, false)
        wavesurfer.pause()
    }
}

const playTrackButtonHandler = (trackid) => {
    
    const currentTrack = getCurrentTrack()
    let is_same_track = (currentTrack === trackid)
    if (is_same_track) {
        clickOnSameTrack()
    } else {
        changeFaIcon(currentTrack, false)
        checkAudioPausedNotSameTrack(trackid)
        loadAudioTrack(trackid, true)
    }
}

const loadTrackSuccess = (audioSrc, trackid, doPlay) => {
    AUTO_PLAY = doPlay
    wavesurfer = initializeWavesurfer()
    addEventHandlersToWavesurfer()
    wavesurfer.seekTo(0)
    wavesurfer.load(audioSrc)
}

const loadTrackError = (trackid, error) => {
    const playElemUI = document.querySelector(`[data-trackid='${trackid}']`)
    if(playElemUI){
        playElemUI.onclick = null
        const iconElement = playElemUI.firstChild.nextSibling
        iconElement.classList.remove('fa-volume-down')
        iconElement.classList.remove('fa-beat')
        iconElement.classList.add('fa-times')
    }
    changeFloatingIcon(false)
    const trackInfo = getTrackInfo(trackid)
    document.getElementById('current-play-info').textContent = ' Error loading track at: ' + trackInfo.comp_title
    wavesurfer.destroy()
}

const updateCurrentPlayInfo = (track_id) => {
    const trackInfo =  getTrackInfo(track_id)
    document.getElementById('current-play-info').textContent = trackInfo.comp_title + ' / ' + trackInfo.track_title
}

const getTrackInfo = (track_id) => {
    const track_title = tracks_dictionary[track_id].title
    const comp_title = composition_dictionary[tracks_dictionary[track_id].comp_uuid].title
    return {track_title, comp_title}
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
        loadAudioTrack(lastTrackId)
    }
}

export const loadAudioTrack = async (trackid, doPlay) => {
    const audio = document.getElementById('waveform')
    audio.setAttribute('data-currentaudio', trackid)
    if(wavesurfer){
        wavesurfer.destroy()
        unsubscribeEvents()
    }
    document.getElementById('current-play-info').textContent = 'Downloading track ... 0%'
    const floatingPlayButton = document.getElementById('playfloatingbutton')
    floatingPlayButton.classList.add('isDisabled')    
    
    const audioSrc = window.location.origin + '/trackfile/' + trackid
       
    reader && reader.cancel()   
    
    const response = await fetch(audioSrc, {signal})
    reader = response.body.getReader()   
    const contentLength = +response.headers.get('Content-Length')    
    let receivedLength = 0
    let chunks = []
    while(true) {
    const {done, value} = await reader.read()
    if (done) {
        document.getElementById('current-play-info').textContent = 'Loading ...'
        break
    }
    chunks.push(value)
    receivedLength += value.length
    const percentage = Math.round(receivedLength/contentLength*100)+'%'    
    document.getElementById('current-play-info').textContent = `Downloading track ... ${percentage}`
    }
    if (response.ok) {
        loadTrackSuccess(audioSrc, trackid, doPlay)
    } else {
        loadTrackError(trackid, 'Fetching error')
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
    return WaveSurfer.create(waveSurferOptions)
}

const unsubscribeEvents = () => {
    wavesurfer.unAll()
}

const addEventHandlersToWavesurfer = () => {
    wavesurfer.on('finish', () => {
        const currentTrack = getCurrentTrack()
        changeFloatingIcon(false)
        changeFaIcon(currentTrack, false)
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

    wavesurfer.on('ready', (duration) => {
        const floatingPlayButton = document.getElementById('playfloatingbutton')
        floatingPlayButton.classList.remove('isDisabled')
        const currentTrack = getCurrentTrack()
        updateCurrentPlayInfo(currentTrack)
        if (AUTO_PLAY) {
            wavesurfer.play()
        } else {
            changeFloatingIcon(false)
        }
    })
    
    wavesurfer.on('error', (error) => {
        if(error){
            const currentTrack = getCurrentTrack()
            loadTrackError(currentTrack, error)
        }
    }) 
}