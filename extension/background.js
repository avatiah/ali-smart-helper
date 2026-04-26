chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "FETCH_FROM_API") {
        // ЗАМЕНКА: Когда задеплоим на Vercel, заменим этот URL на реальный
        const vercelUrl = `https://your-api-bridge.vercel.app/api/check?id=${message.productId}`;

        fetch(vercelUrl)
            .then(response => response.json())
            .then(data => sendResponse({ success: true, data: data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true; // Держим канал связи открытым для асинхронного ответа
    }
});
