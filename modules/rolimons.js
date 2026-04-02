//import {userId} from '../modules/currentPlayer.js'

const Rolimons = {
    _isBanned: false,
    _setBan: () => {
        if (this._isBanned === false) {
            this._isBanned = true
            setTimeout(() => {this._isBanned = false}, 40000)
        }
    },
    _handleErrors: (response) => {
        if (response.status == 403) {
            this._setBan()
            throw new Error("Banned.")
        }
        if (!response.ok) throw Error(response.statusText)
        return response
    }
}

// Item Details
Rolimons.itemDetails = {}

Rolimons.updateItemDetails = async () => {
    if (Rolimons._isBanned) throw new Error("Banned.")
    let resp = await fetch("https://api.rolimons.com/items/v2/itemdetails")
        .then(Rolimons._handleErrors)
        .then(res => res.json())

    // This variable is only used because rolimons doesn't really handle bundles yet
    let nameToAssetIdMap = {}

    let formattedInfo = Object.fromEntries(Object.entries(resp.items).map(([assetId, assetArr]) => {
        let assetInfo = {
            "name": assetArr[0],
            "rap": assetArr[2],
            "defaultValue": assetArr[4]
        }

        if (assetArr[1].length > 0) assetInfo.acronym = assetArr[1]
        if (assetArr[3] >= 0)       assetInfo.value = assetArr[3]
        if (assetArr[5] >= 0)       assetInfo.demand = assetArr[5]
        if (assetArr[6] >= 0)       assetInfo.trend = assetArr[6]
        if (assetArr[9] == 1)       assetInfo.rare = true


        // Add mapping from item name to item id
        nameToAssetIdMap[assetArr[0]] = assetId;

        return [assetId, assetInfo]
    }))

    Rolimons.itemDetails = formattedInfo
    
    chrome.storage.local.set({roliItems: formattedInfo})
    chrome.storage.local.set({nameToAssetIdMap: nameToAssetIdMap})
    
}

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == 'rbxutils-updateRoliItemDetails') {
        Rolimons.updateItemDetails()
    }
})
