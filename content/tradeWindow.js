const roliImg = chrome.runtime.getURL("assets/RolimonIcon.svg")

const processCards = async (offerListNode) => {
    const roliItemList = await Utils.getStorage('roliItems')
    const nameToAssetIdMap = await Utils.getStorage('nameToAssetIdMap')

    const offerHeader = document.querySelector(".trades-header-nowrap")
    // the element with the cards in it
    const itemCard = offerListNode.querySelector('.item-cards')
    // all of the individual cards
    const cardItems = itemCard.querySelectorAll('.item-card')

    let sideValue = 0

    for (card of cardItems) {
        let assetId = card.querySelector('.thumbnail-2d-container')
            .getAttribute('thumbnail-target-id')
        
        const itemName = card.querySelector('.item-card-name')
            .getAttribute("title")
        // might be used later for something
        // const uaid = card.querySelector(".item-card-container")
            // .getAttribute("data-userassetid")

        const itemRap = parseInt(card.querySelector(".text-robux").innerText.replace(/,/g, ''))

        let asset = roliItemList[assetId]
        if (typeof asset  === 'undefined') {
            guessedAssetId = nameToAssetIdMap[itemName]

            if (typeof guessedAssetId === 'undefined') {
                // This is not in roliimons
                asset = {  }
            } else {
                // This is a face that hasn't been added to rolimons yet.
                asset = roliItemList[guessedAssetId]
            }
        }
        if (asset.value) {
            // Main element
            let roliValue = document.createElement("div")
            roliValue.classList.add("text-overflow", "item-card-price")

            // Rolimons logo
            let roliLogo = document.createElement("span")
            roliLogo.classList.add("icon-robux-16x16")
            roliLogo.style.backgroundImage = `url(${roliImg})`
            roliLogo.style.backgroundPosition = "4px 0px"
            roliValue.appendChild(roliLogo)
            
            // Whitespace
            roliValue.appendChild(document.createTextNode("\u00A0"))

            // Value amount
            let valueText = document.createElement("span")
            valueText.classList.add("text-robux")
            valueText.innerText = `${asset.value.toLocaleString()}`
            roliValue.appendChild(valueText)

            card.querySelector('.item-card-caption').append(roliValue)
        }
        // if value null then add rap
        sideValue += asset.value ?? itemRap
    }
    
    const rapLine = offerListNode.querySelectorAll(".robux-line-amount:not(.roliTotal)")[1]

    const valLine = document.createElement("span")
    valLine.classList.add("robux-line-amount", "roliTotal")

    let roliTotalLogo = document.createElement("span")
    roliTotalLogo.classList.add("icon-robux-16x16")
    roliTotalLogo.style.backgroundImage = `url(${roliImg})`
    roliTotalLogo.style.backgroundPosition = "0px 0px"
    roliTotalLogo.style.filter = "brightness(500%)"
    valLine.appendChild(roliTotalLogo)
    
    // this gets the first one
    const robuxLine = offerListNode.querySelector(".robux-line-value")
    // Pull from config object when THAT's DONE T_T
    let robuxAmt = Math.ceil(parseInt(robuxLine.innerText.replace(/,/g, '')))
    sideValue += robuxAmt
    
    const totalValText = document.createElement("span")
    totalValText.classList.add("text-robux-lg", "robux-line-value")
    totalValText.innerText = sideValue.toLocaleString()

    valLine.appendChild(totalValText)
    rapLine.parentElement.appendChild(valLine)
    
}

let observer = new MutationObserver(mutations => {
    for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue
            if (node.matches('.trade-list-detail-offer')) {
                processCards(node)
            }
        }
    }
})

function activate_trade_list_observer(url) {
    const targetNode = document.querySelector('.trades-list-detail')

    const is_the_right_page = url.includes("trades?")

    if (!is_the_right_page) return

    if (targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true })
    }
}

// Re-activate mutation observer when the URL is just right again.
if (window.navigation) {
    window.navigation.addEventListener('navigate', (event) => {
        activate_trade_list_observer(event.destination.url)
    });
}

// Re-activate mutation observer when using the back button
window.addEventListener('popstate', (event) => {
    activate_trade_list_observer(document.URL)
});

activate_trade_list_observer(document.URL)
