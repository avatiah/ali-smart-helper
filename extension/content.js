function extractProductId() {
    const url = window.location.href;
    // Ищем 16 цифр в ссылке
    const match = url.match(/(\d{10,20})\.html/);
    if (match) return match[1];
    const params = new URLSearchParams(window.location.search);
    return params.get('itemId') || params.get('id');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_DATA") {
        sendResponse({ id: extractProductId() });
    }
    return true;
});
