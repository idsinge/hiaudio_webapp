const MODE = 'DEV' // 'STAGE'

const ENVIRONMENTS = {
    PROD:{       
        ENDPOINT:'',
        UPLOAD_ENDPOINT:''     
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