import { callJsonApi } from '../../../common/js/utils'
import DynamicModal from '../../../common/js/modaldialog'

const uriCompositionPage = '/composition.html?compositionId='

export const cloneComposition = async (compinfo) => {
    document.getElementById('clonetitle').classList.remove('is-invalid')
    document.getElementById('validationclonedtitle').innerText = ''
    const clonetitle = document.getElementById('clonetitle').value
    const privacyLevel = document.querySelector('input[name="cloneMusicPrivacyRadios"]:checked').value
    if (!clonetitle) {
        document.getElementById('clonetitle').classList.add('is-invalid')
        document.getElementById('validationclonedtitle').innerText = `Sorry, title can't be empty`
        return
    }

    const clonedescription = document.getElementById('clonedescription').value

    const endpoint = '/clonecomposition'
    const body = { title: clonetitle, description: clonedescription, privacy_level: privacyLevel, clone_from: compinfo.uuid }
    const data = await callJsonApi(endpoint, 'POST', body, 'Cloning composition...')

    if (data.ok) {
        window.location.href = uriCompositionPage + data.composition.uuid
    } else {
        DynamicModal.dynamicModalDialog(
            data.msg || data,
            null,
            '',
            'Close',
            'Error Cloning',
            'bg-danger'
        )
    }
}