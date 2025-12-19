// api/proxy.js - УПРОЩЕННАЯ РАБОЧАЯ ВЕРСИЯ
export default async function handler(req, res) {
  // 1. CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 2. OPTIONS запрос
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 3. Только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { action, ...params } = req.body;
    console.log('Proxy received:', action, params);
    
    // 4. ВАЖНО: преобразуем объект в строку правильно
    const formData = new URLSearchParams();
    formData.append('action', action);
    
    // Добавляем остальные параметры
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
    
    console.log('Sending to AИАС:', formData.toString());
    
    // 5. Делаем запрос к АИАС
    const response = await fetch('https://journal.school28-kirov.ru/act/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      body: formData.toString()
    });
    
    if (!response.ok) {
      throw new Error(`АИАС ответил с ошибкой: ${response.status}`);
    }
    
    // 6. Парсим ответ (скорее всего JSON или XML)
    const text = await response.text();
    console.log('Raw response length:', text.length);
    
    // Пробуем парсить как JSON, если не получится - возвращаем как есть
    try {
      const json = JSON.parse(text);
      res.status(200).json(json);
    } catch {
      // Если не JSON, возвращаем текст
      res.status(200).send(text);
    }
    
  } catch (error) {
    console.error('Proxy error details:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Proxy internal error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
