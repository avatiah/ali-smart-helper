import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { id } = req.query;
    const appKey = process.env.ALI_API_KEY;
    const appSecret = process.env.ALI_API_SECRET;

    if (!id || !appKey || !appSecret) return res.status(200).json({ status: "error", msg: "Missing setup" });

    try {
        const params = {
            method: 'aliexpress.affiliate.product.detail.get',
            app_key: appKey,
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            format: 'json',
            v: '2.0',
            sign_method: 'md5',
            product_ids: id
        };

        const sortedKeys = Object.keys(params).sort();
        let str = appSecret;
        for (const key of sortedKeys) str += key + params[key];
        str += appSecret;
        const sign = crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
        params.sign = sign;

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`https://eco.aliexpress.com/routerrest?${query}`);
        const result = await response.json();

        // Извлекаем самое важное из горы данных API
        const product = result.aliexpress_affiliate_product_detail_get_response?.resp_result?.result?.products?.product[0];

        if (!product) {
            return res.status(200).json({ status: "empty", msg: "Товар не найден в Affiliate API" });
        }

        res.status(200).json({
            status: "success",
            price: product.target_sale_price || product.sale_price,
            currency: product.target_sale_price_currency || "USD",
            rating: product.evaluate_rate || "4.8",
            shop: product.shop_info?.shop_name || "Магазин Ali",
            commission: product.commission_rate ? `${product.commission_rate}%` : "---"
        });
    } catch (error) {
        res.status(200).json({ status: "error", msg: error.message });
    }
}
