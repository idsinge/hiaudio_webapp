import { ENDPOINT } from '../js/config'
import { LOADER_ELEM_ID, COMPOSITION_ID, setUser, setUserPermission, trackHandler, fileUploader, playlist, recorder } from './composition'
import {enableCompositionSettings} from './settings'

export let CURRENT_USER_ID = null
function Track(id, title, link, customClass) {
    this.id = id;
    this.name = title;
    this.src = ENDPOINT + "/trackfile/" + id
    this.customClass = customClass
}


export const getComposition = (compositionId, callback, extraParams) => {

    let errorIs = null
    let tracksInfo = {}

    fetch(ENDPOINT + "/composition/" + compositionId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    })
    .then((r) => {
        if (!r.ok) {
            errorIs = r.statusText
        }
        return r.json()
    })
    .then((data) => {
        
        if (data) {
            tracksInfo = data
        }
    })
    .catch((error) => {
        errorIs = error
    })
    .then(() => {
        if (errorIs) {
            alert(errorIs)
        }
        callback(tracksInfo, extraParams)
    })

}

export const doFetch = (body, callback, extraParams) => {

    let errorIs = null
    let tracksInfo = {}

    fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: body
    })
    .then((r) => {
        if (!r.ok) {
            errorIs = r.statusText
        }
        return r.json()
    })
    .then((data) => {
        if (data.data) {
            tracksInfo = data.data
        }
    })
    .catch((error) => {
        errorIs = error
    })
    .then(() => {
        if (errorIs) {
            alert(errorIs)
        }
        callback(tracksInfo, extraParams)
    })

}

export const doAfterCompositionFetched = (tracksInfo) => {
    createArrayOfTracks(tracksInfo)
    drawCompositionDetailInfo(tracksInfo)
}


export const startLoader = (loaderId) => {
    const loaderElement = document.getElementById(loaderId)
    loaderElement.classList.add(loaderId)
}

export const cancelLoader = (loaderId) => {
    const loaderElement = document.getElementById(loaderId)
    loaderElement.classList.remove(loaderId)
}



const createArrayOfTracks = (tracksInfo) => {
    const canUpload = tracksInfo.owner || (1<=tracksInfo.role && tracksInfo.role <= 3) || false
    const userRole = tracksInfo.role
    CURRENT_USER_ID = tracksInfo.viewer_id
    if (canUpload) {
        setUserPermission(true)
        fileUploader.enableUpload()
        if (userRole === 1) {
            enableCompositionSettings(tracksInfo)
        }
    }
    if (tracksInfo.tracks) {
        const arrayLoad = []
        tracksInfo.tracks.forEach((element) => {
            if(element){
                //console.log("foreach: ", element);
                // const audio = element?.message?.audio || element?.message?.voice
                // const title = audio.title || element.message.date
                // const track_id = audio.file_unique_id + '_' + element.message.date
                // const customClass = { chatId: COMPOSITION_ID, message_id: element.message.message_id, name: title, track_id: track_id }
                // const newTrack = new Track(title, element.file_path , customClass)
                // arrayLoad.push(newTrack)

                const title = element.title
                const customClass = { name: title, track_id: element.id, user_id: element.user_id}
                const newTrack = new Track(element.id, title, element.path , customClass)
                arrayLoad.push(newTrack)
            }
        })
        createTrackList(arrayLoad, canUpload, userRole)
    } else {
        cancelLoader(LOADER_ELEM_ID)
        playlist.initExporter()
        recorder.init()
    }
}

const createTrackList = (arrayLoad, canUpload, userRole) => {
    let errorIs = null
    playlist.load(arrayLoad).then(() => {
        playlist.initExporter()
    }).catch((error) => {
        errorIs = error
    })
    .then(() => {
        cancelLoader(LOADER_ELEM_ID)
        if (errorIs) {
            alert(errorIs)
        } else {
            recorder.init()
            if (canUpload) {
                trackHandler.displayOptMenuForTracks(userRole)
            }
        }
    })
}
const drawCompositionDetailInfo = (tracksInfo) => {
    let lyricsHtml = null
    let compositionName = 'No name'
    let compositionNameHtml = '<h1 class="post-title">No name</h1>'
    const compositionInfo = tracksInfo.compositionInfoById
    if (compositionInfo && compositionInfo.doc_url) {
        lyricsHtml = `<a href="#" onclick="window.open('${compositionInfo.doc_url}', 'lyrics_popup', 'fullscreen=yes',false); return false">Lyrics</a>`
        document.getElementById('post-header').insertAdjacentHTML('afterbegin', lyricsHtml)
    }
    if (tracksInfo.title) {
        compositionName = tracksInfo.title
        compositionNameHtml = `<h1 class="post-title">${compositionName}</h1>`
    }
    document.getElementById('post-header').insertAdjacentHTML('afterbegin', compositionNameHtml)
}
