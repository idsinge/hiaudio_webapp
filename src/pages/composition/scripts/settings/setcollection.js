import {updateSettings} from '../settings'
import {uriCollectionPage} from '../../../../common/js/utils'
import {getCollectionLabel} from '../composition_helper'
import {getCollections, getCollectionsError, createListCollections } from '../../../../common/js/collectionshandler.js'

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
    document.getElementById('listCollContainerNewColl').innerHTML = ''
    createListCollections(list, 'listCollContainerNewColl', CURRENT_PARENT_COLLECTION || selected_coll)
    if(list?.all_collections.length){
        if(selected_coll){            
            CURRENT_PARENT_COLLECTION = selected_coll
        }        
    }   
}

export const saveParentCollection = async (compId) => {
    const inputGroupSelectCollect = document.getElementById('inputGroupSelectCollect')
    if(inputGroupSelectCollect){
        const newParentCollId = inputGroupSelectCollect.value
        const newParentCollText = inputGroupSelectCollect.options[inputGroupSelectCollect.selectedIndex].text
        if(CURRENT_PARENT_COLLECTION || newParentCollId !== '0'){
            if (newParentCollId !== CURRENT_PARENT_COLLECTION) {
                await updateParentCollection(compId, newParentCollId, newParentCollText)
            }
        }
    }
}

const updateParentCollection = async (compId, newParentCollId, newParentCollText) => {
    const data = {uuid: compId, collection_id: (newParentCollId=== '0')?null:newParentCollId}
    const resultNewParent = await updateSettings('PATCH', '/updatecompcollection', data)
    if(resultNewParent?.ok){
        CURRENT_PARENT_COLLECTION = newParentCollId
        updateCollectionBadgeUI(newParentCollId, newParentCollText)
    }
}

const updateCollectionBadgeUI = (newParentCollId, newParentCollText) => {    
    const collectionBadge = document.getElementById('collection-badge')
    if(newParentCollId === '0'){
        removeCollectionBadge(collectionBadge)
    } else {
        addCollectionBadge(collectionBadge, newParentCollId, newParentCollText)
    }
}

const removeCollectionBadge = (collectionBadge) => {
    const collectionLabel = collectionBadge.previousElementSibling.previousElementSibling
    const collectionIcon = collectionBadge.previousElementSibling
    collectionLabel && collectionLabel.remove()
    collectionIcon && collectionIcon.remove()
    collectionBadge && collectionBadge.remove()
}

const addCollectionBadge = (collectionBadge,newParentCollId, newParentCollText) => {
    if(collectionBadge){
        collectionBadge.textContent = newParentCollText
        collectionBadge.href = uriCollectionPage + newParentCollId
    } else {
        const ownerBadge = document.getElementById('owner-badge')
        const htmlCollectionBadge = getCollectionLabel(newParentCollId, newParentCollText)
        ownerBadge.insertAdjacentHTML('afterend', htmlCollectionBadge)
    }
}