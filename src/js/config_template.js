const MODE = 'DEV'
const DEVPORT = 7007

const ENVIRONMENTS = {
    PROD:{       
        ENDPOINT:'',
        UPLOAD_ENDPOINT:'',      
    },
    STAGE:{        
        ENDPOINT:'',
        UPLOAD_ENDPOINT:''
    },
    DEV:{       
        ENDPOINT:'http://localhost:'+DEVPORT+'/graphql',
        UPLOAD_ENDPOINT:'http://localhost:'+DEVPORT+'/fileUpload'       
    }
}

module.exports = {    
    ENDPOINT: ENVIRONMENTS[MODE].ENDPOINT,
    UPLOAD_ENDPOINT: ENVIRONMENTS[MODE].UPLOAD_ENDPOINT    
}