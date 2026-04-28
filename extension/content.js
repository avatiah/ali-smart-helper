function getAliProductId() {
    const url = window.location.href;
    const match = url.match(/(\d{10,20})\.html/);
    return match ? match[1] : null;
}

// Отвечаем на запрос от попапа
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_DATA") {
        sendResponse({ id: getAliProductId() });
    }
    return true; 
});
