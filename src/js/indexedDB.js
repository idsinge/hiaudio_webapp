/* SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database */

// Create an objectStore to hold information about track settings. We're
// going to use 'track_id' as our key path because it's guaranteed to be
// unique

const dbName = 'TracksDB'
export let DB = null

export const openDB = () => {

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 2)

        request.onerror = (event) => {
            console.log(event)
            reject(new Error('Error opening database'))
        }
        request.onsuccess = (event) => {
            const db = event.target.result
            DB = db
            resolve(db)
        }
        request.onupgradeneeded = (event) => {
            const db = event.target.result
            DB = db
            const objectStore = db.createObjectStore('tracks', { keyPath: 'track_id' })
            // Create an index to search tracks by composition        
            objectStore.createIndex('composition_id', 'composition_id', { unique: false })
            objectStore.transaction.oncomplete = (event) => {
                resolve(db)
            }
        }
    })

}

export const updateTable = (db, info) => {
    if (!db) return
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['tracks'], 'readwrite')
        transaction.oncomplete = (event) => {
            resolve()
        }
        transaction.onerror = (event) => {
            console.log('error', event)
            reject(new Error('Error updating database'))
        }
        const objectStore = transaction.objectStore('tracks')
        objectStore.put(info)
    })
}

export const getTracksByCompId = (db, compId) => {
    if (!db) return
    return new Promise((resolve, reject) => {
        let listTracks = []
        const index = db.transaction('tracks').objectStore('tracks').index('composition_id')
        const singleKeyRange = IDBKeyRange.only(compId)
        index.openCursor(singleKeyRange).onsuccess = (event) => {
            const cursor = event.target.result
            if (cursor) {
                listTracks.push(cursor.value)
                cursor.continue()
            } else {                
                resolve(listTracks)
            }
        }
    })
}