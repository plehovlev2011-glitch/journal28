// api/login.js - ПОЛНЫЙ КОД
export default async function handler(req, res) {
  console.log('=== LOGIN.JS ЗАПУЩЕН ===');
  
  // Разрешаем всё для CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Обрабатываем OPTIONS запрос
  if (req.method === 'OPTIONS') {
    console.log('LOGIN: OPTIONS запрос');
    return res.status(200).end();
  }
  
  // Проверяем метод
  if (req.method !== 'POST') {
    console.log('LOGIN: Неверный метод', req.method);
    return res.status(405).json({ 
      success: false, 
      error: 'Только POST запросы' 
    });
  }
  
  try {
    console.log('LOGIN: Начинаем обработку...');
    
    // Получаем тело запроса
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    
    console.log('LOGIN: Получено тело:', body);
    
    if (!body) {
      return res.status(400).json({
        success: false,
        error: 'Пустое тело запроса'
      });
    }
    
    // Парсим JSON
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      console.log('LOGIN: Ошибка парсинга JSON:', parseError.message);
      return res.status(400).json({
        success: false,
        error: 'Неверный формат JSON'
      });
    }
    
    const { lastName, password } = parsedBody;
    
    console.log('LOGIN: Ищем ID для фамилии:', lastName);
    
    // ==================== ОСНОВНАЯ ЛОГИКА ====================
    
    // ВАЖНО: В реальной системе здесь нужно:
    // 1. Авторизоваться в АИАС с фамилией и паролем
    // 2. Из кук или ответа получить studentId
    // 3. Вернуть его
    
    // Но так как мы не знаем, как АИАС возвращает ID по фамилии,
    // делаем демо-версию
    
    // ДЕМО-РЕЖИМ: Список известных учеников
    const studentsDemo = [
      { lastName: 'плехов', studentId: 4477, classId: 1000 },
      { lastName: 'иванов', studentId: 4478, classId: 1000 },
      { lastName: 'петров', studentId: 4479, classId: 1000 },
      { lastName: 'сидоров', studentId: 4480, classId: 1000 },
      { lastName: 'смирнов', studentId: 4481, classId: 1000 },
      { lastName: 'кузнецов', studentId: 4482, classId: 1000 },
      { lastName: 'попов', studentId: 4483, classId: 1000 },
      { lastName: 'васильев', studentId: 4484, classId: 1000 },
      { lastName: 'павлов', studentId: 4485, classId: 1000 },
      { lastName: 'семенов', studentId: 4486, classId: 1000 }
    ];
    
    // Ищем фамилию в списке (без учета регистра)
    const searchName = (lastName || '').toLowerCase().trim();
    const foundStudent = studentsDemo.find(s => 
      s.lastName === searchName || 
      searchName.includes(s.lastName) ||
      s.lastName.includes(searchName)
    );
    
    if (foundStudent) {
      console.log('LOGIN: Найден в демо-базе:', foundStudent);
      
      // Успешный ответ
      return res.status(200).json({
        success: true,
        studentId: foundStudent.studentId,
        classId: foundStudent.classId,
        lastName: lastName,
        message: 'ID найден (демо-режим)',
        isDemo: true
      });
    }
    
    // Если не нашли в демо-базе
    console.log('LOGIN: Фамилия не найдена в демо-базе:', lastName);
    
    // Пробуем "угадать" ID (для тестирования)
    // В реальной системе этого быть не должно!
    const guessedId = 4470 + Math.floor(Math.random() * 50);
    
    return res.status(200).json({
      success: true,
      studentId: guessedId,
      classId: 1000,
      lastName: lastName,
      message: 'ID сгенерирован (тестовый режим). В реальной системе здесь будет поиск в АИАС.',
      isDemo: true,
      warning: 'Это тестовый ID! Реальная система должна искать ID в АИАС.'
    });
    
  } catch (error) {
    console.error('LOGIN: КРИТИЧЕСКАЯ ОШИБКА:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// ==================== КОММЕНТАРИЙ ДЛЯ РЕАЛЬНОЙ СИСТЕМЫ ====================
/*
Для реальной системы нужно заменить демо-код на:

1. Авторизация в АИАС:
   const authResponse = await fetch('https://journal.school28-kirov.ru/auth', {
     method: 'POST',
     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
     body: new URLSearchParams({ l: lastName, p: password })
   });

2. Получение кук:
   const cookies = authResponse.headers.get('set-cookie');

3. Поиск studentId в куках:
   const match = cookies.match(/ys-userId=([^;]+)/);
   if (match) {
     const value = decodeURIComponent(match[1]);
     if (value.startsWith('n:')) {
       studentId = parseInt(value.split(':')[1]);
     }
   }

4. Если не нашли в куках, ищем через API АИАС.
*/
