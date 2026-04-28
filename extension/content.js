function extractProductId() {
    const url = window.location.href;
    const match = url.match(/(\d{10,20})\.html/);
    if (match) return match[1];
    const params = new URLSearchParams(window.location.search);
    return params.get('itemId') || params.get('id');
}

function getPriceFromPage() {
    const selectors = ['.pdp-price', '[class*="price--current"]', '.product-price-value'];
    for (let s of selectors) {
        const el = document.querySelector(s);
        if (el && el.innerText) return el.innerText.trim();
    }
    return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_DATA") {
        sendResponse({ 
            id: extractProductId(), 
            pagePrice: getPriceFromPage() 
        });
    }
    return true;
});
