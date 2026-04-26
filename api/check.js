import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { id } = req.query;
    
    // ПРОВЕРКА КЛЮЧЕЙ
    const appKey = process.env.ALI_API_KEY;
    const appSecret = process.env.ALI_API_SECRET;

    if (!appKey || !appSecret) {
        return res.status(200).json({ status: "error", msg: "Ключи API не настроены в Vercel" });
    }

    try {
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

        // Генерация SIGN
        const sortedKeys = Object.keys(params).sort();
        let str = appSecret;
        for (const key of sortedKeys) str += key + params[key];
        str += appSecret;
        const sign = crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
        params.sign = sign;

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`https://eco.aliexpress.com/routerrest?${query}`);
        const data = await response.json();

        // Проверка ответа от AliExpress
        const result = data.aliexpress_affiliate_product_detail_get_response?.resp_result?.result?.products?.product?.[0];

        if (result) {
            res.status(200).json({
                status: "success",
                price: result.target_sale_price || result.sale_price,
                currency: result.target_sale_price_currency || "ILS",
                rating: result.evaluate_rate || "5.0"
            });
        } else {
            res.status(200).json({ status: "error", msg: "API не нашло товар" });
        }
    } catch (e) {
        res.status(200).json({ status: "error", msg: e.message });
    }
}
