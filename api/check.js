import crypto from 'crypto';

export default async function handler(req, res) {
    // Устанавливаем заголовки до любой логики
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;

    // ТЕСТ: Если зайти по ссылке без ID, должен быть этот ответ
    if (!id) {
        return res.status(200).json({ 
            status: "ready", 
            version: "1.0.7",
            message: "API на связи. Жду productId." 
        });
    }

    const { ALI_APP_KEY, ALI_SECRET_KEY } = process.env;

    try {
        const params = {
            method: 'aliexpress.affiliate.product.detail.get',
            app_key: ALI_APP_KEY.trim(),
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 19),
            format: 'json',
            v: '2.0',
            sign_method: 'md5',
            product_ids: id
        };

        const sortedKeys = Object.keys(params).sort();
        let str = ALI_SECRET_KEY.trim();
        for (const key of sortedKeys) str += key + params[key];
        str += ALI_SECRET_KEY.trim();
        
        const sign = crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
        params.sign = sign;

        const response = await fetch(`https://eco.aliexpress.com/routerrest?${new URLSearchParams(params)}`);
        const result = await response.json();
        
        const product = result.aliexpress_affiliate_product_detail_get_response?.resp_result?.result?.products?.product?.[0];

        if (product) {
            return res.status(200).json({
                status: "success",
                price: product.target_sale_price || product.sale_price,
                currency: product.target_sale_price_currency || "USD"
            });
        }
        return res.status(200).json({ status: "error", msg: "API AliExpress не вернуло товар" });
    } catch (e) {
        return res.status(200).json({ status: "error", msg: "Server Internal Error" });
    }
}
