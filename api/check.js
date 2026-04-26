// api/check.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { id } = req.query;
    const API_KEY = process.env.ALI_API_KEY;
    const API_SECRET = process.env.ALI_API_SECRET;

    if (!id) return res.status(400).json({ error: 'No ID provided' });

    try {
        /* ЗДЕСЬ БУДЕТ ЛОГИКА ВАШЕГО API.
           Ниже — пример того, как мы отдадим данные в расширение,
           когда вы вставите метод вызова.
        */

        // Имитируем запрос к Ali за реальными данными
        // В реальном API тут будет fetch к серверу AliExpress
        const realData = {
            productId: id,
            rating: "4.9 (из API)", // Эти данные подставятся в попап
            coupons: "Доступен купон на $2",
            history: "Минимальная цена за 30 дней: 18.50 ILS"
        };

        res.status(200).json(realData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
