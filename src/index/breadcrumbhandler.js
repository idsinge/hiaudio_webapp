import { getRecentCompositions, getMyCompositions, getAllCompositions, getOpenCompositions } from './index'

export const breadcrumbHandler = (isauth) => {
    createBreadCrumbNavBar(isauth)   
    document.querySelectorAll('.breadcrumb-item a').forEach(function (element) {
        element.addEventListener('click', function (event) {
            event.preventDefault()
            let section = event.currentTarget.getAttribute('data-section')
            navigate(section)
        })
    })
}

const createBreadCrumbNavBar = (isauth) => {
    const navBar = document.getElementById('breadcrumbnavbar')
    let userOptions = ''
    if(isauth.ok){
        userOptions = `<li class="breadcrumb-item active" aria-current="page"><a href="#" data-section="my-comp">My Music</a></li>
        <li class="breadcrumb-item"><a href="#" data-section="all-comp">All</a></li>`
    } else {
        userOptions = `<li class="breadcrumb-item active" aria-current="page"><a href="#" data-section="recent-comp">Recent</a></li>
        <li class="breadcrumb-item"><a href="#" data-section="all-comp">All</a></li>`
    }
    navBar.innerHTML = userOptions    
}

function navigate(section) { 
    
    switch (section) {
        case 'recent-comp':           
            getRecentCompositions()   
            break
        case 'my-comp':            
            getMyCompositions()
            break
        case 'all-comp':
            getAllCompositions()
            break
        default:
            console.log('section default')
    }
}