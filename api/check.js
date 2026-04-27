import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { id } = req.query;
    
    // Прямое обращение к переменным
    const appKey = process.env.ALI_API_KEY || process.env.NEXT_PUBLIC_ALI_API_KEY;
    const appSecret = process.env.ALI_API_SECRET || process.env.NEXT_PUBLIC_ALI_API_SECRET;

    if (!appKey || !appSecret) {
        return res.status(200).json({ 
            status: "error", 
            msg: `Ключи не найдены в системе. Проверь Vercel Settings.` 
        });
    }

    try {
        const params = {
            method: 'aliexpress.affiliate.product.detail.get',
            app_key: appKey.trim(), // Убираем возможные пробелы
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 19),
            format: 'json',
            v: '2.0',
            sign_method: 'md5',
            product_ids: id
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

        // Проверка на ошибку самого AliExpress
        if (result.error_response) {
            return res.status(200).json({ 
                status: "error", 
                msg: `AliExpress API Error: ${result.error_response.sub_msg || result.error_response.msg}` 
            });
        }

        const product = result.aliexpress_affiliate_product_detail_get_response?.resp_result?.result?.products?.product?.[0];

        if (product) {
            res.status(200).json({
                status: "success",
                price: product.target_sale_price || product.sale_price,
                currency: product.target_sale_price_currency || "ILS",
                rating: product.evaluate_rate || "5.0",
                shop: product.shop_info?.shop_name || "Ali Store"
            });
        } else {
            res.status(200).json({ status: "error", msg: "Товар не найден в партнерке Ali" });
        }
    } catch (e) {
        res.status(200).json({ status: "error", msg: "Ошибка: " + e.message });
    }
}
