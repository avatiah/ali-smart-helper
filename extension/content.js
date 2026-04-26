function getProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\d+)\.html/);
    return match ? match[1] : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_INFO") {
        let price = "Не найдена";

        // Способ 1: Ищем в скрытом JSON на странице (самый точный метод)
        try {
            const scripts = document.querySelectorAll('script');
            for (let s of scripts) {
                if (s.innerText.includes('window.runParams')) {
                    const priceMatch = s.innerText.match(/"actProductAmount":\s*\{"value":([\d\.]+)/);
                    if (priceMatch) { price = priceMatch[1] + " ₪"; break; }
                }
            }
        } catch (e) {}

        // Способ 2: Визуальные селекторы (если JSON не сработал)
        if (price === "Не найдена") {
            const selectors = [
                '[class*="Price--extraPriceText"]',
                '[class*="price--current"]',
                '.product-price-value'
            ];
            for (let s of selectors) {
                const el = document.querySelector(s);
                if (el && el.innerText) { price = el.innerText; break; }
            }
        }

        sendResponse({ id: getProductId(), price: price });
    }
    return true; 
});
