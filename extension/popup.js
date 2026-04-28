document.addEventListener('DOMContentLoaded', () => {
    const productIdEl = document.getElementById('productId');
    const priceValueEl = document.querySelector('.price-value');
    const statusText = document.getElementById('statusText');
    const checkBtn = document.getElementById('checkBtn');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PRODUCT_DATA" }, (res) => {
            if (res && res.id) {
                productIdEl.textContent = res.id;
                statusText.textContent = "Готов к анализу";
            } else {
                productIdEl.textContent = "Не найден";
            }
        });
    });

    checkBtn.addEventListener('click', () => {
        const id = productIdEl.textContent;
        if (!id || id === "Не найден") return;

        checkBtn.disabled = true;
        statusText.textContent = "Запрос к API...";

        chrome.runtime.sendMessage({ type: "FETCH_FROM_API", productId: id }, (response) => {
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
