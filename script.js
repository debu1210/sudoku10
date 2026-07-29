// 1. DYNAMIC THEMES
const themes = [
    { name: "Neon Dark", bg: "#1a1a2e", board: "#16213e", line: "#0f3460", accent: "#e94560", text: "#ffffff", select: "#2a2a4a" },
    { name: "Minty Fresh", bg: "#e0f7fa", board: "#ffffff", line: "#006064", accent: "#00bcd4", text: "#004d40", select: "#b2ebf2" },
    { name: "Coffee Shop", bg: "#efebe9", board: "#fff3e0", line: "#4e342e", accent: "#d84315", text: "#3e2723", select: "#d7ccc8" },
    { name: "Cherry Blossom", bg: "#fce4ec", board: "#ffffff", line: "#880e4f", accent: "#ec407a", text: "#4a148c", select: "#f8bbd0" }
];

function applyRandomTheme() {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const root = document.documentElement;
    root.style.setProperty('--bg-color', randomTheme.bg);
    root.style.setProperty('--board-bg', randomTheme.board);
    root.style.setProperty('--line-color', randomTheme.line);
    root.style.setProperty('--accent-color', randomTheme.accent);
    root.style.setProperty('--text-color', randomTheme.text);
    root.style.setProperty('--selected-bg', randomTheme.select);
}

// 2. SOUND SYSTEM
const sounds = {
    select: document.getElementById('sound-select'),
    place: document.getElementById('sound-place'),
    error: document.getElementById('sound-error')
};

function playSound(type) {
    if(sounds[type]) {
        sounds[type].currentTime = 0; 
        sounds[type].play().catch(e => console.log("Audio blocked by browser until user interaction"));
    }
}

// 3. INFINITE PUZZLE GENERATOR
// These are 5 distinct board layouts. The empty spaces will shift depending on which is chosen.
const basePuzzles = [
    [5,3,0,0,7,0,0,0,0, 6,0,0,1,9,5,0,0,0, 0,9,8,0,0,0,0,6,0, 8,0,0,0,6,0,0,0,3, 4,0,0,8,0,3,0,0,1, 7,0,0,0,2,0,0,0,6, 0,6,0,0,0,0,2,8,0, 0,0,0,4,1,9,0,0,5, 0,0,0,0,8,0,0,7,9],
    [0,0,0,2,6,0,7,0,1, 6,8,0,0,7,0,0,9,0, 1,9,0,0,0,4,5,0,0, 8,2,0,1,0,0,0,4,0, 0,0,4,6,0,2,9,0,0, 0,5,0,0,0,3,0,2,8, 0,0,9,3,0,0,0,7,4, 0,4,0,0,5,0,0,3,6, 7,0,3,0,1,8,0,0,0],
    [1,0,0,4,8,9,0,0,6, 7,3,0,0,0,0,0,4,0, 0,0,0,0,0,1,2,9,5, 0,0,7,1,2,0,6,0,0, 5,0,0,7,0,3,0,0,8, 0,0,6,0,9,5,7,0,0, 9,1,4,6,0,0,0,0,0, 0,2,0,0,0,0,0,3,7, 8,0,0,5,1,2,0,0,4],
    [0,2,0,6,0,8,0,0,0, 5,8,0,0,0,9,7,0,0, 0,0,0,0,4,0,0,0,0, 3,7,0,0,0,0,5,0,0, 6,0,0,0,0,0,0,0,4, 0,0,8,0,0,0,0,1,3, 0,0,0,0,2,0,0,0,0, 0,0,9,8,0,0,0,3,6, 0,0,0,3,0,6,0,9,0],
    [8,0,0,0,0,0,0,0,0, 0,0,3,6,0,0,0,0,0, 0,7,0,0,9,0,2,0,0, 0,5,0,0,0,7,0,0,0, 0,0,0,0,4,5,7,0,0, 0,0,0,1,0,0,0,3,0, 0,0,1,0,0,0,0,6,8, 0,0,8,5,0,0,0,1,0, 0,9,0,0,0,0,4,0,0]
];

