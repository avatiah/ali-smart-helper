// Функция для точного извлечения ID из URL AliExpress
function extractProductId() {
    const url = window.location.href;
    // Ищем последовательность от 10 до 20 цифр перед .html
    const match = url.match(/(\d{10,20})\.html/);
    if (match) return match[1];
    
    // Запасной вариант: поиск в параметрах ссылки
    const params = new URLSearchParams(window.location.search);
    return params.get('itemId') || params.get('id');
}

// Слушаем запрос от всплывающего окна (popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_DATA") {
        const id = extractProductId();
        sendResponse({ id: id });
    }
    return true; // Важно для асинхронной связи
});
