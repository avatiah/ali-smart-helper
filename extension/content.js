function getProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\d+)\.html/);
    return match ? match[1] : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_INFO") {
        const productId = getProductId();
        
        // Массив возможных селекторов цены (Ali часто их меняет)
        const priceSelectors = [
            '[class*="price--current"]',
            '[class*="product-price-value"]',
            '.pdp-info-left .price',
            '[data-pl="product-price"]'
        ];

        let currentPrice = "Не найдена";
        for (let selector of priceSelectors) {
            const el = document.querySelector(selector);
            if (el && el.innerText) {
                currentPrice = el.innerText.trim();
                break;
            }
        }

        sendResponse({ 
            id: productId, 
            price: currentPrice 
        });
    }
    return true; 
});
