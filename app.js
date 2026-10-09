const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const mainImage = document.getElementById('mainImage');
const celebration = document.getElementById('celebration');

// Configuration
const SAFE_DISTANCE = 100; // pixels - distance at which button starts moving away
const BUTTON_PADDING = 20; // padding from viewport edges

// Track if user has said yes
let hasAccepted = false;

// Initialize No button position to match the placeholder
function initializeNoButton() {
    const buttonContainer = document.querySelector('.button-container');
    const containerRect = buttonContainer.getBoundingClientRect();
    const yesBtnRect = yesBtn.getBoundingClientRect();
    
    // Position No button where the placeholder is (to the right of Yes button)
    const initialX = yesBtnRect.right + 20; // 20px gap
    const initialY = yesBtnRect.top;
    
    noBtn.style.left = `${initialX}px`;
    noBtn.style.top = `${initialY}px`;
}

// Get distance between two points
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Check if position overlaps with Yes button (with padding)
function overlapsYesButton(x, y, padding = 30) {
    const yesRect = yesBtn.getBoundingClientRect();
    const noBtnWidth = noBtn.offsetWidth;
    const noBtnHeight = noBtn.offsetHeight;
    
    return !(x + noBtnWidth + padding < yesRect.left ||
             x - padding > yesRect.right ||
             y + noBtnHeight + padding < yesRect.top ||
             y - padding > yesRect.bottom);
}

// Move button to random position
function moveToRandomPosition() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    
    let newX, newY;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
        newX = BUTTON_PADDING + Math.random() * (viewportWidth - btnWidth - BUTTON_PADDING * 2);
        newY = BUTTON_PADDING + Math.random() * (viewportHeight - btnHeight - BUTTON_PADDING * 2);
        attempts++;
    } while (overlapsYesButton(newX, newY) && attempts < maxAttempts);
    
    // If we couldn't find a non-overlapping position, place it far from Yes button
    if (overlapsYesButton(newX, newY)) {
        const yesRect = yesBtn.getBoundingClientRect();
        newX = Math.max(BUTTON_PADDING, Math.min(viewportWidth - btnWidth - BUTTON_PADDING, yesRect.right + 200));
        newY = Math.max(BUTTON_PADDING, Math.min(viewportHeight - btnHeight - BUTTON_PADDING, yesRect.bottom + 100));
    }
    
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
}

// Move button away from cursor
function moveAwayFromCursor(cursorX, cursorY) {
    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    
    const distance = getDistance(cursorX, cursorY, btnCenterX, btnCenterY);
    
    if (distance < SAFE_DISTANCE) {
        // Calculate direction away from cursor
        const angle = Math.atan2(btnCenterY - cursorY, btnCenterX - cursorX);
        
        // Move button away - increased distance
        const moveDistance = SAFE_DISTANCE * 2;
        let newX = btnCenterX + Math.cos(angle) * moveDistance - btnRect.width / 2;
        let newY = btnCenterY + Math.sin(angle) * moveDistance - btnRect.height / 2;
        
        // Check viewport boundaries
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Clamp to viewport with padding, but if clamping would place it too close to cursor, randomize
        newX = Math.max(BUTTON_PADDING, Math.min(newX, viewportWidth - btnRect.width - BUTTON_PADDING));
        newY = Math.max(BUTTON_PADDING, Math.min(newY, viewportHeight - btnRect.height - BUTTON_PADDING));
        
        // Check if the new position is at the edge
        const atEdge = 
            newX <= BUTTON_PADDING || 
            newX >= viewportWidth - btnRect.width - BUTTON_PADDING ||
            newY <= BUTTON_PADDING || 
            newY >= viewportHeight - btnRect.height - BUTTON_PADDING;
        
        if (atEdge) {
            // Button reached edge, move to random position
            moveToRandomPosition();
        } else {
            // Check if new position would overlap Yes button
            if (overlapsYesButton(newX, newY)) {
                moveToRandomPosition();
            } else {
                noBtn.style.left = `${newX}px`;
                noBtn.style.top = `${newY}px`;
            }
        }
    }
}

// Create confetti
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            celebration.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// Desktop: Track mouse movement
document.addEventListener('mousemove', (e) => {
    if (!hasAccepted) {
        moveAwayFromCursor(e.clientX, e.clientY);
    }
});

// Mobile: Move on touch/tap
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!hasAccepted) {
        moveToRandomPosition();
    }
});

// Prevent click on No button (it should move away before being clicked)
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveToRandomPosition();
});

// Yes button click handler
yesBtn.addEventListener('click', () => {
    if (!hasAccepted) {
        hasAccepted = true;
        
        // Change image
        mainImage.src = 'happy.png';
        
        // Show celebration
        celebration.classList.add('active');
        createConfetti();
        
        // Update heading
        document.querySelector('h1').textContent = 'Yay! 🎉 Hope you have a good trip. Pesty and I love you very much.';
        
        // Hide No button
        noBtn.style.display = 'none';
        
        // Remove celebration after animation
        setTimeout(() => {
            celebration.classList.remove('active');
        }, 3000);
    }
});

// Initialize on load
window.addEventListener('load', () => {
    initializeNoButton();
});

// Re-initialize on resize to keep button visible
window.addEventListener('resize', () => {
    if (!hasAccepted) {
        const btnRect = noBtn.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // If button is off screen after resize, reposition it
        if (btnRect.left < 0 || btnRect.right > viewportWidth || 
            btnRect.top < 0 || btnRect.bottom > viewportHeight) {
            moveToRandomPosition();
        }
    }
});
