import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { id } = req.query;
    
    // Проверка ключей
    const appKey = process.env.ALI_API_KEY;
    const appSecret = process.env.ALI_API_SECRET;

    if (!appKey || !appSecret) {
        return res.status(200).json({ 
            status: "system_error", 
            msg: "Ключи API не прописаны в Vercel Settings!" 
        });
    }

    if (!id) return res.status(200).json({ status: "error", msg: "ID не получен" });

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
        const data = await response.json();

        res.status(200).json({ status: "done", data: data });
    } catch (error) {
        res.status(200).json({ status: "error", msg: error.message });
    }
}
