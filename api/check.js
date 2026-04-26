import crypto from 'crypto';

export default async function handler(req, res) {
    // Разрешаем запросы из вашего расширения
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { id } = req.query;
    
    // Подтягиваем ключи из настроек Vercel (Environment Variables)
    const appKey = process.env.ALI_API_KEY;
    const appSecret = process.env.ALI_API_SECRET;

    // Проверка входных данных
    if (!id) return res.status(200).json({ status: "error", msg: "ID товара не передан" });
    if (!appKey || !appSecret) {
        return res.status(200).json({ 
            status: "system_error", 
            msg: "Ключи API не настроены в Vercel Settings" 
        });
    }

    try {
        // 1. Формируем параметры по протоколу AliExpress TOP
        const params = {
            method: 'aliexpress.affiliate.product.detail.get',
            app_key: appKey,
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            format: 'json',
            v: '2.0',
            sign_method: 'md5',
            product_ids: id,
            target_currency: 'ILS',
            target_language: 'RU'
        };

        // 2. Генерируем подпись (SIGN)
        const sortedKeys = Object.keys(params).sort();
        let str = appSecret;
        for (const key of sortedKeys) {
            str += key + params[key];
        }
        str += appSecret;
        
        const sign = crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
        params.sign = sign;

        // 3. Отправляем запрос на сервер AliExpress
        const query = new URLSearchParams(params).toString();
        const apiUrl = `https://eco.aliexpress.com/routerrest?${query}`;
        
        const response = await fetch(apiUrl);
        const result = await response.json();

        // 4. Глубокий поиск данных в ответе (учитываем вложенность API)
        const productData = result.aliexpress_affiliate_product_detail_get_response?.resp_result?.result?.products?.product?.[0];

        if (!productData) {
            // Если API ответило, но товара нет в партнерской программе
            return res.status(200).json({ 
                status: "empty", 
                msg: "Товар не найден в базе данных API",
                raw: result // для отладки, если нужно
            });
        }

        // 5. Возвращаем только чистые данные для расширения
        res.status(200).json({
            status: "success",
            price: productData.target_sale_price || productData.sale_price,
            currency: productData.target_sale_price_currency || "ILS",
            rating: productData.evaluate_rate || "5.0",
            shop: productData.shop_info?.shop_name || "AliExpress Store",
            commission: productData.commission_rate ? `${productData.commission_rate}%` : "0%"
        });

    } catch (error) {
        console.error("Критическая ошибка сервера:", error);
        res.status(500).json({ status: "server_error", msg: error.message });
    }
}
