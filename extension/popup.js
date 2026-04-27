document.addEventListener('DOMContentLoaded', () => {
    const productIdEl = document.getElementById('productId');
    const priceValueEl = document.querySelector('.price-value');
    const statusText = document.getElementById('statusText');
    const checkBtn = document.getElementById('checkBtn');

    // Получаем ID от content.js
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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
                priceValueEl.textContent = `${response.data.price} ${response.data.currency}`;
            } else {
                statusText.textContent = "❌ " + (response.data?.msg || "Ошибка");
            }
        });
    });
});
