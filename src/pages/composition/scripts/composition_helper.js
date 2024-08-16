import { ENDPOINT } from '../../../common/js/config'
import DynamicModal from '../../../common/js/modaldialog'
import { DB, openDB, getTracksByCompId } from '../../../common/js/indexedDB'
import { LOADER_ELEM_ID, cancelLoader, PRIVACY_BADGE_STYLE, PRIVACY_BADGE_TEXT, uriUserPage, uriCollectionPage, isSafari } from '../../../common/js/utils'
import { setUserPermission, trackHandler, fileUploader, playlist } from './composition'
import {enableCompositionSettings} from './settings'
import {ROLES} from './settings/setcontributors'
import { trackInfoHandler } from './trackinfo/trackinfo'

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
            DynamicModal.dynamicModalDialog(
                errorIs, 
                null, 
                '',
                'Close',
                'Error',
                'bg-danger'
            )
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
    const inputElement = document.getElementById('fileInput')
    // TODO:issue-169 if Safari then ogg is not allowed in accept. Server should deliver m4a instead
    inputElement.accept = ['.mp3','.wav','.m4a','.flac', '.aac']
    // if(!isSafari){
    //     inputElement.accept inputElement.accept = ['.mp3','.wav','.m4a','.flac','.aac','.ogg']
    // }
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
            if (canUpload) {
                trackInfoHandler()
                trackHandler.detectClickOutsideMenuOpt()
                trackHandler.displayOptMenuForTracks(userRole)
            }
        }
    })
}

const getUserNameLabel = (compInfo) => {

    return `<span class="badge badge-light">OWNER:&nbsp;</span>
            <i class="fa fa-user"></i>&nbsp;
            <a href="${uriUserPage + compInfo.user_id}" class="card-url">${compInfo.username}&nbsp;</a>`
}

const getRoleLabel = (compInfo) => {
    return `${compInfo.role ? 
        `<span class="badge badge-light">YOUR ROLE:&nbsp;</span>
        <span id="rolebadgetext" class="badge badge-success">
         ${ROLES[compInfo.role]}
        </span>&nbsp;` 
        : ''}`
}

const getContributorsLabel = (compInfo) => {

    return `${compInfo.contributors.length ? 
        `<span class="badge badge-light">COLLABORATORS:&nbsp;</span>
        <span id="contributorsbadgetext" class="badge badge-dark">
        ${compInfo.contributors.length}</span>&nbsp;` 
        : ''}`
}

const getOpenStatusLabel = (compInfo) => {
    return `${compInfo.opentocontrib ? 
        `<span class="badge badge-light">STATUS:&nbsp;</span><span class="badge badge-info">OPEN TO CONTRIB</span>`
        : ''}`
}

const getDescriptionUIelem = (compInfo) => {
    const compositionDesc = compInfo.description || ''
    return `<p>
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

const getPrivacyLabel = (compInfo) => {

    return `<span class="badge badge-light">PRIVACY:&nbsp;</span>
            <span id="privacybadgetext" class="badge 
            ${PRIVACY_BADGE_STYLE[compInfo.privacy]}">${PRIVACY_BADGE_TEXT[compInfo.privacy]}
            </span>&nbsp;`
}

const getCollectionLabel = (compInfo) => {

    return `${compInfo.collection_id ? `<span class="badge badge-light">COLLECTION:&nbsp;</span>
    <i class="fa fa-th-list"></i>&nbsp;
    <a href="${uriCollectionPage + compInfo.collection_id}" class="card-url">${compInfo.parent_collection}&nbsp;</a>` : ''}`
}

const drawCompositionDetailInfo = (tracksInfo) => {
    let contentHtml = '<h1 class="post-title">Test DAW</h1>'
    if (tracksInfo.title) {
        contentHtml = '<br>'
        contentHtml += getUserNameLabel(tracksInfo)
        contentHtml += getCollectionLabel(tracksInfo)
        contentHtml += '<br>'
        contentHtml += getRoleLabel(tracksInfo)
        contentHtml += getContributorsLabel(tracksInfo)
        contentHtml += getPrivacyLabel(tracksInfo)
        contentHtml += getOpenStatusLabel(tracksInfo)
        contentHtml += `<p><h2 id="comp-title" class="post-title">${tracksInfo.title}</h2></p>`
        contentHtml += getDescriptionUIelem(tracksInfo)
    }
    document.getElementById('post-header').insertAdjacentHTML('afterbegin', contentHtml)
}
