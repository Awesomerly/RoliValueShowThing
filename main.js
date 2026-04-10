if (typeof importScripts !== 'undefined') {
    importScripts("modules/utils.js", "modules/rolimons.js")
}


async function startExtension() {
    
    await Rolimons.updateItemDetails()

    chrome.alarms.create('rbxutils-updateRoliItemDetails', {
        delayInMinutes: 10,
        periodInMinutes: 10
    })
}

startExtension()
