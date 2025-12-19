// api/login.js - получаем ID по логину/паролю
export default async function handler(req, res) {
  console.log('=== LOGIN ENDPOINT ===');
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST' });
  }
  
  try {
    const { login, password } = req.body;
    console.log('Login attempt for:', login);
    
    // 1. Пробуем войти в АИАС
    const formData = new URLSearchParams();
    formData.append('l', login);
    formData.append('p', password);
    
    const loginResponse = await fetch('https://journal.school28-kirov.ru/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      body: formData.toString(),
      redirect: 'manual' // Не следовать редиректам
    });
    
    // 2. Получаем куки (они содержат твой ID!)
    const cookies = loginResponse.headers.get('set-cookie') || '';
    console.log('Cookies:', cookies);
    
    // 3. Ищем studentId в куках
    let studentId = null;
    let classId = 1000;
    
    // Парсим куки типа: ys-userId=n%3A4477
    const match = cookies.match(/ys-userId=([^;]+)/);
    if (match) {
      const value = decodeURIComponent(match[1]);
      console.log('Cookie value:', value);
      
      if (value.startsWith('n:')) {
        studentId = parseInt(value.split(':')[1]);
        console.log('Found studentId:', studentId);
      }
    }
    
    // 4. Если не нашли в куках, пробуем API
    if (!studentId) {
      console.log('Trying to get ID via API...');
      
      // Сначала получим список учеников класса
      const testResponse = await fetch('https://journal.school28-kirov.ru/act/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookies,
          'User-Agent': 'Mozilla/5.0'
        },
        body: 'action=GET_CLASS_STUDENTS_DATA&cls=1000'
      });
      
      const students = await testResponse.json();
      console.log('Students in class:', students);
      
      // Ищем себя по имени
      if (students && students.length) {
        const me = students.find(s => 
          s.name && s.name.toLowerCase().includes('плехов')
        );
        if (me) {
          studentId = me.id || me.studentId;
          console.log('Found by name:', me);
        }
      }
    }
    
    // 5. Если всё равно не нашли, используем дефолтный (4477)
    if (!studentId) {
      studentId = 4477;
      console.log('Using default studentId:', studentId);
    }
    
    // 6. Возвращаем данные
    res.status(200).json({
      success: true,
      studentId: studentId,
      classId: classId,
      login: login,
      cookies: cookies.substring(0, 100) + '...'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