function generateNewPuzzle() {
    // Pick a random grid layout
    const baseGrid = basePuzzles[Math.floor(Math.random() * basePuzzles.length)];
    
    // Shuffle the numbers 1-9
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
    }

    // Map the old numbers to the new shuffled numbers to create a unique puzzle
    return baseGrid.map(cell => {
        if (cell === 0) return 0;
        return digits[cell - 1]; 
    });
}

// 4. GAME STATE
let selectedCell = null;
let currentPuzzle = [];
let currentBoard = [];

// SUDOKU RULES ENGINE
function isValidMove(index, value) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const blockRow = Math.floor(row / 3);
    const blockCol = Math.floor(col / 3);

    for (let i = 0; i < 81; i++) {
        if (i === index) continue; 
        
        const r = Math.floor(i / 9);
        const c = i % 9;
        
        if (r === row || c === col || (Math.floor(r / 3) === blockRow && Math.floor(c / 3) === blockCol)) {
            if (currentBoard[i] === value) {
                return false; 
            }
        }
    }
    return true;
}

// WIN DETECTION
function checkWin() {
    if (!currentBoard.includes(0)) {
        showWinScreen();
    }
}

function showWinScreen() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0'; 
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.animation = 'fadeIn 1s ease-in';
    
    const title = document.createElement('h1');
    title.innerText = 'Puzzle Solved!';
    title.style.color = '#fff';
    title.style.fontSize = '3rem';
    title.style.marginBottom = '20px';
    
    const btn = document.createElement('button');
    btn.innerText = 'Play Again';
    btn.style.padding = '15px 30px';
    btn.style.fontSize = '1.2rem';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.style.borderRadius = '8px';
    btn.style.border = 'none';
    btn.style.backgroundColor = 'var(--accent-color)';
    btn.style.color = 'var(--board-bg)';
    
    // Clicking "Play Again" refreshes the page to trigger a new puzzle and theme
    btn.addEventListener('click', () => location.reload()); 
    
    overlay.appendChild(title);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
}

// INPUT HANDLING
function handleInput(value) {
    if (!selectedCell) {
        playSound('error');
        return;
    }

    const cellIndex = parseInt(selectedCell.dataset.index);

    if (value === "") {
        selectedCell.innerText = "";
        selectedCell.classList.remove('user-input');
        currentBoard[cellIndex] = 0; 
        playSound('place'); 
        return;
    }

    const numValue = parseInt(value);

    if (isValidMove(cellIndex, numValue)) {
        selectedCell.innerText = value;
        selectedCell.classList.add('user-input');
        currentBoard[cellIndex] = numValue; 
        playSound('place');
        checkWin(); 
    } else {
        playSound('error');
        selectedCell.classList.add('shake');
        setTimeout(() => {
            selectedCell.classList.remove('shake');
        }, 400); 
    }
}

// INITIALIZATION
function initGame() {
    applyRandomTheme();
    
    // Generate the unique puzzle for this session
    currentPuzzle = generateNewPuzzle();
    currentBoard = [...currentPuzzle];

    const board = document.getElementById('sudoku-board');
    const pad = document.getElementById('number-pad');
    const eraseBtn = document.getElementById('btn-erase');

    board.innerHTML = ''; 

    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i; 
        
        if (currentPuzzle[i] !== 0) {
            cell.innerText = currentPuzzle[i];
            cell.classList.add('prefilled');
        } else {
            cell.addEventListener('click', () => {
                playSound('select');
                document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                selectedCell = cell;
            });
        }
        board.appendChild(cell);
    }

    // Create buttons (1-9) dynamically, inserting them before the erase button
    if (!document.querySelector('.num-btn:not(.erase-btn)')) {
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.classList.add('num-btn');
            btn.innerText = i;
            btn.addEventListener('click', () => handleInput(i));
            pad.insertBefore(btn, eraseBtn);
        }
    }

    // Ensure the event listener for Erase is only added once
    eraseBtn.replaceWith(eraseBtn.cloneNode(true)); // Clears old listeners if any
    document.getElementById('btn-erase').addEventListener('click', () => handleInput(""));

    window.addEventListener('keydown', (e) => {
        if (e.key >= 1 && e.key <= 9) {
            handleInput(e.key);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            handleInput("");
        }
    });
}

window.onload = initGame;
