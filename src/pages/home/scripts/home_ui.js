import { uriCompositionPage, IS_AUTH } from './home'
import { isuserpage, displayUserNameInCard } from './home_helper'
import { PRIVACY_BADGE_STYLE, PRIVACY_BADGE_TEXT, uriUserPage, uriCollectionPage } from '../../../common/js/utils'
const homeVideoUrl = new URL('../../../static/videos/compress_home_page_video.mp4', import.meta.url)

const CARD_BADGE_STYLE = { 'coll': 'badge-collection', 'user': 'badge-warning', 'collab': 'badge-collab' }
const CARD_BORDER_STYLE = { 'coll': 'border-collection', 'user': 'border-warning', 'collab': 'border-collab' }
const URI_PAGE = { 'coll': uriCollectionPage, 'user': uriUserPage }

//const WELCOME_TEXT = 'We present Hi-Audio Online Platform a web application for musicians, researchers and an open community of enthusiasts of audio and music with a view to build a public database of music recordings from a wide variety of styles and different cultures.'

const WELCOME_VIDEO = 
`<div id="landing-video-container" class="fullscreen-video-container">
    <video playsinline autoplay loop muted>
      <source src="${homeVideoUrl}">
    </video>  
  <div class='fullscreen-video-content'>
    <div class="typewriter">
      <h1>Welcome!</h1>      
    </div>
    <div class="h-100 d-flex">
      <div class="m-auto">
        <a id="start-link" class="btn btn-link" href="/login.html" role="button"><b>LET'S JAM?</b></a>
      </div>
    </div>    
  </div>
</div>`

export const initNavigationMenu = () => {
    
    document.getElementById('userlogin').innerHTML =    
    `<li class='nav-item'>
        <a class='dropdown-item' href='${window.location.origin}/login.html'>Register / Login</a>
    </li>
    <li class='nav-item'>
        <a class='dropdown-item' href='${uriCompositionPage}demopage'>Test DAW</a>
    </li>
    <li class='nav-item'>
        <a class='dropdown-item' href='${window.location.origin}/static/howto.html'>How-To</a>
    </li>
    <li class='nav-item'>
        <a class='dropdown-item' href='#' id='openNewsModalButton' data-toggle='modal' data-target='#newsModal'><b>News<b></a>
    </li>
    `

    document.getElementById('useroptions').innerHTML = 
    `<li class='nav-item'>
      <a class='nav-link' href='${window.location.origin + '/profile.html'}'>Profile <i id='display_profile_name'></i></a>
    </li>
    <li class='nav-item'>
          <a class='nav-link' href='#' id='createNewButton' data-toggle='modal' data-target='#newMusicModal'>/ Create new</a>
    </li>
    <li class='nav-item'>
        <a class='nav-link' href='#' id='openMyCollectionsButton' data-toggle='modal' data-target='#editCollectionsModal'>/ My Collections</a>
    </li>
    <li class='nav-item'>
        <a class='nav-link' href='${window.location.origin + '/static/howto.html'}'>/ How-to</a>
    </li>
    <li class='nav-item'>
        <a class='nav-link' href='#' id='openNewsModalButton' data-toggle='modal' data-target='#newsModal'>/ News</a>
    </li>
    `
  handleNewsPopUpClose()
}

const handleNewsPopUpClose = () => {
  $('#newsModal').on('hidden.bs.modal', function (event) {
    const videoPromo = document.getElementById('promo-video')
    if (!videoPromo.paused) {
      videoPromo.pause()
    }
  })
}

export const getLegendButtons = (numberGroupsByCollections, numberGroupsCustom, numberSinglComp, endpoint, totalcomps) => {
    const displayGroupsByLabel = (numberGroupsByCollections || ((!isuserpage(endpoint)) && numberGroupsCustom) || numberSinglComp)
    return `<ul class="nav justify-content-end">
              ${displayGroupsByLabel ? '<li class="legenditem nav-item"><h4><span class="badge badge-light">Groups by:&nbsp;</span></h4></li>' : ''}
              ${numberGroupsByCollections ? '<li class="legenditem nav-item"><h4><span class="badge badge-collection">Collections&nbsp;<span class="badge badge-light">' + numberGroupsByCollections + '</span></span></h4></li>' : ''}            
              ${((!isuserpage(endpoint)) && numberGroupsCustom) ? '<li class="legenditem nav-item"><h4><span class="badge badge-warning">Users&nbsp;<span class="badge badge-light">' + numberGroupsCustom + '</span></span></h4></li>' : ''}
              ${numberSinglComp ? '<li class="legenditem nav-item"><h4><span class="badge badge-success">Singles&nbsp;<span class="badge badge-light">' + numberSinglComp + '</span></span></h4></li>' : ''}
              <li class="legenditem nav-item"><h4><span class="badge badge-light">Total compositions:&nbsp;</span><span class="badge badge-light">${totalcomps}</span></h4></li>
            </ul>`
}

