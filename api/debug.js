export default async function handler(req, res) {
    // Разрешаем запросы из расширения
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // Список ключей, которые мы проверяем
    const keysToCheck = [
        'ALI_TRACKING_ID',
        'ALI_APP_KEY',
        'ALI_SECRET_KEY'
    ];

    let report = '<h2>Статус переменных окружения Vercel:</h2>';
    report += '<table border="1" style="border-collapse: collapse; width: 100%; font-family: monospace;">';
    report += '<tr style="background: #eee;">th style="padding: 10px;">Переменная</th><th style="padding: 10px;">Статус</th><th style="padding: 10px;">Длина значения</th></tr>';

    keysToCheck.forEach(key => {
        const value = process.env[key];
        const isSet = value && value.trim().length > 0;
        const color = isSet ? '#d4edda' : '#f8d7da';
        const statusText = isSet ? '✅ ЗАПИСАНО' : '❌ ПУСТО';
        
        report += `<tr style="background: ${color};">`;
        report += `<td style="padding: 10px;"><b>${key}</b></td>`;
        report += `<td style="padding: 10px;">${statusText}</td>`;
        report += `<td style="padding: 10px;">${isSet ? value.length + ' симв.' : '0'}</td>`;
        report += '</tr>';
    });

    report += '</table>';
    report += '<p style="margin-top: 20px;"><i>Если вы добавили ключи, но видите "ПУСТО", обязательно сделайте <b>Redeploy</b> в панели Vercel.</i></p>';

    res.status(200).send(report);
}
