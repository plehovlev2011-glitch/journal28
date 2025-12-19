// api/proxy.js - РАБОЧИЙ С КУКАМИ
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Только POST' });
  
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    
    const { action, ...params } = JSON.parse(body);
    
    console.log('📡 Запрос к АИАС:', action);
    
    // ВАЖНО: получаем куки из запроса
    const cookies = params._cookies || '';
    delete params._cookies; // убираем из параметров запроса
    
    // Формируем запрос
    const formData = new URLSearchParams();
    formData.append('action', action);
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    }
    
    console.log('Отправляем в АИАС с куками:', cookies ? 'Есть' : 'Нет');
    
    // Отправляем с куками
    const response = await fetch('https://journal.school28-kirov.ru/act/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Cookie': cookies // ВАЖНО: отправляем куки!
      },
      body: formData.toString()
    });
    
    const text = await response.text();
    console.log('Ответ АИАС длина:', text.length);
    
    // Пробуем парсить
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    // Возвращаем
    res.status(200).json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Ошибка прокси:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
