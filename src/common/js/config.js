const MODE = 'DEV' // 'DEV', 'STAGE', 'PROD'

const ENVIRONMENTS = {
    PROD:{       
        ENDPOINT:'https://hiaudio.fr',
        UPLOAD_ENDPOINT:'https://hiaudio.fr/fileUpload'     
    },
    STAGE:{        
        ENDPOINT: window.location.protocol+'//'+window.location.host,
        UPLOAD_ENDPOINT: window.location.protocol+'//'+window.location.host+'/fileUpload'
    },
    DEV:{       
        ENDPOINT:window.location.protocol+'//'+window.location.host,
        UPLOAD_ENDPOINT:window.location.protocol+'//'+window.location.host + '/fileUpload'
    }
}

export const ENDPOINT = ENVIRONMENTS[MODE].ENDPOINT
export const UPLOAD_ENDPOINT = ENVIRONMENTS[MODE].UPLOAD_ENDPOINT