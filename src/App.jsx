import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';

export default function App() {
  const [level, setLevel] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioRef = useRef(null);

  // Инициализация аудио (один раз)
  useEffect(() => {
    // ВАЖНО: положи свой файл в папку public с таким именем
    audioRef.current = new Audio('/background-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0; // Изначально громкость 0
  }, []);

  // Управление громкостью в зависимости от уровня
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const fadeVolume = (targetVolume, duration = 2000) => {
      const steps = 20;
      const stepTime = duration / steps;
      const volumeStep = (targetVolume - audio.volume) / steps;

      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        let newVolume = audio.volume + volumeStep;
        
        // Защита от выхода за пределы [0, 1]
        if (newVolume > 1) newVolume = 1;
        if (newVolume < 0) newVolume = 0;
        
        audio.volume = newVolume;

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.volume = targetVolume; // Точно устанавливаем финальное значение
        }
      }, stepTime);
    };

    if (level === 1) {
      // Пользователь нажал "Принять" - начинаем тихо играть
      audio.play().catch(e => console.log("Audio play blocked:", e));
      fadeVolume(0.2, 3000); // Плавно до 20% за 3 секунды
    } else if (level === 2) {
      // Фонарик зажегся, играем чуть громче
      fadeVolume(0.4, 2000); // 40% громкости
    } else if (level === 5) {
      // ФИНАЛ - Кульминация!
      fadeVolume(1.0, 4000); // 100% громкости, нарастает за 4 секунды
    } else if (level === 0 && audio.volume > 0) {
      // Если нажали "Начать сначала"
      fadeVolume(0, 2000);
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 2000);
    }
  }, [level]);


  // Плавный переход без вспышки (затемнение)
  const handleTransition = (nextLvl) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLevel(nextLvl);
    }, 500);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const startJourney = () => handleTransition(1);
  const nextLevel = () => handleTransition(level + 1);
  const restartJourney = () => handleTransition(0);

  return (
    <div className="app-container">
      {isTransitioning && <div className="fade-transition-overlay"></div>}

      <div className="stars"></div>

      {level === 0 && <StartScreen onStart={startJourney} />}
      {level === 1 && <LanternLevel onNext={nextLevel} />}
      {level === 2 && <WordleLevel onNext={nextLevel} />}
      {level === 3 && <PinataLevel onNext={nextLevel} />}
      {level === 4 && <ScrollLevel onNext={nextLevel} />}
      {level === 5 && <FinalLevel onRestart={restartJourney} />}
    </div>
  );
}

// --- УРОВЕНЬ 0: Главный экран ---
function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      <h1>Сюрприз на день рождения</h1>
      <button onClick={onStart}>Принять</button>
    </div>
  );
}

// --- УРОВЕНЬ 1: Фонарик ---
function LanternLevel({ onNext }) {
  const [isLit, setIsLit] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    if (isLit) {
      const timer = setTimeout(() => setShowNextButton(true), 8000); 
      return () => clearTimeout(timer);
    }
  }, [isLit]);

  return (
    <div className="level-container">
      {!isLit && <p className="hint-text">Нажми на фонарик, чтобы зажечь его</p>}
      <div className={`background-text-container ${isLit ? 'show' : ''}`}>
        <div className="message-line line-1">С днём рождения!</div>
        <div className="message-line line-2">Пусть твоя жизнь будет наполнена</div>
        <div className="message-line line-3">светом, любовью и счастливыми мгновениями.</div>
        <div className="message-line line-4">Пусть каждый день приносит</div>
        <div className="message-line line-5">новые мечты и вдохновение.</div>
      </div>
      <div className={`lantern-wrapper ${isLit ? 'fly' : ''}`} onClick={() => !isLit && setIsLit(true)}>
        <div className="lantern"></div>
        <div className="flame"></div>
      </div>
      {showNextButton && (
        <div className="next-btn-container">
          <button onClick={onNext}>Идем дальше</button>
        </div>
      )}
    </div>
  );
}

