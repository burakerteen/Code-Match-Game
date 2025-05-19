const target = generateCode(8);
let playerCode = shuffleArray([...target]);
let position = 0;
let timeLeft = 20.0;
let timerInterval = null;
let gameStarted = false;

const targetDiv = document.getElementById('target-code');
const playerDiv = document.getElementById('player-code');
const swapBar = document.getElementById('swap-bar');
const message = document.getElementById('message');
const timerDiv = document.getElementById('timer');
const startScreen = document.getElementById('start-screen');
const playerNameInput = document.getElementById('player-name');
const newGameButton = document.getElementById('new-game-button');
const newGameContainer = document.getElementById('new-game-container');
const bgMusic = document.getElementById('bg-music');
const resetScoresButton = document.getElementById('reset-scores-button');

function generateCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]);
}

function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderCodes() {
  targetDiv.textContent = target.join(' ');
  playerDiv.innerHTML = '';

  playerCode.forEach(char => {
    const box = document.createElement('div');
    box.className = 'char-box';
    box.textContent = char;
    playerDiv.appendChild(box);
  });

  const boxes = playerDiv.querySelectorAll('.char-box');
  const box1 = boxes[position];
  const box2 = boxes[position + 1];
  const containerRect = playerDiv.getBoundingClientRect();

  if (box1 && box2) {
    const rect1 = box1.getBoundingClientRect();
    const rect2 = box2.getBoundingClientRect();
    const left = rect1.left - containerRect.left;
    const width = (rect2.left + rect2.width) - rect1.left;

    swapBar.style.left = `${left}px`;
    swapBar.style.width = `${width}px`;
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timeLeft = 0;
      timerDiv.textContent = '00.00';
      message.textContent = "Time's up!";
      document.removeEventListener('keydown', handleKey);
      newGameContainer.style.display = 'block';
    } else {
      timerDiv.textContent = timeLeft.toFixed(2);
    }
  }, 100);
}

function checkWin() {
  if (playerCode.join('') === target.join('')) {
    message.textContent = 'Bypass Successful!';
    clearInterval(timerInterval);
    document.removeEventListener('keydown', handleKey);
    const name = playerNameInput.value.trim();
    saveScore(name, timeLeft);
    newGameContainer.style.display = 'block';
  }
}

function handleKey(e) {
  if (!gameStarted) return;

  if (e.code === 'ArrowRight') {
    if (position < playerCode.length - 2) {
      position++;
      renderCodes();
    }
  } else if (e.code === 'ArrowLeft') {
    if (position > 0) {
      position--;
      renderCodes();
    }
  } else if (e.code === 'Space') {
    [playerCode[position], playerCode[position + 1]] = [playerCode[position + 1], playerCode[position]];
    renderCodes();
    checkWin();
  }
}

function startGame() {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert("Lütfen isminizi girin.");
    return;
  }

  if (gameStarted) return;
  gameStarted = true;

  startScreen.style.display = 'none';

  bgMusic.play().catch(e => {
    console.log("Müzik otomatik başlatılamadı:", e);
  });

  renderCodes();
  document.addEventListener('keydown', handleKey);
  startTimer();
}

function saveScore(name, score) {
  let scores = JSON.parse(localStorage.getItem('scores')) || {};
  if (!scores[name] || score > scores[name]) {
    scores[name] = score;
  }
  localStorage.setItem('scores', JSON.stringify(scores));
  renderScoreboard();
}

function renderScoreboard() {
  const scoreList = document.getElementById('score-list');
  const scores = JSON.parse(localStorage.getItem('scores')) || {};

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  scoreList.innerHTML = '';
  sorted.forEach(([name, score], index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${name}: ${score.toFixed(2)}`;
    scoreList.appendChild(li);
  });
}

document.addEventListener('keydown', function (e) {
  if (!gameStarted && e.code === 'Enter') {
    e.preventDefault();
    startGame();
  }
});

newGameButton.addEventListener('click', () => {
  location.reload();
});

resetScoresButton.addEventListener('click', () => {
  if (confirm("Tüm skorları silmek istediğine emin misin?")) {
    localStorage.removeItem('scores');
    renderScoreboard();
  }
});

renderScoreboard();
