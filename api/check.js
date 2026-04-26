
// api/check.js
export default async function handler(req, res) {
    // Настройка заголовков, чтобы расширение могло получить ответ
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { id } = req.query;

    // Пока просто имитируем ответ от AliExpress API
    const mockData = {
        productId: id,
        status: "success",
        message: "API bridge is working",
        timestamp: new Date().toISOString()
    };

    return res.status(200).json(mockData);
}