// --- УРОВЕНЬ 2: Wordle ---
function WordleLevel({ onNext }) {
  const SECRET_WORD = "РЫБКА"; 
  const [guesses, setGuesses] = useState([]); 
  const [currentGuess, setCurrentGuess] = useState(""); 
  const [isWon, setIsWon] = useState(false);
  const [celebrationStars, setCelebrationStars] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^а-яА-ЯёЁ]/g, '').toUpperCase();
    if (value.length <= 5) setCurrentGuess(value);
  };

  const handleCheck = () => {
    if (currentGuess.length !== 5) return;
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (currentGuess === SECRET_WORD) {
      setTimeout(() => {
        setIsWon(true);
        const stars = Array.from({ length: 100 }).map((_, i) => ({
          id: i,
          angle: Math.random() * Math.PI * 2,
          size: `${2 + Math.random() * 4}px`,
          delay: `${Math.random() * 0.5}s`,
        }));
        setCelebrationStars(stars);
      }, 1500); 
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentGuess.length === 5) handleCheck();
  };

  const getLetterStatus = (guessWord, index) => {
    const letter = guessWord[index];
    if (letter === SECRET_WORD[index]) return 'correct';
    if (SECRET_WORD.includes(letter)) return 'present';
    return 'absent';
  };

  const emptyRows = Array.from({ length: Math.max(0, 6 - guesses.length - (isWon ? 0 : 1)) });

  return (
    <div className="wordle-container">
      {!isWon && (
        <>
          <h2 style={{ marginBottom: '20px', fontSize: '2rem' }}>Кто ты рыбка?</h2>
          <div className="wordle-grid">
            {guesses.map((guess, rowIndex) => (
              <div key={rowIndex} className="wordle-row">
                {guess.split('').map((letter, i) => (
                  <div key={i} className={`wordle-cell flip-${getLetterStatus(guess, i)}`} data-pos={i}>{letter}</div>
                ))}
              </div>
            ))}
            {guesses.length < 6 && (
              <div className="wordle-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="wordle-cell">{currentGuess[i] || ""}</div>
                ))}
              </div>
            )}
            {emptyRows.map((_, rowIndex) => (
              <div key={`empty-${rowIndex}`} className="wordle-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="wordle-cell"></div>
                ))}
              </div>
            ))}
          </div>
          <input className="wordle-input" type="text" value={currentGuess} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="ВВЕДИ СЛОВО" maxLength={5} autoFocus />
          <button onClick={handleCheck} disabled={currentGuess.length !== 5}>Проверить</button>
        </>
      )}

      {isWon && (
        <div className="success-message-full">
          <div className="full-screen-celebration">
            {celebrationStars.map(star => {
              const tx = `${Math.cos(star.angle) * 150}vh`;
              const ty = `${Math.sin(star.angle) * 150}vh`;
              return (
                <div key={star.id} className="full-screen-star" style={{ width: star.size, height: star.size, '--translateX': tx, '--translateY': ty, animationDelay: star.delay }} />
              );
            })}
          </div>
          <h2>Хех,ты крыска)), Угодала рыбка! Идем дальше</h2>
          <div style={{ animation: 'fadeIn 2s forwards 2.5s', opacity: 0 }}>
            <button onClick={onNext}>Следующий сюрприз</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- УРОВЕНЬ 3: Китайский фонарик ---
function PinataLevel({ onNext }) {
  const [clicks, setClicks] = useState(0);
  const [isHit, setIsHit] = useState(false);
  const maxClicks = 6;
  const isBroken = clicks >= maxClicks;

  const handleHit = () => {
    if (isBroken) return;
    setClicks(prev => prev + 1);
    setIsHit(true);
    setTimeout(() => setIsHit(false), 200); 
  };

  let damageClass = '';
  if (clicks >= 5) damageClass = 'damage-3';
  else if (clicks >= 3) damageClass = 'damage-2';
  else if (clicks >= 1) damageClass = 'damage-1';

  const fireworkParticles = useMemo(() => {
    if (!isBroken) return [];
    const colors = ['#ff0000', '#ffd700', '#ff4500', '#ff69b4', '#00ff00', '#ffffff'];
    return Array.from({ length: 150 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 400; 
      return {
        id: i, color: colors[Math.floor(Math.random() * colors.length)],
        tx: `${Math.cos(angle) * distance}px`, ty: `${Math.sin(angle) * distance}px`, size: `${3 + Math.random() * 5}px`,
      };
    });
  }, [isBroken]);

  const fallingItems = useMemo(() => {
    if (!isBroken) return [];
    const emojis = ['🧧', '🪙', '🥠', '🍬', '🏮', '✨', '🎇'];
    return Array.from({ length: 70 }).map((_, i) => ({
      id: i, emoji: emojis[Math.floor(Math.random() * emojis.length)], left: `${Math.random() * 100}vw`, delay: `${Math.random() * 2}s`, duration: `${2.5 + Math.random() * 3}s` 
    }));
  }, [isBroken]);

  return (
    <div className={`pinata-scene ${isBroken ? 'screen-shake' : ''}`}>
      {!isBroken ? (
        <>
          <h2 className="pinata-title">Разбей фонарик на удачу!<br/>Кликни {maxClicks} раз</h2>
          <div className="rope"></div>
          <div className={`pinata ${isHit ? 'hit' : ''} ${damageClass}`} onClick={handleHit}>🏮</div>
        </>
      ) : (
        <>
          {fireworkParticles.map(p => (
            <div key={`fw-${p.id}`} className="firework-particle" style={{ backgroundColor: p.color, width: p.size, height: p.size, '--tx': p.tx, '--ty': p.ty }} />
          ))}
          <div className="falling-items-container">
            {fallingItems.map(item => (
              <div key={item.id} className="falling-item" style={{ left: item.left, animationDelay: item.delay, animationDuration: item.duration }}>{item.emoji}</div>
            ))}
          </div>
          <div className="magic-scroll">📜</div>
          <div style={{ animation: 'fadeIn 2s forwards 2s', opacity: 0, marginTop: '40px', zIndex: 50 }}>
            <button onClick={onNext}>Открыть свиток</button>
          </div>
        </>
      )}
    </div>
  );
}

