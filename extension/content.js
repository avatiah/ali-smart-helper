function getProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\d+)\.html/);
    return match ? match[1] : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_INFO") {
        let finalPrice = "Не найдена";

        // Поиск в скрытых данных AliExpress (window.runParams)
        const scripts = document.querySelectorAll('script');
        for (let s of scripts) {
            if (s.innerText.includes('window.runParams')) {
                // Ищем значение actProductAmount
                const amountMatch = s.innerText.match(/"actProductAmount":\{"value":([\d\.]+)/);
                if (amountMatch) {
                    finalPrice = amountMatch[1] + " ILS";
                    break;
                }
            }
        }

        // Запасной вариант по визуальным элементам (для иврита)
        if (finalPrice === "Не найдена") {
            const visualPrice = document.querySelector('[class*="Price--extraPriceText"]') || 
                               document.querySelector('[class*="price--current"]');
            if (visualPrice) finalPrice = visualPrice.innerText;
        }

        sendResponse({ id: getProductId(), price: finalPrice });
    }
    return true; 
});
