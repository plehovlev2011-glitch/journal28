// api/proxy.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
export default async function handler(req, res) {
  console.log('=== PROXY CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS запрос
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS');
    return res.status(200).end();
  }
  
  // Только POST
  if (req.method !== 'POST') {
    console.log('Wrong method:', req.method);
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  
  try {
    // Получаем тело запроса
    let body;
    try {
      body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      
      console.log('Raw body:', body);
      
      if (!body) {
        return res.status(400).json({ error: 'Empty body' });
      }
      
      body = JSON.parse(body);
      console.log('Parsed body:', body);
      
    } catch (parseError) {
      console.error('Parse error:', parseError.message);
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    
    const { action, ...params } = body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action required' });
    }
    
    console.log('Action:', action);
    console.log('Params:', params);
    
    // Формируем данные для АИАС
    const formData = new URLSearchParams();
    formData.append('action', action);
    
    // ДОБАВЛЯЕМ ВСЕ ПАРАМЕТРЫ КАК СТРОКИ
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
    
    const formString = formData.toString();
    console.log('Form data for АИАС:', formString);
    
    // Запрос к АИАС
    console.log('Making request to АИАС...');
    const startTime = Date.now();
    
    const aversResponse = await fetch('https://journal.school28-kirov.ru/act/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Origin': 'https://journal.school28-kirov.ru',
        'Referer': 'https://journal.school28-kirov.ru/'
      },
      body: formString,
      // Увеличиваем таймауты
      signal: AbortSignal.timeout(30000)
    }).catch(err => {
      console.error('Fetch error:', err.message);
      throw new Error(`Network error: ${err.message}`);
    });
    
    const endTime = Date.now();
    console.log(`АИАС response in ${endTime - startTime}ms`);
    console.log('Status:', aversResponse.status);
    console.log('Status text:', aversResponse.statusText);
    
    // Получаем ответ
    const responseText = await aversResponse.text();
    console.log('Response length:', responseText.length);
    console.log('First 500 chars:', responseText.substring(0, 500));
    
    // Пробуем парсить как JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Parsed as JSON');
    } catch {
      // Если не JSON, возвращаем как есть
      responseData = responseText;
      console.log('Not JSON, returning as text');
    }
    
    // Возвращаем ответ
    res.status(aversResponse.status).json({
      success: aversResponse.ok,
      status: aversResponse.status,
      data: responseData,
      fromProxy: true
    });
    
  } catch (error) {
    console.error('PROXY FATAL ERROR:', error);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      error: 'Proxy failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
