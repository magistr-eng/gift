const gift = document.getElementById('main-gift');
const message = document.getElementById('message');

gift.addEventListener('click', function() {
    // 1. Меняем подарок на сияющее сердце
    this.innerHTML = '💖';
    this.style.transform = 'scale(1.5)';
    
    // 2. Показываем скрытое сообщение
    message.classList.remove('hidden');
    
    // 3. Создаем эффект конфетти из сердечек
    for (let i = 0; i < 40; i++) {
        createHeart();
    }
    
    // Отключаем клик после первого раза, чтобы не спамить
    gift.style.pointerEvents = 'none';
});

function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart-particle');
    heart.innerHTML = '❤️';
    
    // Случайное направление вылета (в радиусе 300-400px)
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 300 + 100;
    const dx = Math.cos(angle) * velocity + 'px';
    const dy = Math.sin(angle) * velocity + 'px';
    
    heart.style.setProperty('--dx', dx);
    heart.style.setProperty('--dy', dy);
    
    // Случайный размер и позиция старта
    heart.style.left = '50%';
    heart.style.top = '50%';
    heart.style.fontSize = (Math.random() * 20 + 10) + 'px';

    document.body.appendChild(heart);

    // Очистка памяти после завершения анимации
    setTimeout(() => {
        heart.remove();
    }, 2000);
}