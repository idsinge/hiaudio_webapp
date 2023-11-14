
import { ENDPOINT } from '../common/js/config'

export const getCollections = async () => {
   
    const response = await fetch(ENDPOINT + '/mycollections') 
    let result = null            
    if(response?.ok){ 
        const respJson = await response.json()
        result = respJson
    }
    return result
}

export const getCollectionsError = () => {
    alert(`Problem getting collections`)
}

export const createListCollections = (collections,listId, coll_id) => {
    const theList = collections.all_collections
    const listCollContainer  = document.getElementById(listId)
    let listOptions = `<option value='0'>...</option>`
    let selected = null
    theList.forEach((element) => {
        if (element) {
            if(element.uuid === coll_id){
                selected = 'selected>'
            } else {
                selected = null
            }
            const template = `<option value='${element.uuid}' ${selected?selected:'>'}${element.title}</option>`
            listOptions += template
        }
    })
    const listElelemts = `<select class='custom-select' id='inputGroupSelectCollect'>${listOptions}</select>`   
    listCollContainer.insertAdjacentHTML('afterbegin', listElelemts)
}