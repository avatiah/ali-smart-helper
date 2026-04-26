// Слушаем сообщения от всплывающего окна (popup.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "FETCH_FROM_API") {
        
        // ВАЖНО: Подставьте ваш полный адрес, полученный в Vercel
        // Пример: https://ali-smart-helper-abc123.vercel.app
        const VERCEL_DOMAIN = 'https://ali-smart-helper.vercel.app'; 
        
        const apiUrl = `${VERCEL_DOMAIN}/api/check?id=${message.productId}`;

        console.log("Отправка запроса к API:", apiUrl);

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Данные от Vercel получены успешно:", data);
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                console.error("Критическая ошибка при запросе к Vercel:", error);
                sendResponse({ success: false, error: error.message });
            });
        
        // Возвращаем true, чтобы Chrome не закрывал канал связи до завершения fetch
        return true; 
    }
});
