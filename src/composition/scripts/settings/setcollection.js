import {updateSettings} from '../settings'
import {getCollections, getCollectionsError, createListCollections } from '../../../index/newcollection.js'

let CURRENT_PARENT_COLLECTION = null

const clickSettingsButtonHandler = (collection_id) => {    
    getCollections().then( result => {
        if(result){
            getCompCollSuccess(result, collection_id)
        } else {
            getCollectionsError()
        }        
    })
}

export const openSettingsButtonHandler = (collection_id) => {
    const openSettingsButton  = document.getElementById('openSettingsButton')
    openSettingsButton?.addEventListener('click', () => {
        clickSettingsButtonHandler(collection_id)
    }, false)
}

const getCompCollSuccess = (list, selected_coll) => {
    document.getElementById('listCollContainerNewColl').replaceChildren()
    createListCollections(list, 'listCollContainerNewColl', CURRENT_PARENT_COLLECTION || selected_coll)
    if(list?.all_collections.length){
        if(selected_coll){            
            CURRENT_PARENT_COLLECTION = selected_coll
        }        
    }   
}

export const saveParentCollection = async (compId) => {
    const newParentColl = document.getElementById('inputGroupSelectCollect').value    
    if(CURRENT_PARENT_COLLECTION || newParentColl !== '0'){
        if (newParentColl !== CURRENT_PARENT_COLLECTION) {
            await updateParentCollection(compId, newParentColl)
        }
    }
}

const updateParentCollection = async (compId, newParentColl) => {    
    const data = {uuid: compId, collection_id: (newParentColl=== '0')?null:newParentColl}
    const resultNewParent = await updateSettings('PATCH', '/updatecompcollection', data)
    if(resultNewParent?.ok){
        CURRENT_PARENT_COLLECTION = newParentColl
    }
}