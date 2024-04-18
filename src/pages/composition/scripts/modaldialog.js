export const dynamicModalDialog = (message, idbtn) => {
    
    let exampleModal = getExampleModal()

    if (!exampleModal) { exampleModal = initExampleModal() }

    const html =
        '<div class="modal-header bg-warning text-white">' +
        '<h5 class="modal-title" id="exampleModalLabel">Warning</h5>' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button>' +
        '</div>' +
        '<div class="modal-body">' +
        message +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>' +
        '<button id='+idbtn+' type="button" class="btn btn-primary">Delete</button>' +
        '</div>'

    setExampleModalContent(html)
    $(exampleModal).modal('show')
}

function getExampleModal() {
    return document.getElementById('exampleModal')
}

function setExampleModalContent(html) {
    getExampleModal().querySelector('.modal-content').innerHTML = html
}

function initExampleModal() {
    const modal = document.createElement('div')
    modal.classList.add('modal', 'fade')
    modal.setAttribute('id', 'exampleModal')
    modal.setAttribute('tabindex', '-1')
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-labelledby', 'exampleModalLabel')
    modal.setAttribute('aria-hidden', 'true')
    modal.innerHTML =
        '<div class="modal-dialog modal-sm modal-dialog-centered" role="document">' +
        '<div class="modal-content"></div>' +
        '</div>'
    document.body.appendChild(modal)
    return modal
}