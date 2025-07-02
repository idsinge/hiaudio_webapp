const MODE = 'PROD' // 'STAGE', 'DEV'

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

module.exports = {    
    ENDPOINT: ENVIRONMENTS[MODE].ENDPOINT,
    UPLOAD_ENDPOINT: ENVIRONMENTS[MODE].UPLOAD_ENDPOINT    
}