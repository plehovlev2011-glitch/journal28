<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .login-box {
            background: white;
            padding: 30px;
            border-radius: 12px;
            width: 100%;
            max-width: 400px;
        }
        input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #4caf50;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
        }
        .error {
            color: red;
            margin-top: 10px;
            display: none;
        }
        .info {
            background: #e3f2fd;
            padding: 10px;
            border-radius: 6px;
            margin-top: 15px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Вход в дневник</h2>
        <div class="info">
            🔐 Используйте логин и пароль от старого дневника
        </div>
        <input type="text" id="login" placeholder="Логин" value="Плехов">
        <input type="password" id="password" placeholder="Пароль">
        <button onclick="login()" id="loginBtn">Войти</button>
        <div id="error" class="error"></div>
    </div>

    <script>
        async function login() {
            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');
            const btn = document.getElementById('loginBtn');
            
            errorDiv.style.display = 'none';
            
            if (!login || !password) {
                errorDiv.textContent = 'Введите логин и пароль';
                errorDiv.style.display = 'block';
                return;
            }
            
            // Показываем загрузку
            btn.innerHTML = '🔐 Вход...';
            btn.disabled = true;
            
            try {
                console.log('Отправка логина на сервер...');
                
                // 1. Получаем твой реальный ID
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ login, password })
                });
                
                const data = await response.json();
                console.log('Ответ от сервера:', data);
                
                if (!data.success) {
                    throw new Error(data.error || 'Ошибка входа');
                }
                
                // 2. Сохраняем ВАЖНЫЕ данные
                localStorage.setItem('studentId', data.studentId);
                localStorage.setItem('classId', data.classId);
                localStorage.setItem('username', login);
                localStorage.setItem('realLogin', login);
                
                console.log('Сохранено studentId:', data.studentId);
                
                // 3. Переходим в дневник
                window.location.href = 'dashboard.html';
                
            } catch (error) {
                console.error('Ошибка входа:', error);
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
                btn.innerHTML = 'Войти';
                btn.disabled = false;
            }
        }
        
        // Enter для входа
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    </script>
</body>
</html>
