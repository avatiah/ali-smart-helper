document.addEventListener('DOMContentLoaded', () => {
    // 1. Спрашиваем у страницы AliExpress данные о товаре
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {type: "GET_PRODUCT_INFO"}, (response) => {
            if (response) {
                document.getElementById('p-id').innerText = response.id || "Не найден";
                document.getElementById('p-price').innerText = response.price || "Н/Д";
            }
        });
    });

    // 2. Обработка клика по кнопке
    document.getElementById('check-btn').addEventListener('click', () => {
        const productId = document.getElementById('p-id').innerText;
        const status = document.getElementById('status');
        
        if (productId === "-" || productId === "Не найден") {
            status.innerText = "Зайдите на страницу товара!";
            return;
        }

        status.innerText = "Запрос к API...";
        
        chrome.runtime.sendMessage({
            type: "FETCH_FROM_API",
            productId: productId
        }, (response) => {
            if (response.success) {
                status.innerText = "Данные получены (см. консоль)";
                console.log("Ответ от Vercel:", response.data);
            } else {
                status.innerText = "Ошибка: " + response.error;
            }
        });
    });
});
