import { callJsonApi, activateGoHomeLink } from '../../../common/js/utils'
import {breadcrumbHandler, navigate} from './breadcrumbhandler'
import {checkIfTermsAccepted, generateAcceptTermsModal} from '../../../common/js/acceptterms'
import {getLegendButtons,
  paintMainElemsHomePage,
  paintSingleComposition,
  getUIListElemInsideCollection,
  getUICardElemForCollection,
  cleanWelcomeContainer,
  updateUIWithCollectionInfo,
  updateUIWithUserInfo,
  initNavigationMenu
} from './home_ui'
import {getGroupedCompositionsWithUsers,
  getGroupedCompositionsWithCollab,
  isuserpage,
  getGroupedCompositionsWithSubCollect,
  setCurrentUserName}
from './home_helper'
import {setPlayButtonsHandler, fabPlayButtonClickHandler, prepareAudioTrackPlaylist} from './audioplayer'

export const uriCompositionPage = '/composition.html?compositionId='
export let IS_AUTH = false

const homePageTermsAccepted = (termsAccepted) => {    
    if(!termsAccepted){
        generateAcceptTermsModal('header')
    } 
}
const getMyProfile = async () => {
  
  const isAuthenticated = await callJsonApi('/profile', 'GET', null, 'Loading profile...')
  if (isAuthenticated.ok) {
    setCurrentUserName(isAuthenticated.name)
    document.getElementById('userlogin').style.display = 'none'
    document.getElementById('useroptions').style.display = ''
    document.getElementById('display_profile_name').innerText = `[${isAuthenticated.name}]`    
    checkIfTermsAccepted(isAuthenticated, homePageTermsAccepted)    
  }
  return isAuthenticated
}

export const getMyCompositions = async () => {
  const endpoint = '/mycompositions'
  const data = await callJsonApi(endpoint, 'GET', null, 'Loading my music...')
  if(data.compositions){
    return renderHomePage(data.compositions, endpoint)
  } else {
    alert('invalid return value for compisitions list')
  }  
}

const getCompositionsByUserUid = async (useruid, auth) => {
  const endpoint = '/compositionsbyuserid/'+useruid
  const data = await callJsonApi(endpoint, 'GET', null, 'Loading user...')
  if(data.compositions){
    setCurrentUserName(data.username)
    updateUIWithUserInfo(data.username, useruid)
    return renderHomePage(data.compositions, endpoint)
  } else {
    alert('invalid return value for user id')
    if(auth.ok){
      navigate('my-comp')
    } else {
      navigate('recent-comp')
    }      
  }  
}

const getCompositionsByColelctionUid = async (collectionuid, auth) => {
  const endpoint = '/collectionastreebyid/'+collectionuid
  const data = await callJsonApi(endpoint, 'GET', null, 'Loading collection...')
  if(data.compositions){
    setCurrentUserName(data.username)
    updateUIWithCollectionInfo(data.collection_name, data.username, data.owneruid)
    return renderHomePage(data.compositions, endpoint)
  } else {
    alert('invalid return value for collection id')
    if(auth.ok){
      navigate('my-comp')
    } else {
      navigate('recent-comp')
    }      
  }  
}

export const getRecentCompositions = async (withScroll) => {
  const endpoint = '/recentcompositions'
  const data = await callJsonApi('/recentcompositions', 'GET', null, 'Loading recent...')
  return renderHomePage(data?.compositions || [], endpoint, withScroll)
}

export const getAllCompositions = async (withScroll) => {
  const endpoint = '/compositions'
  const data = await callJsonApi('/compositions', 'GET', null, 'Loading all...')
  return renderHomePage(data?.compositions || [], endpoint, withScroll)
}

const renderHomePage = (compositionsList, endpoint, withScroll) => {
  document.getElementById('grid').innerHTML = ''
  document.getElementById('legendbuttons').innerHTML = ''
  const notUserPublicPage = !endpoint.includes('/compositionsbyuserid/') && !endpoint.includes('/collectionastreebyid/')
  if(notUserPublicPage){
    cleanWelcomeContainer(false, withScroll)
  }
  if (!compositionsList.length && notUserPublicPage) {
    document.getElementById('initialmessage').hidden = false
    document.getElementById('initialmessage').classList.add('d-flex')
  } else {   
    renderHomePageWithLists(compositionsList, endpoint)
  }
  prepareAudioTrackPlaylist(compositionsList)
  setPlayButtonsHandler()
}

