const getGroupsByCollAndUser = (compositionsList) => {

    const groupedbycoll = {}
    const groupedbyuser_aux = {}

    compositionsList.forEach(composition => {

        const collectionId = composition.collection_id
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

export const getGroupedCompositions = (compositionsList) => {

    const { groupedbycoll, groupedbyuser_aux } = getGroupsByCollAndUser(compositionsList)

    const { singlecomps, groupedbyuser_final } = getFinalGroupByUserAndSingleComp(groupedbyuser_aux)

    return {
        groupedbycoll,
        groupedbyuser_final,
        singlecomps,
    }
}
