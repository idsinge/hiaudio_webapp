import { LOADER_ELEM_ID, cancelLoader, callJsonApi } from './utils'

export const checkIfTermsAccepted = (userprofile, callback) => {
    cancelLoader(LOADER_ELEM_ID)
    callback(userprofile?.terms_accepted)
}

export const handleTermsNotAccepted = () => {

    $('#acceptTermsModal').modal({
        backdrop: 'static',
        keyboard: false  // to prevent closing with Esc button (if you want this too)
    })
    $('#acceptTermsModal').modal('show')
    document.getElementById('buttonAcceptTerms').onclick = rqstAcceptTerms
    document.getElementById('buttonRejectTerms').onclick = rqstRejectTerms
}

const rqstAcceptTerms = async () => {
    const data = await callJsonApi('/acceptterms', 'PUT')
    if (data.ok) {
        $('#acceptTermsModal').modal('hide')
    }
}
const rqstRejectTerms = async () => {
    const data = await callJsonApi('/rejectterms', 'PUT')
    if (data.ok) {
        $('#acceptTermsModal').modal('hide')
        window.location.href = window.location.origin
    }
}

export const generateAcceptTermsModal = (attachToElem) => {

    const isModal = document.getElementById('acceptTermsModal')

    if (!isModal) {
        const modalDialog = `<div class="modal fade" id="acceptTermsModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title">Accept Terms</h5>                
                </div>
                <div class="modal-body">
                <p>By clicking on OK you accept the Terms of Use.</p>
                <p>More information at: <span> <a href="${window.location.origin}/static/terms.html" target="_blank">${window.location.origin}/static/terms.html</a></span></p>
                </div>
                <div class="modal-footer">
                <button id="buttonRejectTerms" type="button" class="btn btn-secondary" data-dismiss="modal">Reject</button>
                <button id="buttonAcceptTerms" type="button" class="btn btn-primary">OK</button>
                </div>
            </div>
            </div>
        </div>`
        document.getElementsByTagName(attachToElem)[0].insertAdjacentHTML('afterend', modalDialog)
    }
    handleTermsNotAccepted()
}