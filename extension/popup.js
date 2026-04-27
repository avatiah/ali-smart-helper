document.addEventListener('DOMContentLoaded', () => {
    const productIdEl = document.getElementById('productId');
    const priceValueEl = document.querySelector('.price-value');
    const statusText = document.getElementById('statusText');
    const checkBtn = document.getElementById('checkBtn');

    // 1. Сразу при открытии запрашиваем ID у страницы
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PRODUCT_DATA" }, (response) => {
                if (response && response.id) {
                    productIdEl.textContent = response.id;
                    statusText.textContent = "Готов к анализу";
                } else {
                    productIdEl.textContent = "Не найден";
                    statusText.textContent = "Зайдите на страницу товара";
                }
            });
        }
    });

    // 2. Обработка нажатия на кнопку
    checkBtn.addEventListener('click', () => {
        const currentId = productIdEl.textContent;

        // Блокируем нажатие, если ID не определен
        if (!currentId || currentId === "Определяем..." || currentId === "Не найден") {
            return;
        }

        checkBtn.disabled = true;
        statusText.textContent = "Запрос к API...";
        priceValueEl.textContent = "--";

        // Отправляем запрос в background.js (который стучится в твой Vercel)
        chrome.runtime.sendMessage({
            type: "FETCH_FROM_API",
            productId: currentId
        }, (response) => {
            checkBtn.disabled = false;

            if (response.success && response.data.status === "success") {
                statusText.textContent = "✅ Данные получены";
                priceValueEl.textContent = `${response.data.price} ${response.data.currency}`;
            } else {
                // Если API вернуло ошибку (например, ключи или 404)
                const errorMsg = response.data?.msg || "Ошибка соединения";
                statusText.textContent = "❌ " + errorMsg;
                console.error("API Error:", errorMsg);
            }
        });
    });
});
