// api/getStudentId.js - НАХОДИМ ID ПО ФАМИЛИИ
export default async function handler(req, res) {
  console.log('=== ПОИСК ID ПО ФАМИЛИИ ===');
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });
  
  try {
    const { login, password, lastName } = req.body;
    console.log('Поиск ID для:', { login, lastName });
    
    // 1. Пробуем авторизоваться в АИАС
    const authForm = new URLSearchParams();
    authForm.append('l', login || lastName);
    authForm.append('p', password);
    
    const authResponse = await fetch('https://journal.school28-kirov.ru/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      body: authForm.toString()
    });
    
    // 2. Получаем куки
    const cookies = authResponse.headers.get('set-cookie') || '';
    
    // 3. Ищем ID в куках
    let studentId = null;
    
    // Парсим куку вида: ys-userId=n%3A4477
    const userIdMatch = cookies.match(/ys-userId=([^;]+)/);
    if (userIdMatch) {
      const value = decodeURIComponent(userIdMatch[1]);
      console.log('Найдена кука ys-userId:', value);
      
      if (value.startsWith('n:')) {
        studentId = parseInt(value.split(':')[1]);
        console.log('Найден ID в куках:', studentId);
      }
    }
    
    // 4. Если не нашли в куках, ищем через API
    if (!studentId) {
      console.log('Ищем ID через API...');
      
      // Пробуем получить список всех учеников
      const studentsResponse = await fetch('https://journal.school28-kirov.ru/act/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookies,
          'User-Agent': 'Mozilla/5.0'
        },
        body: 'action=GET_CLASS_STUDENTS_DATA&cls=1000'
      });
      
      const studentsData = await studentsResponse.text();
      console.log('Ответ API (первые 500 символов):', studentsData.substring(0, 500));
      
      // Пробуем парсить как JSON
      try {
        const students = JSON.parse(studentsData);
        if (students && Array.isArray(students)) {
          // Ищем ученика по фамилии (нечеткий поиск)
          const searchName = (lastName || login || '').toLowerCase();
          const foundStudent = students.find(s => {
            const studentName = (s.name || s.fio || '').toLowerCase();
            return studentName.includes(searchName) || searchName.includes(studentName);
          });
          
          if (foundStudent) {
            studentId = foundStudent.id || foundStudent.studentId;
            console.log('Найден по фамилии:', foundStudent);
          }
        }
      } catch (e) {
        console.log('Не JSON, возможно XML или HTML');
      }
    }
    
    // 5. Возвращаем результат
    if (studentId) {
      res.status(200).json({
        success: true,
        studentId: studentId,
        classId: 1000, // Пока используем твой класс
        message: 'ID найден'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Не удалось найти ID ученика',
        suggestion: 'Попробуйте полную фамилию или обратитесь к администратору'
      });
    }
    
  } catch (error) {
    console.error('Ошибка поиска ID:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера: ' + error.message
    });
  }
}
