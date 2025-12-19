// api/proxy.js - МАКСИМАЛЬНО ПРОСТОЙ
export default async function handler(req, res) {
  console.log('📡 ПРОКСИ: Получен запрос');
  
  // Разрешаем всё
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    console.log('📡 OPTIONS запрос');
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    console.log('📡 Не POST метод:', req.method);
    return res.status(405).json({ error: 'Только POST' });
  }
  
  try {
    // Получаем тело запроса
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    
    console.log('📡 Тело запроса:', body);
    
    if (!body) {
      return res.status(400).json({ error: 'Пустой запрос' });
    }
    
    const { action, ...params } = JSON.parse(body);
    
    console.log('📡 Действие:', action);
    console.log('📡 Параметры:', params);
    
    // Формируем запрос к АИАС
    const formData = new URLSearchParams();
    formData.append('action', action);
    
    // Все параметры как строки
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
    
    console.log('📡 Отправляем в АИАС:', formData.toString());
    
    // Запрос к АИАС
    const aversResponse = await fetch('https://journal.school28-kirov.ru/act/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*'
      },
      body: formData.toString()
    });
    
    console.log('📡 Ответ АИАС статус:', aversResponse.status);
    
    const responseText = await aversResponse.text();
    console.log('📡 Ответ АИАС длина:', responseText.length);
    
    // Пробуем парсить JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('📡 Ответ JSON успешно распарсен');
    } catch {
      responseData = responseText;
      console.log('📡 Ответ не JSON, возвращаем как текст');
    }
    
    // Возвращаем ответ
    res.status(200).json({
      success: true,
      data: responseData,
      action: action
    });
    
  } catch (error) {
    console.error('📡 ОШИБКА ПРОКСИ:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
