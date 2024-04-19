class DynamicModal {
    constructor() {
        this.modal = this.getDynamicModal()
        if (!this.modal) {
            this.modal = this.initDynamicModal()
        }
    }

    dynamicModalDialog(message, idbtn, textBtnOK, textBtnCancel, popupTitle, backgroundHeader) {
        const html =
            '<div class="modal-header '+backgroundHeader+' text-white">' +
            '<h5 class="modal-title" id="dynamicModalLabel">'+popupTitle+'</h5>' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' +
            '</div>' +
            '<div class="modal-body">' +
            message +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-secondary" data-dismiss="modal">'+textBtnCancel+'</button>' +
            (idbtn!==null?'<button id=' + idbtn + ' type="button" class="btn btn-primary">' + textBtnOK + '</button>':'') +
            '</div>'

        this.setDynamicModalContent(html)
        $(this.modal).modal('show')
    }

    getDynamicModal() {
        return document.getElementById('dynamicModal')
    }

    setDynamicModalContent(html) {
        this.modal.querySelector('.modal-content').innerHTML = html
    }

    closeDynamicModal() {
        $(this.modal).modal('hide')
    }

    initDynamicModal() {
        const modal = document.createElement('div')
        modal.classList.add('modal', 'fade')
        modal.setAttribute('id', 'dynamicModal')
        modal.setAttribute('tabindex', '-1')
        modal.setAttribute('role', 'dialog')
        modal.setAttribute('aria-labelledby', 'dynamicModalLabel')
        modal.setAttribute('aria-hidden', 'true')
        modal.innerHTML =
            '<div class="modal-dialog modal-sm modal-dialog-centered" role="document">' +
            '<div class="modal-content"></div>' +
            '</div>'
        document.body.appendChild(modal)
        return modal
    }
}

const dynamicModalInstance = new DynamicModal()

export default dynamicModalInstance