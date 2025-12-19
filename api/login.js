// api/login.js - ПРОСТОЙ РАБОЧИЙ
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
    
    const { lastName } = JSON.parse(body);
    
    // Простая логика: Плехов = 4477, остальные = случайный ID
    let studentId;
    if (lastName.toLowerCase().includes('плехов')) {
      studentId = 4477;
    } else {
      studentId = 4000 + Math.floor(Math.random() * 500);
    }
    
    // Возвращаем ответ
    res.status(200).json({
      success: true,
      studentId: studentId,
      classId: 1000,
      lastName: lastName
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
