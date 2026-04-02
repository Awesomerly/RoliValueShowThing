const Utils = {}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Utils.randomIndex = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

Utils.iterateWithCursor = async (url) => {
    let result = []

    let nextPageCursor = ' '

    let getPages = async () => {
        while (nextPageCursor) {
            let resp = await fetch(url + `&cursor=${nextPageCursor}`).then(x => x.json())

            result.push(...resp.data)
            nextPageCursor = resp.nextPageCursor
            await sleep(200)
        }
    }

    await getPages()
    return result
}

Utils.getStorage = (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (val) => {
            resolve(Object.values(val)[0])
        })
    })
}