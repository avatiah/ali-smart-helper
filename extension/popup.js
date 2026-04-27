document.addEventListener('DOMContentLoaded', function() {
    const checkBtn = document.getElementById('check-btn');
    const priceEl = document.getElementById('p-price');
    const ratingEl = document.getElementById('p-rating');
    const statusArea = document.getElementById('status-area');
    const idEl = document.getElementById('p-id');

    // 1. Получаем ID и цену со страницы через content.js
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "GET_PRODUCT_INFO"}, function(response) {
            if (response) {
                idEl.innerText = response.id || "---";
                priceEl.innerText = response.price || "Не найдена";
                
                // Автоматически нажимаем кнопку, если ID найден
                if (response.id) checkBtn.click();
            }
        });
    });

    // 2. Обработчик кнопки проверки через API
    checkBtn.addEventListener('click', function() {
        const productId = idEl.innerText; // Теперь productId берется из интерфейса
        
        if (!productId || productId === "---" || productId === "Определяем...") {
            statusArea.innerText = "❌ Ошибка: ID товара не определен";
            return;
        }

        checkBtn.disabled = true;
        statusArea.innerText = "⏳ Запрос к API...";

        chrome.runtime.sendMessage({
            type: "FETCH_FROM_API",
            productId: productId
        }, (response) => {
            checkBtn.disabled = false;
            if (response.success && response.data.status === "success") {
                const d = response.data;
                priceEl.innerText = `${d.price} ${d.currency}`;
                priceEl.style.color = "#28a745";
                ratingEl.innerText = `${d.rating} ⭐`;
                statusArea.innerText = `✅ Продавец: ${d.shop}`;
            } else {
                statusArea.innerText = "❌ Ошибка API: " + (response.data?.msg || "нет ответа");
            }
        });
    });
});
