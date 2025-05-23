// Для установки активной ссылки
const links = document.querySelectorAll('.nav-link');
links.forEach(link => {
    link.addEventListener('click', function() {
        links.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Перелистывание моделей авто,вручную заполнено 

const models = [
    {
        name: "Porsche Macan",
        description: "2.0L Turbo, 265 л.с., автомат, кроссовер",
        price: "Цена: 4511100 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\macan.png"
    },
    {
        name: "Ford Mustang",
        description: "5.0L V8, 450 л.с., автомат, купе",
        price: "Цена: 3526860 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\mustang.png"
    },
    {
        name: "Audi A4",
        description: "2.0L, 248 л.с., автомат, седан",
        price: "Цена: 3198780 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\audia.png"
    },
    {
        name: "Volkswagen Jetta",
        description: "1.4L, 147 л.с., автомат, седан",
        price: "Цена: 1804440 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\jetta.png"
    },
    {
        name: "Mazda CX-5",
        description: "2.5L, 194 л.с., автомат, кроссовер",
        price: "Цена: 3600000 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\mazdacx.png"
    },
    // 5 моделей
    {
        name: "Kia Stinger",
        description: "2.0L Turbo, 255 л.с., 8-ступенчатый автомат, седан",
        price: "Цена: 3200000 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\stinger.png"
    },
    {
        name: "Land Rover Range Rover",
        description: "3.0L V6, 400 л.с., 8-ступенчатый автомат, внедорожник",
        price: "Цена: 7900000 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\rover.png"
    },
    {
        name: "Zeekr 001",
        description: "1.0L электромотор, 400 л.с., автомат, электромобиль",
        price: "Цена: 5500000 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\zeekr.png"
    },
    {
        name: "Volvo XC60",
        description: "2.0L Turbo, 250 л.с., автомат, внедорожник",
        price: "Цена: 6500000 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\volvo.png"
    },
    {
        name: "Chevrolet Tahoe",
        description: "5.3L V8, 355 л.с., автомат, внедорожник",
        price: "Цена: 7800000 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\tahoe.png"
    },
    {
        name: "Mitsubishi Colt",
        description: "1.5L I4, 105 л.с., механика, хэтчбек",
        price: "Цена: 3500000 руб.",
        image: "c:\Users\grits\Desktop\подольный курсовой\carcenter\public\images\colt.png"
    }
];
// 11 моделей

let currentIndex = 0;

const carImage = document.getElementById('car-image');
const modelName = document.getElementById('model-name');
const modelDescription = document.getElementById('model-description');
const modelPrice = document.getElementById('model-price');

function updateModel() {
    const model = models[currentIndex];
    carImage.src = model.image;
    modelName.textContent = model.name;
    modelDescription.textContent = model.description;
    modelPrice.textContent = model.price;
}

document.querySelector('.left-arrow').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + models.length) % models.length; // Циклический переход влево
    updateModel();
});

document.querySelector('.right-arrow').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % models.length; // Циклический переход вправо
    updateModel();
});

// Инициализация первой модели
updateModel();

document.getElementById('testDriveForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: this.name.value,
        model: this.model.value,
        email: this.email.value
    };

    try {
        const response = await fetch('http://localhost:3000/api/test-drive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Ошибка сети');
        
        const data = await response.json();
        alert(data.message);
        this.reset();
    } catch (error) {
        console.error('Error:', error);
        alert('Произошла ошибка при отправке формы');
    }
});

document.getElementById('serviceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        model: document.getElementById('model').value,
        date: document.getElementById('date').value,
        email: document.getElementById('email').value
    };

    // Здесь можно добавить отправку данных на сервер, сервер накину позже
    console.log('Форма отправлена:', formData);
    alert('Ваша заявка принята! Мы свяжемся с вами в ближайшее время.');
    this.reset();
});