const renderHomePageWithLists = (compositionsList, endpoint) => {
  if(endpoint.includes('/collectionastreebyid/')){        
    const parent_coll_id = endpoint.replace('/collectionastreebyid/', '')
    const groupedCompsAndSubColl = getGroupedCompositionsWithSubCollect(compositionsList, parent_coll_id)       
    paintListOfCompositions(groupedCompsAndSubColl, null, endpoint, compositionsList.length)
  } else if (!isuserpage(endpoint)) {
    const groupedComps = getGroupedCompositionsWithUsers(compositionsList)
    paintListOfCompositions(groupedComps, 'groupedbyuser_final', endpoint, compositionsList.length)
  }else {
    const groupedCompsWithCollab = getGroupedCompositionsWithCollab(compositionsList)
    paintListOfCompositions(groupedCompsWithCollab, 'groupedbycollab', endpoint, compositionsList.length)
  }
}

const paintGroupCollection = (listcomps, typebadge, endpoint) => {
  
  let allCompUIelem = ''  
  for (const comp in listcomps) {    
    const element = listcomps[comp]
    let listgroup = ''
    let groupTitle = ''
    let groupId = null
    if(typebadge === 'collab') {
      groupTitle = 'Collaborations'
    } else if (typebadge === 'coll'){
      groupTitle = Object.values(element)[0].parent_collection
      groupId = Object.values(element)[0].collection_uid
    } else {
      groupTitle = Object.values(element)[0].username
      groupId = Object.values(element)[0].owner_uuid
    } 
    for (const item of element) {      
      listgroup += getUIListElemInsideCollection(item, typebadge, endpoint)
    }    
    allCompUIelem += getUICardElemForCollection(typebadge, element.length, groupTitle, groupId, listgroup)
  }
  return allCompUIelem
}

const getSingleComps = (groupedComps, endpoint) => {
  let listElelemts = ''
  const listCompsSingle = groupedComps.singlecomps
  listCompsSingle?.forEach((element) => {
    const template = paintSingleComposition(element, endpoint)
    listElelemts += template
  })
  return listElelemts
}

const paintListOfCompositions = (groupedComps, customgroup, endpoint, totalcomps) => {
  
  let listElelemts = ''
  const numberGroupsByCollections = Object.keys(groupedComps.groupedbycoll).length
  const numberCustomGroups = customgroup ? Object.keys(groupedComps[customgroup]).length : 0
  let numberSinglComp = groupedComps.singlecomps.length

  if (numberGroupsByCollections > 0) {
    const listComps = groupedComps.groupedbycoll
    const template = paintGroupCollection(listComps, 'coll', endpoint)
    listElelemts += template
  }
  if (numberCustomGroups > 0) {
    const listComps = groupedComps[customgroup]
    const typeofbadge = (customgroup==='groupedbycollab') ? 'collab' : 'user'
    const template = paintGroupCollection(listComps, typeofbadge, endpoint)
    listElelemts += template
  }
  if (numberSinglComp > 0) {
    listElelemts += getSingleComps(groupedComps, endpoint)    
  }
  const legendButtons = getLegendButtons(numberGroupsByCollections, numberCustomGroups, numberSinglComp, endpoint, totalcomps) 
  paintMainElemsHomePage(listElelemts, legendButtons)
}

const initHomPage = async () => {  
  const queryString = window.location.search
  const user_id = queryString.split('userid=')[1]
  const collection_uid = queryString.split('collectionid=')[1]
  let isAuth  = await getMyProfile()
  IS_AUTH = isAuth.ok
  if(user_id){    
    await getCompositionsByUserUid(user_id, isAuth)
  } else if(collection_uid){
    await getCompositionsByColelctionUid(collection_uid, isAuth)
  } else if (isAuth.ok) {
    await getMyCompositions()
  } else {
    await getRecentCompositions()
  }
  breadcrumbHandler(isAuth, user_id || collection_uid)
}

initNavigationMenu()
activateGoHomeLink()
initHomPage()
fabPlayButtonClickHandler()