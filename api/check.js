import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { id } = req.query;
    
    // Используем проверенные вами названия переменных
    const appKey = process.env.ALI_APP_KEY;
    const appSecret = process.env.ALI_SECRET_KEY;
    const trackingId = process.env.ALI_TRACKING_ID;

    if (!appKey || !appSecret) {
        return res.status(200).json({ 
            status: "error", 
            msg: "Ошибка конфигурации: ключи не найдены в Vercel" 
        });
    }

    if (!id) return res.status(200).json({ status: "error", msg: "ID товара не получен" });

    try {
        const params = {
            method: 'aliexpress.affiliate.product.detail.get',
            app_key: appKey.trim(),
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 19),
            format: 'json',
            v: '2.0',
            sign_method: 'md5',
            product_ids: id,
            tracking_id: trackingId ? trackingId.trim() : 'default'
        };

        // Генерация подписи API
        const sortedKeys = Object.keys(params).sort();
        let str = appSecret.trim();
        for (const key of sortedKeys) str += key + params[key];
        str += appSecret.trim();
        const sign = crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
        params.sign = sign;

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`https://eco.aliexpress.com/routerrest?${query}`);
        const result = await response.json();

        // Обработка ответа от AliExpress
        const responseData = result.aliexpress_affiliate_product_detail_get_response;
        const product = responseData?.resp_result?.result?.products?.product?.[0];

        if (product) {
            res.status(200).json({
                status: "success",
                price: product.target_sale_price || product.sale_price,
                currency: product.target_sale_price_currency || "ILS",
                rating: product.evaluate_rate || "5.0",
                shop: product.shop_info?.shop_name || "Ali Store"
            });
        } else {
            const errorMsg = result.error_response?.sub_msg || "Товар не найден в базе API";
            res.status(200).json({ status: "error", msg: errorMsg });
        }
    } catch (e) {
        res.status(200).json({ status: "error", msg: "Ошибка сервера: " + e.message });
    }
}
