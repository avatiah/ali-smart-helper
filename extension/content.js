function extractId() {
    const match = window.location.href.match(/(\d{10,20})\.html/);
    return match ? match[1] : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PRODUCT_DATA") {
        sendResponse({ id: extractId() });
    }
    return true;
});