export const paintMainElemsHomePage = (listElelemts, legendButtons) => {
    document.getElementById('grid').innerHTML = ''
    document.getElementById('grid').insertAdjacentHTML('afterbegin', listElelemts)
    document.getElementById('legendbuttons').innerHTML = ''
    document.getElementById('legendbuttons').insertAdjacentHTML('afterbegin', legendButtons)
    document.getElementById('searchInput').removeAttribute('disabled')
}

export const paintSingleComposition = (element, endpoint) => {
    const displayName = displayUserNameInCard(endpoint, element.username)
    const displayNumCollabs = element.contributors.length
    const last_track = element?.tracks[element?.tracks.length - 1]?.uuid
    
    return `<div class='card border-success'>                       
              <div class="card-body">
              ${IS_AUTH ? `<span class="badge ${PRIVACY_BADGE_STYLE[element.privacy]}">${PRIVACY_BADGE_TEXT[element.privacy]}</span>` : ''}
              ${element.opentocontrib ? '<p class="badge badge-info">OPEN TO CONTRIB</p>' : ''}
              ${element.is_template ? '<p class="badge badge-template">TEMPLATE</p>' : ''}  
                  <div>
                    <p class="list-group-item-heading">  
                      <a href='${uriCompositionPage + element.uuid}' class='card-url'>
                        <h5 class='card-title'>${element.title}</h5>
                      </a>
                    </p>
                    <p>${displayName ?
                      `<span class="d-inline-block text-truncate" style="max-width: 250px;">
                        <i class='fa fa-user'></i>&nbsp;
                        <a href='${uriUserPage + element.owner_uuid}' class='card-url'>
                          ${element.username}&nbsp;
                        </a>
                      </span>`: ''}
                    </p>
                    <p class='text-black-50'>${displayNumCollabs ? ('Collaborators: ' + displayNumCollabs) : ''}</p>
                    <p class='card-text text-truncate'>${element.description || ''}</p>
                    ${element.tracks?.length ?
                    `<span class="play-control-card d-inline-block text-truncate" style="max-width: 200px;" ${last_track ? ` data-trackid="${last_track}"` : ''}>
                      <i class='fa fa-play'>&nbsp;</i>Play last added track </span>&nbsp;` : ''}
                    <span class="d-inline-block text-truncate" style="max-width: 250px;">
                        <i class='fa fa-music'></i>&nbsp;${'Tracks: ' + element.tracks?.length}
                    </span>
                  </div>                
              </div>            
          </div>`
}

export const getUIListElemInsideCollection = (item, typebadge, endpoint) => {

    const displayName = displayUserNameInCard(endpoint, item.username)
    const displayNumCollabs = item.contributors.length
    const last_track = item?.tracks[item?.tracks.length - 1]?.uuid
    
    return `<div class="list-group-item ">
              ${IS_AUTH ? `<span class="badge ${PRIVACY_BADGE_STYLE[item.privacy]}">${PRIVACY_BADGE_TEXT[item.privacy]}</span>` : ''}
              ${item.opentocontrib ? '<span class="badge badge-info">OPEN TO CONTRIB</span>' : ''}
              ${item.is_template ? '<span class="badge badge-template">TEMPLATE</span>' : ''}  
              <p class="list-group-item-heading">
                <a href='${uriCompositionPage + item.uuid}' class='card-url'>
                    <h5 class='card-title'>${item.title}</h5>
                </a>
              </p>
              ${(typebadge !== 'user' && displayName) ?
                '<p><span class="d-inline-block text-truncate" style="max-width: 220px;">' +
                '<i class="fa fa-user"></i>&nbsp;' +
                '<a href=' + uriUserPage + item.owner_uuid + ' class="card-url">' + item.username + '&nbsp;' +
                '</a>' +
                '</span></p>' : ''}
              <p class='text-black-50'>${displayNumCollabs ? ('Collaborators: ' + displayNumCollabs) : ''}</p>
              <p class="list-group-item-text text-truncate">
                ${item.description || ''}
              </p>
              ${item.tracks?.length ? `<span class="play-control-card d-inline-block text-truncate" style="max-width: 200px;" ${last_track ? ` data-trackid="${last_track}"` : ''}>
                <i class='fa fa-play'>&nbsp;</i>Play last added track 
              </span>&nbsp;` : ''}
              <span class="d-inline-block text-truncate" style="max-width: 200px;">
                <i class='fa fa-music'></i>&nbsp;${'Tracks: ' + item.tracks?.length}
              </span>
            </div>`
}

