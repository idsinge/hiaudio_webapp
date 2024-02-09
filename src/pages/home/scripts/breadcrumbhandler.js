import { getRecentCompositions, getMyCompositions, getAllCompositions } from './home'

export const breadcrumbHandler = (isauth, isuserorcollection) => {
    createBreadCrumbNavBar(isauth, isuserorcollection)   
    document.querySelectorAll('.breadcrumb-item a').forEach(function (element) {
        element.addEventListener('click', function (event) {
            event.preventDefault()
            document.querySelector('.active-breadcrumb')?.classList.remove('active-breadcrumb')            
            event.currentTarget.classList.add('active-breadcrumb')
            let section = event.currentTarget.getAttribute('data-section')
            navigate(section)
        })
    })
}

const createBreadCrumbNavBar = (isauth, isuserorcollection) => {
    const navBar = document.getElementById('breadcrumbnavbar')
    let userOptions = ''
    if(isauth.ok){
        userOptions = `<li class='breadcrumb-item ${isuserorcollection ? '' : 'active-breadcrumb'}' aria-current='page'><a href='#' data-section='my-comp'>My Music</a></li>
        <li class='breadcrumb-item'><a href='#' data-section='all-comp'>All</a></li>`
    } else {
        userOptions = `<li class='breadcrumb-item ${isuserorcollection ? '' : 'active-breadcrumb'}' aria-current='page'><a href='#' data-section='recent-comp'>Recent</a></li>
        <li class='breadcrumb-item'><a href='#' data-section='all-comp'>All</a></li>`
    }
    navBar.innerHTML = userOptions    
}

export function navigate(section) { 
    const url = new URL(window.location.href)
    url.searchParams.delete('userid')
    url.searchParams.delete('collectionid')
    history.replaceState(null, null, url)
    switch (section) {
        case 'recent-comp':           
            getRecentCompositions()   
            break
        case 'my-comp':            
            getMyCompositions()
            break
        case 'all-comp':
            document.getElementById('initialmessage').classList.remove('d-flex')
            document.getElementById('initialmessage').hidden = true
            getAllCompositions()
            break
        default:
            console.log('section default')
    }
}