/* https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_forms_through_JavaScript : Dealing with binary data */
/* https://stackoverflow.com/a/38968948 */

import { UPLOAD_ENDPOINT } from '../../../common/js/config'
import DynamicModal from '../../../common/js/modaldialog'
import { LOADER_ELEM_ID, startLoader, cancelLoader } from '../../../common/js/utils'
import { playlist, trackHandler } from './composition'

export class FileUploader {
    constructor(compositionId, trackhandler) {
        this.compositionId = compositionId
        this.trackhandler = trackhandler
    }
    enableUpload(){
        const me = this
        const inputElement = document.getElementById("fileInput");
        inputElement.addEventListener("change", handleFiles, false);
        function handleFiles(event) {  
            event.preventDefault()
            me.fileReader(this.files[0])
        }
        dropContainer.ondragover = dropContainer.ondragenter = (evt) => {
            evt.preventDefault()
        }

        dropContainer.ondrop = (evt) => {
            fileInput.files = evt.dataTransfer.files
            this.fileReader(fileInput.files[0])
            evt.preventDefault()
        }
    }
    fileReader (thefile) {
        const file = {
            dom: document.getElementById('fileInput'),
            binary: null
        }
        const reader = new FileReader()

        reader.addEventListener('load', () => {

            file.binary = reader.result
        })

        reader.addEventListener('loadend', () => {
            this.sendData(file)
        })

        if (thefile) {
            reader.readAsBinaryString(thefile)
        }

    }
    sendData(file, type) {
        const me = this
        if (!type && !file.binary && file.dom.files.length > 0) {
            setTimeout(this.sendData, 10)
            return
        }

        const XHR = new XMLHttpRequest()

        const formData = new FormData()
        const dataFormValue = type ? file : file.dom.files[0]
        const dataFormFileName = type ? file.fileName : file.dom.files[0].name
        formData.append('composition_id', this.compositionId)
        formData.append('audio', dataFormValue, dataFormFileName)

        XHR.addEventListener('load', (event) => {
            cancelLoader(LOADER_ELEM_ID)
            if(event.srcElement && event.srcElement.response){
                const respJson = JSON.parse(event.srcElement.response)
                if(respJson.ok){
                    fileInput.value =''
                    if(type === 'blob'){
                        trackHandler.displayOptMenuForNewTrack(respJson)
                    } else {
                        playlist.getEventEmitter().emit("audiosourcesrendered", respJson)
                    }                
                } else {
                    me.displayModalDialog(respJson.error)
                }
            } else {
                me.displayModalDialog('Oops! Something went wrong.')
            }
        })

        XHR.addEventListener('error', (event) => {
            cancelLoader(LOADER_ELEM_ID)
            me.displayModalDialog('Problem sending file')
        })

        XHR.open('POST', UPLOAD_ENDPOINT)
        XHR.send(formData)
        startLoader(LOADER_ELEM_ID, "Uploading track...")
    }
    displayModalDialog (message) {
        DynamicModal.dynamicModalDialog(
            message, 
            null, 
            '',
            'Close',
            'Error',
            'bg-danger'
        )
    }
}
