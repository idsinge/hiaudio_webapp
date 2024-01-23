import { ENDPOINT } from '../../../common/js/config'
import { DB, openDB, getTracksByCompId } from '../../../common/js/indexedDB'
import { LOADER_ELEM_ID, cancelLoader } from '../../../common/js/utils'
import { setUserPermission, trackHandler, fileUploader, playlist, recorder } from './composition'
import {enableCompositionSettings} from './settings'
import {ROLES} from './settings/setcontributors'
import { trackInfoHandler } from './trackinfo'

export let CURRENT_USER_ID = null
function Track(id, title, muted, soloed, gain, stereoPan, customClass) {
    this.id = id
    this.name = title
    this.src = ENDPOINT + "/trackfile/" + id
    this.muted = muted
    this.soloed = soloed
    this.gain = gain
    this.stereoPan = stereoPan
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

export const doAfterCompositionFetched = (tracksInfo) => {
    if(!DB){
        openDB(tracksInfo.viewer_id || 'null').then((db) =>{
            continueAfterGetIndexDb(db, tracksInfo)
        })      
    } else {        
        continueAfterGetIndexDb(DB, tracksInfo)     
    }   
}

const continueAfterGetIndexDb = (db, tracksInfo) => {
    let storedtracks = null
    getTracksByCompId(db, tracksInfo?.uuid).then((stored_tracks) => {
        storedtracks = stored_tracks
    }).catch((error) =>{
        console.log(error)
    } ).finally(()=>{
        createArrayOfTracks(tracksInfo, storedtracks)
        drawCompositionDetailInfo(tracksInfo)
    })}

const convertArrayStoredCompToObj = (stored_tracks) => {
    const object = {}
    stored_tracks.forEach(item => {
        object[item.track_id] = item
    })
    return object
}

const createNewTrack = (element, tracksInfo, tracksAsObj) => {
    const muted = tracksAsObj && tracksAsObj[element?.uuid] ? tracksAsObj[element.uuid].muted : false
    const soloed = tracksAsObj && tracksAsObj[element?.uuid] ? tracksAsObj[element.uuid].soloed : false
    const gain = tracksAsObj && tracksAsObj[element?.uuid] ? tracksAsObj[element.uuid].gain : 1
    const stereoPan = tracksAsObj && tracksAsObj[element?.uuid] ? tracksAsObj[element.uuid].stereoPan : 0
    const title = element.title
    const customClass = { name: title, 
        track_id: element.uuid, 
        user_id: element.user_id,
        user_uid: element.user_uid,
        composition_id: tracksInfo.uuid,
        viewer_id: tracksInfo.viewer_id || 'null'
    }
    return new Track(element.uuid, title, muted, soloed, gain, stereoPan, customClass)    
}

const createArrayOfTracks = (tracksInfo, stored_tracks) => {
    const canUpload = tracksInfo.owner || (1<=tracksInfo.role && tracksInfo.role <= 3) || false
    const userRole = tracksInfo.role
    CURRENT_USER_ID = tracksInfo.viewer_id
    let tracksAsObj = null
    if(stored_tracks?.length){       
        tracksAsObj = convertArrayStoredCompToObj(stored_tracks)        
    }
    if (canUpload) {
        playlist.controls.widgets.remove = false
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
                const newTrack = createNewTrack(element, tracksInfo, tracksAsObj)
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
                trackInfoHandler()
                trackHandler.detectClickOutsideMenuOpt()
                trackHandler.displayOptMenuForTracks(userRole)
            }
        }
    })
}
const drawCompositionDetailInfo = (tracksInfo) => {
    let compositionNameHtml = '<h1 class="post-title">Test DAW</h1>'
    if (tracksInfo.title) {
        const compositionName = tracksInfo.title
        const compositionDesc = tracksInfo.description || ''
        compositionNameHtml = `${tracksInfo.opentocontrib ? '<br><span class="badge badge-info">OPEN TO CONTRIB</span>' : ''}`
        compositionNameHtml += `${tracksInfo.role ? '<br><span class="badge badge-success">'+ ROLES[tracksInfo.role] +'</span>' : ''}`
        compositionNameHtml += `<p><h1 id="comp-title" class="post-title">${compositionName}</h1></p>`       
        compositionNameHtml += `<p>
                                    <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseDescription" aria-expanded="false">
                                    Description
                                    </button>
                                </p>
                                <div class="collapse" id="collapseDescription">
                                    <div class="card card-body" id="comp-description">
                                    ${compositionDesc}
                                    </div>
                                </div>`
    }
    document.getElementById('post-header').insertAdjacentHTML('afterbegin', compositionNameHtml)
}
