let _USERNAME = null

export const isuserpage = (endpoint) => {
    let result = false
    if (endpoint === '/mycompositions' || endpoint.includes('/compositionsbyuserid/') || endpoint.includes('/collectionastreebyid/')){
        result = true
    } 
    return result    
}

const getCurrentUserName = () => {
    return _USERNAME
}

export const setCurrentUserName = (username) => {
    _USERNAME = username
}

export const displayUserNameInCard = (endpoint, username) => {
    let displayName = false
    if(!isuserpage(endpoint)){
      displayName = true
    } else {
      displayName = (username !== getCurrentUserName())
    }
    return displayName
  }

const getGroupsByCollAndUser = (compositionsList) => {

    const groupedbycoll = {}
    const groupedbyuser_aux = {}

    compositionsList.forEach(composition => {

        const collectionId = composition.collection_uid
        const userId = composition.user_id

        if (collectionId !== null) {
            if (!groupedbycoll[collectionId]) {
                groupedbycoll[collectionId] = []
            }
            groupedbycoll[collectionId].push(composition)
        } else {
            if (!groupedbyuser_aux[userId]) {
                groupedbyuser_aux[userId] = []
            }
            groupedbyuser_aux[userId].push(composition)
        }
    })

    return { groupedbycoll, groupedbyuser_aux }
}


const getGroupsByCollectionAndSubColl = (compositionsList, parent_coll_id) => {

    const groupedbycoll = {}
    const singlecomps = []

    compositionsList.forEach(composition => {

        const collectionId = composition.collection_uid

        if ((collectionId !== null) && (collectionId !== parent_coll_id)) {
            if (!groupedbycoll[collectionId]) {
                groupedbycoll[collectionId] = []
            }
            groupedbycoll[collectionId].push(composition)
        } else {
            singlecomps.push(composition)
        }
    })

    return { groupedbycoll, singlecomps}
}

const getGroupsByCollAndCollab = (compositionsList) => {

    const groupedbycoll = {}
    const groupedbycollab = {}
    const singlecomps = []

    compositionsList.forEach(composition => {

        const collectionId = composition.collection_uid        

        if (collectionId !== null) {
            if (!groupedbycoll[collectionId]) {
                groupedbycoll[collectionId] = []
            }
            groupedbycoll[collectionId].push(composition)
        } else if (composition.contributors.length){
            if (!groupedbycollab['collabs']) {
                groupedbycollab['collabs'] = []
            }
            groupedbycollab['collabs'].push(composition)
        } else {                
            singlecomps.push(composition)
        }
    })

    return { groupedbycoll, groupedbycollab, singlecomps }
}

// INFO: a group for a User is made if he has 2 or more compositions without Collection
const getFinalGroupByUserAndSingleComp = (groupedbyuser_aux) => {

    const groupedbyuser_final = {}
    const singlecomps = []

    for (const elem in groupedbyuser_aux) {

        if (groupedbyuser_aux[elem].length === 1) {
            singlecomps.push(groupedbyuser_aux[elem][0])
        } else {
            if (!groupedbyuser_final[elem]) {
                groupedbyuser_final[elem] = []
            }
            groupedbyuser_final[elem] = groupedbyuser_aux[elem]
        }
    }
    return { singlecomps, groupedbyuser_final }
}

export const getGroupedCompositionsWithUsers = (compositionsList) => {

    const { groupedbycoll, groupedbyuser_aux } = getGroupsByCollAndUser(compositionsList)

    const { singlecomps, groupedbyuser_final } = getFinalGroupByUserAndSingleComp(groupedbyuser_aux)

    return {
        groupedbycoll,
        groupedbyuser_final,
        singlecomps,
    }
}

export const getGroupedCompositionsWithCollab = (compositionsList) => {

    const { groupedbycoll, groupedbycollab, singlecomps } = getGroupsByCollAndCollab(compositionsList)    
    
    return {
        groupedbycoll,
        groupedbycollab,
        singlecomps,
    }
}

export const getGroupedCompositionsWithSubCollect = (compositionsList, parent_coll_id) => {

    const { groupedbycoll, singlecomps } = getGroupsByCollectionAndSubColl(compositionsList, parent_coll_id)    
    
    return {
        groupedbycoll,        
        singlecomps,
    }
}
