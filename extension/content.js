function getProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\d+)\.html/);
    return match ? match[1] : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_INFO") {
        let price = "Не найдена";

        // 1. Пытаемся вытащить из мета-тега (самый надежный способ)
        const metaPrice = document.querySelector('meta[property="og:title"]')?.content;
        // Ищем паттерн цены (число с точкой)
        const priceMatch = metaPrice?.match(/ILS\s?([\d\.,]+)/) || metaPrice?.match(/₪\s?([\d\.,]+)/);
        
        if (priceMatch) {
            price = priceMatch[0];
        } else {
            // 2. Ищем в специальном JSON объекте страницы
            const scripts = document.querySelectorAll('script');
            for (let s of scripts) {
                if (s.innerText.includes('actProductAmount')) {
                    const match = s.innerText.match(/"value":([\d\.]+)/);
                    if (match) { price = match[1] + " ILS"; break; }
                }
            }
        }

        // 3. Крайний случай — по селектору для иврита
        if (price === "Не найдена") {
            const el = document.querySelector('[class*="Price--extraPriceText"]') || 
                       document.querySelector('[class*="price--current"]');
            if (el) price = el.innerText;
        }

        sendResponse({ id: getProductId(), price: price });
    }
    return true; 
});
