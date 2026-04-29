const crypto = require('crypto');

module.exports = async (req, res) => {
    // Настройка заголовков для работы расширения (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;

    // ТЕСТ: Если вы просто откроете ссылку в браузере, увидите это:
    if (!id) {
        return res.status(200).json({ 
            status: "online", 
            version: "1.1.0",
            env_check: process.env.ALI_APP_KEY ? "Ключи загружены" : "Ключи не найдены"
        });
    }

    const appKey = process.env.ALI_APP_KEY;
    const secret = process.env.ALI_SECRET_KEY;

    try {
        const params = {
            method: 'aliexpress.affiliate.product.detail.get',
            app_key: appKey.trim(),
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 19),
            format: 'json',
            v: '2.0',
            sign_method: 'md5',
            product_ids: id
        };

        // Генерация подписи (Sign)
        const sortedKeys = Object.keys(params).sort();
        let str = secret.trim();
        for (const key of sortedKeys) str += key + params[key];
        str += secret.trim();
        const sign = crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
        params.sign = sign;

        const apiUrl = `https://eco.aliexpress.com/routerrest?${new URLSearchParams(params)}`;
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        const product = result.aliexpress_affiliate_product_detail_get_response?.resp_result?.result?.products?.product?.[0];

        if (product) {
            res.status(200).json({
                status: "success",
                price: product.target_sale_price || product.sale_price,
                currency: product.target_sale_price_currency || "USD"
            });
        } else {
            res.status(200).json({ status: "error", msg: "AliExpress API: Товар не найден" });
        }
    } catch (e) {
        res.status(200).json({ status: "error", msg: "Ошибка сервера: " + e.message });
    }
};
