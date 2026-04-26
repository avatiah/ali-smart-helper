// Функция для поиска ID товара в URL страницы
function getProductId() {
    const url = window.location.href;
    const match = url.match(/item\/(\d+)\.html/);
    return match ? match[1] : null;
}

// Слушаем запросы от всплывающего окна (popup.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_INFO") {
        const productId = getProductId();
        // Пытаемся найти цену на странице (селектор может меняться, это база)
        const priceElement = document.querySelector('.product-price-value') || 
                           document.querySelector('[class*="price--current"]');
        
        const currentPrice = priceElement ? priceElement.innerText : "Цена не определена";

        sendResponse({ 
            id: productId, 
            price: currentPrice 
        });
    }
    return true; 
});
