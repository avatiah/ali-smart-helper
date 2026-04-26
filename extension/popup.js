document.addEventListener('DOMContentLoaded', () => {
    const idEl = document.getElementById('p-id');
    const priceEl = document.getElementById('p-price');
    const statusEl = document.getElementById('status-area');
    const checkBtn = document.getElementById('check-btn');

    // 1. Получаем данные от вкладки AliExpress
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // Проверяем, что мы на странице товара
        if (tabs[0].url.includes("aliexpress.com/item") || tabs[0].url.includes("aliexpress.ru/item")) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "GET_PRODUCT_INFO"}, (response) => {
                if (response) {
                    idEl.innerText = response.id || "Не найден";
                    priceEl.innerText = response.price || "Цена вкл.";
                } else {
                    statusEl.innerText = "Обновите страницу товара";
                }
            });
        } else {
            idEl.innerText = "---";
            priceEl.innerText = "Не товар";
            statusEl.innerText = "Зайдите на страницу товара";
            checkBtn.disabled = true;
        }
    });

    // 2. Логика кнопки — запрос к вашему мосту на Vercel
    checkBtn.addEventListener('click', () => {
        const productId = idEl.innerText;
        if (productId === "Определяем..." || productId === "---") return;

        statusEl.innerText = "⚡ Запрос к вашему API...";
        checkBtn.disabled = true;

        chrome.runtime.sendMessage({
            type: "FETCH_FROM_API",
            productId: productId
        }, (response) => {
            checkBtn.disabled = false;
            if (response.success) {
                statusEl.innerText = "✅ Данные получены";
                console.log("Ответ от Vercel:", response.data);
                // Здесь можно обновить рейтинг или другие данные из API
                if (response.data.rating) {
                    document.getElementById('p-rating').innerText = response.data.rating;
                }
            } else {
                statusEl.innerText = "❌ Ошибка: " + response.error;
            }
        });
    });
});
// ... начало файла без изменений ...

        chrome.runtime.sendMessage({
            type: "FETCH_FROM_API",
            productId: productId
        }, (response) => {
            checkBtn.disabled = false;
            if (response.success && response.data.status === "success") {
                const d = response.data;
                document.getElementById('p-price').innerText = `${d.price} ${d.currency}`;
                document.getElementById('p-rating').innerText = `${d.rating} ⭐`;
                document.getElementById('status-area').innerText = `✅ Продавец: ${d.shop}`;
            } else {
                document.getElementById('status-area').innerText = "❌ API: " + (response.data.msg || "Ошибка");
            }
        });
// ...
