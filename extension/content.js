function getProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\d+)\.html/);
    return match ? match[1] : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_INFO") {
        let price = "Не найдена";
        
        // Поиск в мета-тегах (лучший способ для he.aliexpress.com)
        const metaPrice = document.querySelector('meta[property="og:title"]')?.content;
        const priceMatch = metaPrice?.match(/ILS\s?([\d\.,]+)/) || metaPrice?.match(/₪\s?([\d\.,]+)/);
        
        if (priceMatch) {
            price = priceMatch[0];
        } else {
            const visual = document.querySelector('[class*="Price--extraPriceText"]') || 
                           document.querySelector('[class*="price--current"]');
            if (visual) price = visual.innerText;
        }

        sendResponse({ id: getProductId(), price: price });
    }
    return true; 
});
