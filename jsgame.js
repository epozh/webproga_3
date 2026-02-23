// ===== ИГРОВЫЕ ПЕРЕМЕННЫЕ =====
var Game = {
    grid: [],           // 4x4 сетка
    score: 0,           // Текущий счёт
    bestScore: 0,       // Лучший счёт
    previousState: null,// Предыдущее состояние для undo
    isGameOver: false,  // Флаг окончания игры
    touchStartX: 0,     // Для свайпов
    touchStartY: 0,
    hasMoved: false     // Было ли движение в текущем ходе
};

// Размер сетки
var GRID_SIZE = 4;

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    Game.init();
});

Game.init = function() {
    this.bestScore = Storage.loadBestScore();
    this.updateScore(0);
    
    var savedState = Storage.loadGameState();
    if (savedState) {
        this.restoreState(savedState);
    } else {
        this.startNewGame();
    }
    
    this.setupEventListeners();
};

// ===== СОЗДАНИЕ СЕТКИ =====
Game.createGrid = function() {
    var gridElement = document.getElementById('grid');
    
    // Очистка
    while (gridElement.firstChild) {
        gridElement.removeChild(gridElement.firstChild);
    }
    
    // Создание 4x4 сетки
    for (var i = 0; i < GRID_SIZE; i++) {
        var row = document.createElement('div');
        row.className = 'grid-row';
        
        for (var j = 0; j < GRID_SIZE; j++) {
            var cell = document.createElement('div');
            cell.className = 'grid-cell';
            row.appendChild(cell);
        }
        
        gridElement.appendChild(row);
    }
};

// ===== НОВАЯ ИГРА =====
Game.startNewGame = function() {
    this.grid = [];
    for (var i = 0; i < GRID_SIZE; i++) {
        this.grid[i] = [];
        for (var j = 0; j < GRID_SIZE; j++) {
            this.grid[i][j] = 0;
        }
    }
    
    this.score = 0;
    this.isGameOver = false;
    this.previousState = null;
    this.hasMoved = false;
    
    this.updateScore(0);
    this.createGrid();
    this.clearTiles();
    
    // Добавляем начальные плитки (1-3 штуки)
    var initialTiles = Math.random() > 0.5 ? 2 : 3;
    for (var k = 0; k < initialTiles; k++) {
        this.addRandomTile();
    }
    
    this.saveState();
    this.updateDisplay();
};

// ===== ОЧИСТКА ПЛИТОК =====
Game.clearTiles = function() {
    var container = document.getElementById('tile-container');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

// ===== ДОБАВЛЕНИЕ СЛУЧАЙНОЙ ПЛИТКИ =====
Game.addRandomTile = function() {
    var emptyCells = [];
    
    for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
            if (this.grid[i][j] === 0) {
                emptyCells.push({x: i, y: j});
            }
        }
    }
    
    if (emptyCells.length > 0) {
        var randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        // 90% вероятность для 2, 10% для 4
        var value = Math.random() < 0.9 ? 2 : 4;
        this.grid[randomCell.x][randomCell.y] = value;
        
        this.createTileElement(randomCell.x, randomCell.y, value, true);
    }
};

// ===== СОЗДАНИЕ ЭЛЕМЕНТА ПЛИТКИ =====
Game.createTileElement = function(x, y, value, isNew) {
    var tile = document.createElement('div');
    tile.className = 'tile tile-' + value + (isNew ? ' tile-new' : '');
    tile.textContent = value;
    
    // Позиционирование
    var cellSize = window.innerWidth <= 520 ? 72.5 : 106.25;
    var gap = window.innerWidth <= 520 ? 10 : 15;
    var padding = window.innerWidth <= 520 ? 10 : 15;
    
    tile.style.left = (padding + y * (cellSize + gap)) + 'px';
    tile.style.top = (padding + x * (cellSize + gap)) + 'px';
    
    document.getElementById('tile-container').appendChild(tile);
    
    return tile;
};

// ===== ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ =====
Game.updateDisplay = function() {
    this.clearTiles();
    
    for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
            if (this.grid[i][j] !== 0) {
                this.createTileElement(i, j, this.grid[i][j], false);
            }
        }
    }
};

// ===== ОБНОВЛЕНИЕ СЧЁТА =====
Game.updateScore = function(newScore) {
    this.score = newScore;
    document.getElementById('score').textContent = this.score;
    
    if (this.score > this.bestScore) {
        this.bestScore = this.score;
        Storage.saveBestScore(this.bestScore);
    }
    
    document.getElementById('best').textContent = this.bestScore;
};

