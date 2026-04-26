function getProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\d+)\.html/);
    return match ? match[1] : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_INFO") {
        let price = "Не найдена";

        // Самый надежный метод для иврит-версии — поиск в мета-тегах
        const metaPrice = document.querySelector('meta[property="og:title"]')?.content;
        const priceMatch = metaPrice?.match(/ILS\s?([\d\.,]+)/) || metaPrice?.match(/₪\s?([\d\.,]+)/);
        
        if (priceMatch) {
            price = priceMatch[0];
        } else {
            // Запасной вариант через визуальный поиск
            const visualPrice = document.querySelector('[class*="Price--extraPriceText"]') || 
                               document.querySelector('[class*="price--current"]');
            if (visualPrice) price = visualPrice.innerText;
        }

        sendResponse({ id: getProductId(), price: price });
    }
    return true; 
});
