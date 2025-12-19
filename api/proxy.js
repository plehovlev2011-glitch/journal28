import axios from 'axios';

export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { action, ...params } = req.body;
    
    console.log('Прокси запрос:', action, params);
    
    // Делаем запрос к АИАС
    const response = await axios.post(
      'https://journal.school28-kirov.ru/act/',
      new URLSearchParams({
        action,
        ...params
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 10000
      }
    );
    
    // Отправляем ответ клиенту
    res.status(200).json(response.data);
    
  } catch (error) {
    console.error('Прокси ошибка:', error.message);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      message: error.message 
    });
  }
}
