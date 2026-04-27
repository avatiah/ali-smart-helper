import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;
    // Используем ваши подтвержденные названия переменных из Vercel
    const appKey = process.env.ALI_APP_KEY;
    const appSecret = process.env.ALI_SECRET_KEY;
    const trackingId = process.env.ALI_TRACKING_ID || 'default';

    if (!id) return res.status(200).json({ status: "error", msg: "ID не получен" });
    if (!appKey || !appSecret) return res.status(200).json({ status: "error", msg: "Ключи не настроены" });

    try {
        const params = {
            method: 'aliexpress.affiliate.product.detail.get',
            app_key: appKey.trim(),
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 19),
            format: 'json',
            v: '2.0',
            sign_method: 'md5',
            product_ids: id,
            tracking_id: trackingId.trim()
        };

        const sortedKeys = Object.keys(params).sort();
        let str = appSecret.trim();
        for (const key of sortedKeys) str += key + params[key];
        str += appSecret.trim();
        
        const sign = crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
        params.sign = sign;

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`https://eco.aliexpress.com/routerrest?${query}`);
        const result = await response.json();

        const product = result.aliexpress_affiliate_product_detail_get_response?.resp_result?.result?.products?.product?.[0];

        if (product) {
            res.status(200).json({
                status: "success",
                price: product.target_sale_price || product.sale_price,
                currency: product.target_sale_price_currency || "ILS"
            });
        } else {
            const aliError = result.error_response?.sub_msg || "Товар не в партнерке (404)";
            res.status(200).json({ status: "error", msg: aliError });
        }
    } catch (e) {
        res.status(200).json({ status: "error", msg: e.message });
    }
}
