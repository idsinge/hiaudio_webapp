import { ENDPOINT } from './config'


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
        const sendRqst = await fetch(ENDPOINT + apimethod, request)
        const respToJson = await sendRqst.json()
        if (respToJson && !respToJson.error) {
            return response = respToJson
        } else {
            return (respToJson?.error || 'An error occurred')
        }
    } catch (error) {
        return(error)
    }
}