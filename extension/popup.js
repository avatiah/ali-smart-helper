// ... внутри обработчика кнопки в popup.js ...
chrome.runtime.sendMessage({
    type: "FETCH_FROM_API",
    productId: productId
}, (response) => {
    checkBtn.disabled = false;
    
    if (response.success && response.data.status === "success") {
        const data = response.data;
        
        // 1. Обновляем цену из API (она точнее, чем со страницы)
        if (data.price) {
            document.getElementById('p-price').innerText = `${data.price} ${data.currency || 'ILS'}`;
            document.getElementById('p-price').style.color = "#28a745"; // Делаем зеленой, если из API
        }
        
        // 2. Обновляем рейтинг
        if (data.rating) {
            document.getElementById('p-rating').innerText = `${data.rating} ★`;
        }

        document.getElementById('status-area').innerText = "✅ Данные актуальны";
    } else {
        document.getElementById('status-area').innerText = "❌ Ошибка API: " + (response.data.msg || "нет данных");
    }
});
