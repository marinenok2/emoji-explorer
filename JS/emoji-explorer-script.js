'use strict';

// Знаходимо потрібні елементи на сторінці.
const selectCategory = document.querySelector('#category');
const selectGroup = document.querySelector('#group');
const emojiBlock = document.querySelector('.emojiBlock');
const paginationContainer = document.querySelector('.pagination');
const emojiInfo = document.querySelector('.emoji-info');
const selectedEmojis = document.querySelector('.selected-emojis');

// Дані та поточні налаштування перегляду.
let allEmojis = [];
let emojisByCategory = {};
let emojisByGroup = {};
let currentEmojis = [];
let currentPage = 1;
const perPage = 45;

// Отримуємо список емодзі з API.
async function loadEmojis() {
    try {
        const response = await fetch('https://emojihub.yurace.pro/api/all');

        if (!response.ok) {
            throw new Error('Не вдалося завантажити емодзі');
        }

        allEmojis = await response.json();

        // Розподіляємо емодзі за категоріями та групами.
        allEmojis.forEach(emoji => {
            const category = emoji.category.toLowerCase();
            const group = emoji.group.toLowerCase();

            if (!emojisByCategory[category]) {
                emojisByCategory[category] = [];
            }
            emojisByCategory[category].push(emoji);

            if (!emojisByGroup[group]) {
                emojisByGroup[group] = [];
            }
            emojisByGroup[group].push(emoji);
        });

        // Додаємо варіанти до двох списків.
        Object.keys(emojisByCategory).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            selectCategory.appendChild(option);
        });

        Object.keys(emojisByGroup).sort().forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            selectGroup.appendChild(option);
        });

        // Спочатку показуємо першу категорію.
        displayEmojisByCategory();
    } catch (error) {
        emojiBlock.textContent = 'Помилка завантаження емодзі. Перевір інтернет і спробуй оновити сторінку.';
        console.error(error);
    }
}

// Перетворюємо Unicode-коди на емодзі, зокрема складені.
function getEmojiSymbol(emoji) {
    const codes = emoji.unicode.map(code => parseInt(code.replace('U+', ''), 16));
    return String.fromCodePoint(...codes);
}

// Показуємо лише емодзі з поточної сторінки.
function displayEmojis() {
    emojiBlock.innerHTML = '';

    const startIndex = (currentPage - 1) * perPage;
    const emojisOnPage = currentEmojis.slice(startIndex, startIndex + perPage);

    emojisOnPage.forEach(emoji => {
        const emojiDiv = document.createElement('div');
        emojiDiv.textContent = getEmojiSymbol(emoji);
        emojiDiv.addEventListener('click', () => showEmojiInfo(emoji));
        emojiBlock.appendChild(emojiDiv);
    });

    renderPagination();
}

// Відображення обраної категорії.
function displayEmojisByCategory() {
    currentEmojis = emojisByCategory[selectCategory.value] || [];
    currentPage = 1;
    displayEmojis();
}

// Відображення обраної групи.
function displayEmojisByGroup() {
    currentEmojis = emojisByGroup[selectGroup.value] || [];
    currentPage = 1;
    displayEmojis();
}

// Показуємо інформацію про емодзі після кліку.
function showEmojiInfo(emoji) {
    emojiInfo.innerHTML = '';

    const info = document.createElement('div');
    info.className = 'info';

    const details = [
        ['Name', emoji.name],
        ['Category', emoji.category],
        ['Group', emoji.group],
        ['HtmlCode', emoji.htmlCode.join(' ')],
        ['Unicode', emoji.unicode.join(' ')]
    ];

    details.forEach(([label, value]) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = `${label}: ${value}`;
        info.appendChild(paragraph);
    });

    emojiInfo.appendChild(info);

    const chosenEmoji = document.createElement('span');
    chosenEmoji.textContent = getEmojiSymbol(emoji);
    selectedEmojis.appendChild(chosenEmoji);
}

// Створюємо кнопки сторінок для поточного списку емодзі.
function renderPagination() {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(currentEmojis.length / perPage);

    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        button.textContent = page;
        button.type = 'button';

        if (page === currentPage) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            currentPage = page;
            displayEmojis();
        });

        paginationContainer.appendChild(button);
    }
}

// На зміну фільтра реагуємо тільки один раз.
selectCategory.addEventListener('change', displayEmojisByCategory);
selectGroup.addEventListener('change', displayEmojisByGroup);

loadEmojis();