// --- УРОВЕНЬ 4: Магический Свиток ---
function ScrollLevel({ onNext }) {
  const [step, setStep] = useState(0);
  const handleClick = () => { if (step < 5) setStep(prev => prev + 1); };

  return (
    <div className="scroll-container">
      {step < 5 && <p className="hint-text">Нажми на свиток, чтобы открыть его ({step}/5)</p>}
      <div className={`magic-scroll-wrapper step-${step}`} onClick={handleClick}>
        <div className="scroll-handle handle-top"></div>
        <div className="scroll-paper">
          <div className={`final-letter ${step === 5 ? 'visible' : 'hidden'}`}>
            <h3>С Днем Рождения!</h3>
            <p>Пусть в твоей жизни будет<br/>много счастья, радости и волшебных моментов.</p>
            <br />
            <p>Ты — невероятный человек.</p>
            <p>Оставайся всегда такой же яркой,</p>
            <p>доброй и искренней.</p>
            <p>я ценю что ты такая 😊</p>
            
            <div style={{ marginTop: '40px' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Останавливаем клик, чтобы он не ушел на сам свиток
                  onNext();
                }}
              >
                Идем к финалу подруга ✨
              </button>
            </div>
          </div>
        </div>
        <div className="scroll-handle handle-bottom"></div>
      </div>
    </div>
  );
}

// --- УРОВЕНЬ 5: ФИНАЛ (Тысяча Фонариков) ---
function FinalLevel({ onRestart }) {
  const [phase, setPhase] = useState(0); 
  // 0: ожидание свайпа, 1: летит главный, 2: летят сотни, 3: финальный текст
  
  const touchStartY = useRef(0);

  const handleSwipeStart = (e) => {
    touchStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
  };

  const handleSwipeEnd = (e) => {
    const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    // Если потянули вверх больше чем на 50 пикселей - запускаем магию
    if (touchStartY.current - endY > 50) {
      triggerMagic();
    }
  };

  const triggerMagic = () => {
    if (phase !== 0) return;
    setPhase(1); // Летит главный фонарик
    
    // Через 2.5 секунды запускаем рой фонариков
    setTimeout(() => setPhase(2), 2500);

    // Через 8 секунд показываем текст "Пусть мечты сбудутся"
    setTimeout(() => setPhase(3), 8000);
  };

  // Генерируем 150 мини-фонариков
  const swarmLanterns = useMemo(() => {
    if (phase < 2) return [];
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      // Разные размеры для создания эффекта глубины (от маленьких точек до средних)
      scale: 0.3 + Math.random() * 0.7,
      // Случайная задержка, чтобы они летели не стеной, а потоком
      delay: `${Math.random() * 5}s`,
      // Скорость полета зависит от размера (мелкие летят медленнее)
      duration: `${10 + Math.random() * 10}s`
    }));
  }, [phase]);

  return (
    <div 
      className={`final-scene-container ${phase >= 2 ? 'light-up' : ''}`}
      onTouchStart={handleSwipeStart}
      onTouchEnd={handleSwipeEnd}
      onMouseDown={handleSwipeStart}
      onMouseUp={handleSwipeEnd}
    >
      {/* Главная инструкция */}
      <div className={`final-prompt ${phase > 0 ? 'hidden' : ''}`}>
        <h2 className="magic-text-glow">А теперь загадай свое самое заветное желание<br/>и отпусти фонарик</h2>
        <p className="swipe-hint">Сделай длинный свайп вверх ⬆</p>
      </div>

      {/* Рой сотен фонариков */}
      {phase >= 2 && (
        <div className="swarm-container">
          {swarmLanterns.map(lantern => (
            <div 
              key={lantern.id} 
              className="mini-lantern"
              style={{
                left: lantern.left,
                transform: `scale(${lantern.scale})`,
                animationDelay: lantern.delay,
                animationDuration: lantern.duration
              }}
            >
              <div className="mini-flame"></div>
            </div>
          ))}
        </div>
      )}

      {/* Главный фонарик пользователя */}
      <div className={`lantern-wrapper-final ${phase > 0 ? 'fly-away' : ''}`} onClick={triggerMagic}>
        <div className="lantern glow-intense"></div>
        <div className="flame intense"></div>
      </div>

      {/* Финальная кульминация (Тексты) */}
      {phase === 3 && (
        <div className="climax-container">
          <h1 className="climax-text">Пусть все твои мечты<br/>обязательно сбудутся</h1>
          <h2 className="climax-subtext">С Днем Рождения ❤️<br/>Этот день только для тебя</h2>
          
          <button className="restart-btn" onClick={onRestart}>Посмотреть снова</button>
        </div>
      )}
    </div>
  );
}