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