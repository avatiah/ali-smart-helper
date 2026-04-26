import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { id } = req.query;
    const appKey = process.env.ALI_API_KEY;
    const appSecret = process.env.ALI_API_SECRET;

    if (!id) return res.status(400).json({ error: "No ID" });
    if (!appKey || !appSecret) return res.status(400).json({ error: "Ключи API не найдены в Vercel" });

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

        const sortedKeys = Object.keys(params).sort();
        let str = appSecret;
        for (const key of sortedKeys) str += key + params[key];
        str += appSecret;
        const sign = crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
        params.sign = sign;

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`https://eco.aliexpress.com/routerrest?${query}`);
        const data = await response.json();

        // Если сам Али вернул ошибку (например, неверный ID или ключ)
        if (data.error_response) {
            return res.status(200).json({ 
                status: "api_error", 
                msg: data.error_response.msg 
            });
        }

        res.status(200).json({ status: "success", details: data });
    } catch (error) {
        res.status(500).json({ error: "Server Error", msg: error.message });
    }
}
