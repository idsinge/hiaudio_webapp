/* https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_forms_through_JavaScript : Dealing with binary data */
/* https://stackoverflow.com/a/38968948 */

import { UPLOAD_ENDPOINT } from '../../../common/js/config'
import DynamicModal from '../../../common/js/modaldialog'
import { trackHandler } from './composition'

export class FileUploader {
    constructor(compositionId, trackhandler) {
        this.compositionId = compositionId
        this.trackhandler = trackhandler
    }
    sendData(file, type, trackuid) {
        const me = this
        // if (!type && !file.binary && file.dom.files.length > 0) {
        //     console.log('sendData ... hello ??')
        //     setTimeout(this.sendData, 10)
        //     return
        // }

        const XHR = new XMLHttpRequest()
        const formData = new FormData()
        const dataFormFileName = type ? file.fileName : file.name
        formData.append('composition_id', this.compositionId)
        formData.append('audio', file, dataFormFileName)
        const uploadBarHtml = `<div id='${'progress-elem-'+trackuid}'>${dataFormFileName}<br><progress id='upload-progress-bar-${trackuid}'></progress>&nbsp;<span id='upload-percentage-${trackuid}'></span><br/></div>`
        const progressBarContainer = document.getElementById('upload-progress-bar-container')
        progressBarContainer.innerHTML += uploadBarHtml

        XHR.addEventListener('load', (event) => {
            if(event.target && event.target.response){
                const respJson = JSON.parse(event.target.response)
                // fileInput is not declared here but refers to the input file for audio
                fileInput.value = ''
                if(respJson.ok){
                    respJson.trackuid = trackuid
                    trackHandler.displayOptMenuForNewTrack(respJson)
                } else {
                    me.displayModalDialog(respJson.error)
                }
            } else {
                me.displayModalDialog('Oops! Something went wrong.')
            }
        })

        XHR.addEventListener('error', (event) => {
            me.displayModalDialog('Problem sending file')
        })

        XHR.upload.addEventListener("progress", (event) => {
            const progressElem = document.getElementById('progress-elem-' + trackuid)
            const uploadProgressBar = document.getElementById('upload-progress-bar-' + trackuid)
            const uploadPercentage = document.getElementById('upload-percentage-' + trackuid)
            if (event.lengthComputable) {
              uploadProgressBar.value = event.loaded / event.total
              uploadPercentage.innerText = (event.loaded / event.total * 100).toFixed(2) + '%'
              if(uploadProgressBar.value === 1){
                progressElem.remove()
              }
            }
        })

        XHR.open('POST', UPLOAD_ENDPOINT)
        XHR.send(formData)
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
