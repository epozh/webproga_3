// Управление таблицей лидеров
var Leaderboard = {
    // Максимальное количество записей
    MAX_ENTRIES: 10,

    // Добавить новый рекорд
    addEntry: function(name, score) {
        var entries = Storage.loadLeaderboard();
        
        var entry = {
            name: name.trim() || 'Аноним',
            score: score,
            date: new Date().toLocaleDateString('ru-RU')
        };

        entries.push(entry);
        
        // Сортировка по убыванию очков
        entries.sort(function(a, b) {
            return b.score - a.score;
        });

        // Оставляем только топ-10
        if (entries.length > this.MAX_ENTRIES) {
            entries = entries.slice(0, this.MAX_ENTRIES);
        }

        Storage.saveLeaderboard(entries);
        return entries;
    },

    // Получить все записи
    getEntries: function() {
        return Storage.loadLeaderboard();
    },

    // Проверить, попадает ли счёт в топ-10
    isHighScore: function(score) {
        var entries = this.getEntries();
        if (entries.length < this.MAX_ENTRIES) {
            return true;
        }
        return score > entries[entries.length - 1].score;
    },

    // Отрисовать таблицу
    render: function() {
        var tbody = document.getElementById('leaderboard-body');
        var entries = this.getEntries();

        // Очистка
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        if (entries.length === 0) {
            var row = document.createElement('tr');
            var cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'Пока нет рекордов';
            cell.style.textAlign = 'center';
            cell.style.padding = '20px';
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }

        entries.forEach(function(entry, index) {
            var row = document.createElement('tr');
            
            var placeCell = document.createElement('td');
            placeCell.textContent = (index + 1) + '.';
            
            var nameCell = document.createElement('td');
            nameCell.textContent = entry.name;
            
            var scoreCell = document.createElement('td');
            scoreCell.textContent = entry.score;
            scoreCell.style.fontWeight = 'bold';
            
            var dateCell = document.createElement('td');
            dateCell.textContent = entry.date;

            row.appendChild(placeCell);
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            row.appendChild(dateCell);
            
            tbody.appendChild(row);
        });
    }
};

