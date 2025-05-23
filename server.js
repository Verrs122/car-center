const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const fs = require('fs');

// Инициализация приложения
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Подключение к БД
const dbPath = path.join(__dirname, 'data', 'car_center.db');

// Проверка существования файла БД
if (!fs.existsSync(dbPath)) {
  console.error('Файл базы данных не найден!');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
    process.exit(1);
  }
  console.log('Успешное подключение к базе данных');
  initializeDatabase();
});

// Инициализация БД (создание таблиц если их нет)
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      year INTEGER,
      price REAL,
      fuel_type TEXT,
      characteristics TEXT,  // Добавлено
      image_path TEXT,      // Добавлено
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Ошибка при создании таблицы:', err.message);
    else {
      // Добавляем тестовые данные, если таблица пуста
      db.get("SELECT COUNT(*) as count FROM models", (err, row) => {
        if (row.count === 0) {
          db.run(`
            INSERT INTO models (name, manufacturer, year, price, fuel_type, characteristics, image_path)
            VALUES 
              ('Camry', 'Toyota', 2022, 2500000, 'Бензин', 'Комфортный седан для семьи', 'camry.jpg'),
              ('Corolla', 'Toyota', 2023, 1800000, 'Гибрид', 'Экономичный городской автомобиль', 'corolla.jpg')
          `);
        }
      });
    }
  });
}

// Маршруты API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Получить все модели
app.get('/models', (req, res) => {
  db.all('SELECT * FROM models', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Ошибка при получении данных' });
    }
    res.json(rows);
  });
});

// Получить конкретную модель
app.get('/api/models/:id', (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM models WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Ошибка при получении данных' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Модель не найдена' });
    }
    res.json(row);
  });
});

// Создать новую модель
app.post('/api/models', (req, res) => {
  const { name, manufacturer, year, price, fuel_type } = req.body;
  
  if (!name || !manufacturer) {
    return res.status(400).json({ error: 'Поля name и manufacturer обязательны' });
  }

  db.run(
    'INSERT INTO models (name, manufacturer, year, price, fuel_type) VALUES (?, ?, ?, ?, ?)',
    [name, manufacturer, year, price, fuel_type],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Ошибка при создании модели' });
      }
      res.status(201).json({ 
        id: this.lastID,
        message: 'Модель успешно создана' 
      });
    }
  );
});
// Обновить модель
app.put('/api/models/:id', (req, res) => {
  const id = req.params.id;
  const { name, manufacturer, year, price, fuel_type } = req.body;
  
  db.run(
    `UPDATE models SET 
      name = COALESCE(?, name),
      manufacturer = COALESCE(?, manufacturer),
      year = COALESCE(?, year),
      price = COALESCE(?, price),
      fuel_type = COALESCE(?, fuel_type)
    WHERE id = ?`,
    [name, manufacturer, year, price, fuel_type, id],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Ошибка при обновлении модели' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Модель не найдена' });
      }
      res.json({ message: 'Модель успешно обновлена' });
    }
  );
});

// Удалить модель
app.delete('/api/models/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM models WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Ошибка при удалении модели' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Модель не найдена' });
    }
    res.json({ message: 'Модель успешно удалена' });
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).send('Страница не найдена');
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Корректное завершение работы
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Ошибка при закрытии БД:', err.message);
    } else {
      console.log('БД успешно отключена');
    }
    server.close(() => {
      console.log('Сервер остановлен');
      process.exit(0);
    });
  });
});