// ===== СОХРАНЕНИЕ/ВОССТАНОВЛЕНИЕ СОСТОЯНИЯ =====
Game.saveState = function() {
    var state = {
        grid: JSON.parse(JSON.stringify(this.grid)),
        score: this.score,
        isGameOver: this.isGameOver
    };
    Storage.saveGameState(state);
};

Game.restoreState = function(savedState) {
    this.grid = savedState.grid;
    this.score = savedState.score;
    this.isGameOver = savedState.isGameOver;
    this.bestScore = Storage.loadBestScore();
    
    this.updateScore(this.score);
    this.createGrid();
    this.updateDisplay();
    
    if (this.isGameOver) {
        this.showGameOver();
    }
};

// ===== ОТМЕНА ХОДА =====
Game.undo = function() {
    if (this.isGameOver || !this.previousState) {
        return;
    }
    
    this.grid = JSON.parse(JSON.stringify(this.previousState.grid));
    this.updateScore(this.previousState.score);
    this.updateDisplay();
    this.saveState();
};

// ===== СОХРАНЕНИЕ ДЛЯ ОТМЕНЫ =====
Game.saveForUndo = function() {
    this.previousState = {
        grid: JSON.parse(JSON.stringify(this.grid)),
        score: this.score
    };
};

// ===== ДВИЖЕНИЕ =====
Game.move = function(direction) {
    if (this.isGameOver) return;
    
    this.saveForUndo();
    this.hasMoved = false;
    var scoreAdd = 0;
    
    // Создаём копию сетки для проверки изменений
    var previousGrid = JSON.parse(JSON.stringify(this.grid));
    
    if (direction === 'left' || direction === 'right') {
        for (var i = 0; i < GRID_SIZE; i++) {
            var row = this.grid[i].slice();
            if (direction === 'right') row.reverse();
            
            var result = this.processLine(row);
            var newRow = result.line;
            scoreAdd += result.score;
            
            if (direction === 'right') newRow.reverse();
            this.grid[i] = newRow;
        }
    } else {
        for (var j = 0; j < GRID_SIZE; j++) {
            var col = [];
            for (var i = 0; i < GRID_SIZE; i++) {
                col.push(this.grid[i][j]);
            }
            
            if (direction === 'down') col.reverse();
            
            var result = this.processLine(col);
            var newCol = result.line;
            scoreAdd += result.score;
            
            if (direction === 'down') newCol.reverse();
            
            for (var i = 0; i < GRID_SIZE; i++) {
                this.grid[i][j] = newCol[i];
            }
        }
    }
    
    // Проверяем, изменилась ли сетка
    for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
            if (this.grid[i][j] !== previousGrid[i][j]) {
                this.hasMoved = true;
                break;
            }
        }
        if (this.hasMoved) break;
    }
    
    if (this.hasMoved) {
        this.updateScore(this.score + scoreAdd);
        this.addRandomTile();
        this.updateDisplay();
        this.saveState();
        
        if (this.isGameOverCheck()) {
            this.isGameOver = true;
            this.saveState();
            setTimeout(function() {
                Game.showGameOver();
            }, 300);
        }
    }
};

// ===== ОБРАБОТКА ЛИНИИ (ряда/колонки) =====
Game.processLine = function(line) {
    // Удаляем нули
    var filtered = line.filter(function(x) { return x !== 0; });
    var score = 0;
    
    // Сливаем плитки
    for (var i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
            filtered[i] *= 2;
            score += filtered[i];
            filtered[i + 1] = 0;
        }
    }
    
    // Удаляем нули после слияния
    filtered = filtered.filter(function(x) { return x !== 0; });
    
    // Добавляем нули в конец
    while (filtered.length < GRID_SIZE) {
        filtered.push(0);
    }
    
    return { line: filtered, score: score };
};

// ===== ПРОВЕРКА ОКОНЧАНИЯ ИГРЫ =====
Game.isGameOverCheck = function() {
    // Проверяем наличие пустых клеток
    for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
            if (this.grid[i][j] === 0) return false;
        }
    }
    
    // Проверяем возможность слияния по горизонтали
    for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE - 1; j++) {
            if (this.grid[i][j] === this.grid[i][j + 1]) return false;
        }
    }
    
    // Проверяем возможность слияния по вертикали
    for (var i = 0; i < GRID_SIZE - 1; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
            if (this.grid[i][j] === this.grid[i + 1][j]) return false;
        }
    }
    
    return true;
};

