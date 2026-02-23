// Управление localStorage
var Storage = {
    // Ключи для хранения
    KEYS: {
        GAME_STATE: '2048_game_state',
        LEADERBOARD: '2048_leaderboard',
        BEST_SCORE: '2048_best_score'
    },

    // Сохранить состояние игры
    saveGameState: function(state) {
        localStorage.setItem(this.KEYS.GAME_STATE, JSON.stringify(state));
    },

    // Загрузить состояние игры
    loadGameState: function() {
        var data = localStorage.getItem(this.KEYS.GAME_STATE);
        return data ? JSON.parse(data) : null;
    },

    // Удалить состояние игры
    clearGameState: function() {
        localStorage.removeItem(this.KEYS.GAME_STATE);
    },

    // Сохранить лучший счёт
    saveBestScore: function(score) {
        localStorage.setItem(this.KEYS.BEST_SCORE, score.toString());
    },

    // Загрузить лучший счёт
    loadBestScore: function() {
        var score = localStorage.getItem(this.KEYS.BEST_SCORE);
        return score ? parseInt(score, 10) : 0;
    },

    // Сохранить таблицу лидеров
    saveLeaderboard: function(leaderboard) {
        localStorage.setItem(this.KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    },

    // Загрузить таблицу лидеров
    loadLeaderboard: function() {
        var data = localStorage.getItem(this.KEYS.LEADERBOARD);
        return data ? JSON.parse(data) : [];
    }
};