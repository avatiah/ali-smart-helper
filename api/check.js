import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { id } = req.query;
    
    const appKey = process.env.ALI_API_KEY;
    const appSecret = process.env.ALI_API_SECRET;

    if (!id || !appKey || !appSecret) {
        return res.status(400).json({ error: "Missing parameters or keys" });
    }

    // 1. Формируем базовые параметры запроса
    const params = {
        method: 'aliexpress.affiliate.product.detail.get', // или ваш тестовый метод
        app_key: appKey,
        timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        format: 'json',
        v: '2.0',
        sign_method: 'md5',
        product_ids: id, // ID товара из расширения
        target_currency: 'ILS',
        target_language: 'RU'
    };

    // 2. Функция генерации подписи (SIGN)
    function generateSign(params, secret) {
        const sortedKeys = Object.keys(params).sort();
        let str = secret;
        for (const key of sortedKeys) {
            str += key + params[key];
        }
        str += secret;
        return crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
    }

    const sign = generateSign(params, appSecret);
    params.sign = sign;

    // 3. Выполняем запрос к шлюзу AliExpress
    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`https://eco.aliexpress.com/routerrest?${query}`);
        const data = await response.json();

        // Пробрасываем данные в расширение
        res.status(200).json({
            status: "success",
            source: "AliExpress API",
            details: data // Тут будут цены, купоны и рейтинг из API
        });
    } catch (error) {
        res.status(500).json({ error: "API connection failed" });
    }
}
