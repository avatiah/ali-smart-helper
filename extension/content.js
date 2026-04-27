// Функция для поиска ID товара
function extractProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\+d)\.html/);
    if (match) return match[1];
    const params = new URLSearchParams(window.location.search);
    return params.get('itemId');
}

// Новая функция: берем цену прямо с экрана
function getPriceFromPage() {
    const priceSelectors = [
        '.pdp-info-left .pdp-price',
        '[class*="price--current"]',
        '.product-price-value',
        '#j-sku-discount-price',
        '.original-price-container'
    ];
    
    for (let selector of priceSelectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText.length > 0) return el.innerText;
    }
    return null;
}

// Слушаем запросы от попапа
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_DATA") {
        sendResponse({ 
            id: extractProductId(), 
            pagePrice: getPriceFromPage() 
        });
    }
    return true;
});
