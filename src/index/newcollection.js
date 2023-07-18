
import { ENDPOINT } from '../js/config'

const createNewCollButton  = document.getElementById('createNewCollButton')
const saveCollectionButton = document.getElementById('newcollection')

const getCollections = async () => {
    document.getElementById('newcolltitle').value = ''
    const response = await fetch(ENDPOINT + '/mycollections') 
    let result = null            
    if(response?.ok){ 
        const respJson = await response.json() 
        document.getElementById('listCollContainer').replaceChildren()                                   
        createListCollections(respJson)
        saveCollectionButton.disabled = false
    } else {
        alert(`Problem getting collections`)
    }
    return result
}

const createListCollections = (collections) => {
    const theList = collections.all_collections
    const listCollContainer  = document.getElementById('listCollContainer')
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
    let newtitle = document.getElementById('newcolltitle').value
    const privacyLevel = document.querySelector('input[name="newCollectionPrivacyRadios"]:checked').value
    if (!newtitle) {
        alert('Introduce a valid title, please')
        return
    }
    
    const collectInput = document.getElementById('inputGroupSelectCollect')
    let parentCollection = collectInput.value
    if(parentCollection === '0'){
        parentCollection = null
    }

    let body = JSON.stringify({
        title: newtitle,
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
        if (respToJson) {
            response = respToJson
        }
    } catch (error) {
        alert(error)
    }
    $('#newCollectionModal').modal('hide')
    return response
}

createNewCollButton?.addEventListener('click', getCollections, false)

saveCollectionButton?.addEventListener('click', saveNewCollReqst, false)