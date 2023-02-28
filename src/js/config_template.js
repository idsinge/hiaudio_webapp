const MODE = 'DEV' // 'STAGE'
const DEVPORT = 7007

const ENVIRONMENTS = {
    PROD:{       
        ENDPOINT:'',
        UPLOAD_ENDPOINT:'',      
    },
    STAGE:{        
        ENDPOINT: window.location.protocol+'//'+window.location.host,
        UPLOAD_ENDPOINT: window.location.protocol+'//'+window.location.host+'/fileUpload'
    },
    DEV:{       
        ENDPOINT:'https://localhost:'+DEVPORT,
        UPLOAD_ENDPOINT:'https://localhost:'+DEVPORT+'/fileUpload'         
    }
}

module.exports = {    
    ENDPOINT: ENVIRONMENTS[MODE].ENDPOINT,
    UPLOAD_ENDPOINT: ENVIRONMENTS[MODE].UPLOAD_ENDPOINT    
}