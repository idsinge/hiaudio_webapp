import { TrackHandler } from './track_handler'
import { FileUploader } from './fileuploader'
import WaveformPlaylist from 'waveform-playlist'
import { doFetch, getSong, doAfterSongFetched } from './song_helper'
import { Recorder } from './record'

const queryString = window.location.search
export const SONG_ID = parseFloat(queryString.split('songId=')[1])

export const LOADER_ELEM_ID = 'loader'
export let USER_INFO = null
export let USER_PERMISSION = false

export const setUser = (userIs) => {
    USER_INFO = userIs
}
export const setUserPermission = (permission) => {
  USER_PERMISSION = permission
}

export const playlist = WaveformPlaylist({
  samplesPerPixel: 3000,
  waveHeight: 100,
  container: document.getElementById('playlist'),
  state: 'cursor',
  colors: {
    waveOutlineColor: '#E0EFF1',
    timeColor: 'grey',
    fadeColor: 'black'
  },
  controls: {
    show: true,
    width: 200
  },
  zoomLevels: [500, 1000, 3000, 5000],
  timescale: true
})

export const trackHandler = new TrackHandler()
export const fileUploader = new FileUploader(SONG_ID, trackHandler, LOADER_ELEM_ID)
export const recorder = new Recorder()

const songId = SONG_ID

getSong(songId, doAfterSongFetched)