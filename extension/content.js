function getProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\d+)\.html/);
    return match ? match[1] : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_INFO") {
        const productId = getProductId();
        
        // Перебираем все возможные места, где может быть цена
        let currentPrice = "Не найдена";
        
        // 1. Пытаемся найти по мета-тегам (самый надежный способ для всех языков)
        const metaPrice = document.querySelector('meta[property="og:title"]')?.content;
        const priceMatch = metaPrice?.match(/ILS\s?(\d+\.\d+)/) || metaPrice?.match(/₪\s?(\d+\.\d+)/);
        
        if (priceMatch) {
            currentPrice = priceMatch[0];
        } else {
            // 2. Если мета-теги не дали результат, ищем по классам
            const selectors = [
                '.product-price-current', 
                '.product-price-value',
                '[class*="priceText"]',
                '[class*="currentPrice"]',
                '.es--content--1p_9S_8' // специфичный для Ali класс
            ];
            
            for (let s of selectors) {
                const el = document.querySelector(s);
                if (el && el.innerText.length > 0) {
                    currentPrice = el.innerText;
                    break;
                }
            }
        }

        sendResponse({ id: productId, price: currentPrice });
    }
    return true; 
});
