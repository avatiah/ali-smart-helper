document.addEventListener('DOMContentLoaded', () => {
    const productIdEl = document.getElementById('productId');
    const priceValueEl = document.querySelector('.price-value');
    const statusText = document.getElementById('statusText');
    const checkBtn = document.getElementById('checkBtn');

    let fallbackPrice = null;

    // Запрашиваем данные у контент-скрипта
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PRODUCT_DATA" }, (response) => {
            if (response && response.id) {
                productIdEl.textContent = response.id;
                fallbackPrice = response.pagePrice;
                statusText.textContent = "Готов к анализу";
            } else {
                productIdEl.textContent = "Не найден";
                statusText.textContent = "Перейдите на страницу товара";
            }
        });
    });

    checkBtn.addEventListener('click', () => {
        const currentId = productIdEl.textContent;

        if (!currentId || currentId === "Определяем..." || currentId === "Не найден") {
            return alert("ID товара не определен");
        }

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
                // Если API выдало 404, показываем цену, найденную на странице
                if (fallbackPrice) {
                    priceValueEl.textContent = fallbackPrice;
                    statusText.textContent = "⚠️ Цена со страницы (API недоступно)";
                } else {
                    statusText.textContent = "❌ Ошибка: " + (response.data?.msg || "неизвестно");
                }
            }
        });
    });
});
