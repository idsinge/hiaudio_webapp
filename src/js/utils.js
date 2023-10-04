import { ENDPOINT } from './config'

export const LOADER_ELEM_ID = 'loader'

export const startLoader = (loaderId, loadingMessage) => {
    document.getElementById('loadertext').textContent = loadingMessage
    const loaderElement = document.getElementById(loaderId)
    loaderElement.classList.add(loaderId)
}

export const cancelLoader = (loaderId) => {
    const loaderElement = document.getElementById(loaderId)
    loaderElement.classList.remove(loaderId)
    document.getElementById('loadertext').textContent = ''
}

export const getJsonApi = async (apimethod) => {
    const request = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }
    let response = null
    try {
        startLoader(LOADER_ELEM_ID, 'Loading...')
        const sendRqst = await fetch(ENDPOINT + apimethod, request)
        cancelLoader(LOADER_ELEM_ID)
        const respToJson = await sendRqst.json()
        if (respToJson && !respToJson.error) {
            return response = respToJson
        } else {
            return (respToJson?.error || 'An error occurred')
        }
    } catch (error) {
        cancelLoader(LOADER_ELEM_ID)
        return(error)
    }
}