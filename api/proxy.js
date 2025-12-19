// api/proxy.js - ПРОСТОЙ РАБОЧИЙ
export default async function handler(req, res) {
  // Разрешаем всё
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Только POST' });
  }
  
  try {
    // Читаем запрос
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    
    const { action, ...params } = JSON.parse(body);
    
    // Формируем запрос к АИАС
    const formData = new URLSearchParams();
    formData.append('action', action);
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    }
    
    // Отправляем в АИАС
    const response = await fetch('https://journal.school28-kirov.ru/act/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      body: formData.toString()
    });
    
    const text = await response.text();
    
    // Пробуем парсить JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    // Возвращаем ответ
    res.status(200).json({
      success: true,
      data: data
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