export const getUICardElemForCollection = (typebadge, numitems, groupTitle, groupId, listgroup) => {

    const badegstyle = CARD_BADGE_STYLE[typebadge]
    const borderstyle = CARD_BORDER_STYLE[typebadge]
    const url = URI_PAGE[typebadge]
    const badgeDisplayed = `<span class="badge ${badegstyle} d-inline-block text-truncate" style="max-width:85%;">
                              <span class="badge badge-light">${numitems}</span>&nbsp;
                              ${url ? `<a href=${url + groupId} class="card-header-url">${groupTitle}</a>` : `${groupTitle}`}                              
                          </span>`

    return `<div id='${groupId}' class='card ${borderstyle}'>                        
              <h4>${badgeDisplayed}</h4>        
              <div class="card-body">
                <div class="list-group border">              
                  ${listgroup}
                </div>
              </div>
            </div>`
}

export const cleanWelcomeContainer = (hidetext, withScroll) => {
    const welcomecontainer = document.getElementById('welcomecontainer')
    const videoContainer = document.getElementById('landing-video-container')
    if (welcomecontainer.lastChild?.id  && welcomecontainer.lastChild?.id !== 'welcometext') {
      welcomecontainer.removeChild(welcomecontainer.lastChild)
    }
    if (!hidetext && !welcomecontainer.lastChild && !videoContainer) {
        const welcometextelem = document.createElement('div')
        welcometextelem.id = 'welcometext'
        welcometextelem.innerHTML = IS_AUTH ? '': `${WELCOME_VIDEO}`
        document.getElementById('welcomecontainer').appendChild(welcometextelem)
    }
    if(withScroll){
      document.getElementById('grid').scrollIntoView({
          behavior: 'smooth'
      })
    }
}

export const updateUIWithCollectionInfo = (collectiontitle, username, owner_uuid) => {

    cleanWelcomeContainer(true)
    const collectionInfoContainer = document.createElement('div')
    collectionInfoContainer.id = 'infocontainer'
    collectionInfoContainer.innerHTML = `<div class="card border-collection mb-3">
                                          <div class="card-header bg-transparent border-collection"><b>Collection</b></div>
                                          <div class="card-body text-dark">
                                            <h5 class="card-title">${collectiontitle}</h5>
                                            <p class="card-text" style="width:300px;">Holder: <a href=${uriUserPage + owner_uuid} class="card-url">${username}</a></p>
                                          </div>
                                        </div>`
    document.getElementById('welcomecontainer').appendChild(collectionInfoContainer)
}

export const updateUIWithUserInfo = (username, useruid) => {

    cleanWelcomeContainer(true)

    const userInfoContainer = document.createElement('div')
    userInfoContainer.id = 'infocontainer'
    userInfoContainer.innerHTML = `<div class="card mb-3" style="max-width: 540px;">
                                    <div class="row no-gutters">
                                      <div class="col-md-4">
                                        <img class="img-fluid hidden-first" src="https://picsum.photos/seed/${useruid}/200" alt="User Picture" width="200" height="200">
                                      </div>
                                      <div class="col-md-8">
                                        <div class="card-body">
                                          <h5 class="card-title">User</h5>
                                          <p class="card-text" style="width:300px;">${username ? `${username}` : ''}</p>                                        
                                          <p class="card-text"><small class="text-muted"></small></p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>`
    document.getElementById('welcomecontainer').appendChild(userInfoContainer)
}