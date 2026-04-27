document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const checkBtn = document.getElementById('check-btn');
    const priceEl = document.getElementById('p-price');
    const ratingEl = document.getElementById('p-rating');
    const statusArea = document.getElementById('status-area');
    const idEl = document.getElementById('p-id');

    // 1. Сначала запрашиваем данные напрямую со страницы (через content.js)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0]) return;

        chrome.tabs.sendMessage(tabs[0].id, {type: "GET_PRODUCT_INFO"}, function(response) {
            if (response) {
                // Отображаем ID и ту цену, которую удалось (или не удалось) найти на странице
                idEl.innerText = response.id || "---";
                priceEl.innerText = response.price || "Не найдена";
                
                // Если ID успешно определен, автоматически запускаем проверку через API
                if (response.id && response.id !== "---") {
                    fetchDataFromVercel(response.id);
                }
            } else {
                statusArea.innerText = "❌ Не удалось связаться со страницей";
            }
        });
    });

    // 2. Обработчик клика по кнопке (для ручного обновления)
    checkBtn.addEventListener('click', function() {
        const currentId = idEl.innerText;
        if (currentId && currentId !== "---" && currentId !== "Определяем...") {
            fetchDataFromVercel(currentId);
        } else {
            statusArea.innerText = "❌ Сначала откройте товар на AliExpress";
        }
    });

    // 3. Основная функция запроса к вашему серверу Vercel
    function fetchDataFromVercel(productId) {
        checkBtn.disabled = true;
        statusArea.innerHTML = "⏳ <span style='color: #666'>Запрос к API...</span>";

        chrome.runtime.sendMessage({
            type: "FETCH_FROM_API",
            productId: productId
        }, (response) => {
            checkBtn.disabled = false;

            if (response && response.success && response.data.status === "success") {
                const d = response.data;
                
                // Обновляем цену (делаем её зеленой и крупной)
                priceEl.innerText = `${d.price} ${d.currency}`;
                priceEl.style.color = "#28a745";
                priceEl.style.fontWeight = "bold";

                // Обновляем рейтинг
                ratingEl.innerText = `${d.rating} ★`;
                
                // Обновляем статус
                statusArea.innerHTML = `✅ <span style="color: #28a745">Данные получены: ${d.shop}</span>`;
            } else {
                // Если API вернуло ошибку или ключи не настроены
                const errorMsg = response?.data?.msg || response?.error || "Ошибка сети";
                statusArea.innerHTML = `❌ <span style="color: #d93025">Ошибка: ${errorMsg}</span>`;
                console.error("Ошибка API:", response);
            }
        });
    }
});
