function getProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\d+)\.html/);
    return match ? match[1] : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_INFO") {
        let currentPrice = "Не найдена";

        // 1. Ищем цену в объекте данных страницы (наиболее точно)
        const scripts = document.querySelectorAll('script');
        for (let script of scripts) {
            if (script.innerText.includes('actProductAmount')) {
                const match = script.innerText.match(/"value":(\d+\.?\d*)/);
                if (match) {
                    currentPrice = match[1] + " ILS";
                    break;
                }
            }
        }

        // 2. Если в скриптах нет, ищем по визуальным элементам (для иврита)
        if (currentPrice === "Не найдена") {
            const priceEl = document.querySelector('[class*="Price--extraPriceText"]') || 
                           document.querySelector('[class*="price--current"]') ||
                           document.querySelector('.pdp-info-left .price');
            if (priceEl) currentPrice = priceEl.innerText;
        }

        sendResponse({ id: getProductId(), price: currentPrice });
    }
    return true; 
});
