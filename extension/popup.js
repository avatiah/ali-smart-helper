document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы и сразу проверяем их наличие
    const productIdEl = document.getElementById('productId');
    const statusText = document.getElementById('statusText');
    const checkBtn = document.getElementById('checkBtn');
    const priceValueEl = document.querySelector('.price-value');

    if (!productIdEl || !statusText || !checkBtn) {
        console.error("Критическая ошибка: элементы интерфейса не найдены");
        return;
    }

    // Запрашиваем ID у вкладки
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.id) return;

        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PRODUCT_DATA" }, (response) => {
            if (response && response.id) {
                productIdEl.textContent = response.id;
                statusText.textContent = "Готов к анализу";
            } else {
                productIdEl.textContent = "Не найден";
                statusText.textContent = "Зайдите на страницу товара";
            }
        });
    });

    // Обработка кнопки
    checkBtn.addEventListener('click', () => {
        const currentId = productIdEl.textContent;

        if (!currentId || currentId === "Определяем..." || currentId === "Не найден") return;

        checkBtn.disabled = true;
        statusText.textContent = "Запрос к API...";

        chrome.runtime.sendMessage({
            type: "FETCH_FROM_API",
            productId: currentId
        }, (response) => {
            checkBtn.disabled = false;

            if (response.success && response.data.status === "success") {
                statusText.textContent = "✅ Данные получены";
                if (priceValueEl) priceValueEl.textContent = `${response.data.price} ${response.data.currency}`;
            } else {
                // Выводим ошибку, которую прислал сервер (например, про ключи)
                const errorMsg = response.data?.msg || "Ошибка соединения";
                statusText.textContent = "❌ " + errorMsg;
            }
        });
    });
});
