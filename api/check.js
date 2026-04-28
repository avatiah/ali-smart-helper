import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const { id } = req.query;
    const { ALI_APP_KEY, ALI_SECRET_KEY, ALI_TRACKING_ID } = process.env;

    if (!id) return res.json({ status: "error", msg: "ID не получен" });
    if (!ALI_APP_KEY || !ALI_SECRET_KEY) return res.json({ status: "error", msg: "Ключи Vercel не найдены" });

    try {
        const params = {
            method: 'aliexpress.affiliate.product.detail.get',
            app_key: ALI_APP_KEY.trim(),
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 19),
            format: 'json',
            v: '2.0',
            sign_method: 'md5',
            product_ids: id,
            tracking_id: ALI_TRACKING_ID || 'default'
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
            res.json({ status: "success", price: product.target_sale_price || product.sale_price, currency: product.target_sale_price_currency || "USD" });
        } else {
            res.json({ status: "error", msg: "API: Товар не найден" });
        }
    } catch (e) {
        res.json({ status: "error", msg: "Ошибка сервера" });
    }
}
