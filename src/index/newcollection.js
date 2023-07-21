
import { ENDPOINT } from '../js/config'

const createNewCollButton  = document.getElementById('createNewCollButton')
const saveCollectionButton = document.getElementById('newcollection')

export const getCollections = async () => {
   
    const response = await fetch(ENDPOINT + '/mycollections') 
    let result = null            
    if(response?.ok){ 
        const respJson = await response.json()
        result = respJson
    }
    return result
}

const getCollectionsSuccess = (list) => {
    document.getElementById('listCollContainerNewColl').replaceChildren()                                   
    createListCollections(list, 'listCollContainerNewColl')
    saveCollectionButton.disabled = false
}

export const getCollectionsError = () => {
    alert(`Problem getting collections`)
}

export const createListCollections = (collections,listId) => {
    const theList = collections.all_collections
    const listCollContainer  = document.getElementById(listId)
    let listOptions = `<option value='0' selected>...</option>`
    theList.forEach((element) => {
        if (element) {
            const template = `<option value='${element.uuid}'>${element.title}</option>`
            listOptions += template
        }
    })
    const listElelemts = `<select class='custom-select' id='inputGroupSelectCollect'>${listOptions}</select>`   
    listCollContainer.insertAdjacentHTML('afterbegin', listElelemts)
}

const saveNewCollReqst = async() => {
    let newcolltitle = document.getElementById('newcolltitle').value
    const privacyLevel = document.querySelector('input[name="newCollectionPrivacyRadios"]:checked').value
    if (!newcolltitle) {
        alert('Introduce a valid title, please')
        return
    }
    
    const collectInput = document.getElementById('inputGroupSelectCollect')
    let parentCollection = collectInput.value
    if(parentCollection === '0'){
        parentCollection = null
    }

    let body = JSON.stringify({
        title: newcolltitle,
        privacy_level: privacyLevel,
        parent_uuid: parentCollection
    })
 
    let response = null
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: body
    }
    try {
        const sendRqst = await fetch(ENDPOINT + '/newcollection', request)
        const respToJson = await sendRqst.json()
        if (respToJson && !respToJson.error) {
            response = respToJson
        } else {
            alert(respToJson?.error || 'An error occurred')
        }
    } catch (error) {
        alert(error)
    }
    $('#newCollectionModal').modal('hide')
    return response
}

const clickNewCollButtonHandler = () => {
    document.getElementById('newcolltitle').value = ''
    getCollections().then( result => {
        if(result){
            getCollectionsSuccess(result)
        } else {
            getCollectionsError()
        }
    })
}
createNewCollButton?.addEventListener('click', clickNewCollButtonHandler, false)

saveCollectionButton?.addEventListener('click', saveNewCollReqst, false)