// ===== МОДАЛЬНЫЕ ОКНА =====
Game.showGameOver = function() {
    var modal = document.getElementById('game-over-modal');
    var finalScore = document.getElementById('final-score');
    var nameInputSection = document.getElementById('name-input-section');
    var successMessage = document.getElementById('save-success');
    var mobileControls = document.getElementById('mobile-controls');
    
    finalScore.textContent = this.score;
    
    // Показываем/скрываем ввод имени в зависимости от попадания в топ-10
    if (Leaderboard.isHighScore(this.score)) {
        nameInputSection.classList.remove('hidden');
        successMessage.classList.add('hidden');
        document.getElementById('player-name').value = '';
    } else {
        nameInputSection.classList.add('hidden');
        successMessage.classList.remove('hidden');
        successMessage.textContent = 'К сожалению, вы не попали в топ-10';
    }
    
    // Скрываем мобильное управление
    if (mobileControls) {
        mobileControls.style.display = 'none';
    }
    
    modal.classList.remove('hidden');
};

Game.hideGameOver = function() {
    document.getElementById('game-over-modal').classList.add('hidden');
    var mobileControls = document.getElementById('mobile-controls');
    if (mobileControls && window.innerWidth <= 520) {
        mobileControls.style.display = 'flex';
    }
};

Game.showLeaderboard = function() {
    Leaderboard.render();
    document.getElementById('leaderboard-modal').classList.remove('hidden');
    
    var mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        mobileControls.style.display = 'none';
    }
};

Game.hideLeaderboard = function() {
    document.getElementById('leaderboard-modal').classList.add('hidden');
    
    var mobileControls = document.getElementById('mobile-controls');
    if (mobileControls && window.innerWidth <= 520 && !this.isGameOver) {
        mobileControls.style.display = 'flex';
    }
};

// ===== СОХРАНЕНИЕ РЕКОРДА =====
Game.saveScore = function() {
    var nameInput = document.getElementById('player-name');
    var name = nameInput.value.trim();
    
    if (!name) {
        name = 'Аноним';
    }
    
    Leaderboard.addEntry(name, this.score);
    
    var nameInputSection = document.getElementById('name-input-section');
    var successMessage = document.getElementById('save-success');
    
    nameInputSection.classList.add('hidden');
    successMessage.classList.remove('hidden');
    successMessage.textContent = 'Ваш рекорд сохранён!';
};

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
Game.setupEventListeners = function() {
    var self = this;
    
    // Клавиатура
    document.addEventListener('keydown', function(e) {
        if (self.isGameOver) return;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                self.move('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                self.move('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                self.move('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                self.move('right');
                break;
        }
    });
    
    // Кнопки управления
    document.getElementById('new-game').addEventListener('click', function() {
        self.startNewGame();
    });
    
    document.getElementById('undo').addEventListener('click', function() {
        self.undo();
    });
    
    document.getElementById('show-leaderboard').addEventListener('click', function() {
        self.showLeaderboard();
    });
    
    document.getElementById('close-leaderboard').addEventListener('click', function() {
        self.hideLeaderboard();
    });
    
    document.getElementById('save-score').addEventListener('click', function() {
        self.saveScore();
    });
    
    document.getElementById('restart-game').addEventListener('click', function() {
        self.hideGameOver();
        self.startNewGame();
    });
    
    // Мобильные кнопки
    var arrowButtons = document.querySelectorAll('.arrow-btn');
    arrowButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (self.isGameOver) return;
            var dir = this.getAttribute('data-dir');
            self.move(dir);
        });
    });
    
    // Свайпы для мобильных
    var gameContainer = document.querySelector('.game-container');
    
    gameContainer.addEventListener('touchstart', function(e) {
        self.touchStartX = e.touches[0].clientX;
        self.touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    gameContainer.addEventListener('touchend', function(e) {
        if (self.isGameOver) return;
        
        var touchEndX = e.changedTouches[0].clientX;
        var touchEndY = e.changedTouches[0].clientY;
        
        var dx = touchEndX - self.touchStartX;
        var dy = touchEndY - self.touchStartY;
        
        var minSwipe = 50;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > minSwipe) {
                if (dx > 0) {
                    self.move('right');
                } else {
                    self.move('left');
                }
            }
        } else {
            if (Math.abs(dy) > minSwipe) {
                if (dy > 0) {
                    self.move('down');
                } else {
                    self.move('up');
                }
            }
        }
    }, { passive: true });
    
    // Закрытие модалок по клику вне контента
    window.addEventListener('click', function(e) {
        var gameOverModal = document.getElementById('game-over-modal');
        var leaderboardModal = document.getElementById('leaderboard-modal');
        
        if (e.target === gameOverModal) {
            // Не закрываем game over модалку при клике вне
        }
        
        if (e.target === leaderboardModal) {
            self.hideLeaderboard();
        }
    });
};