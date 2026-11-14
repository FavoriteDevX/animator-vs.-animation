const DEFAULT_STICKMAN = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" viewBox="0 0 100 100"><circle cx="50" cy="20" r="12" fill="none" stroke="%2358a6ff" stroke-width="5"/><line x1="50" y1="32" x2="50" y2="65" stroke="%2358a6ff" stroke-width="5"/><line x1="50" y1="42" x2="26" y2="55" stroke="%2358a6ff" stroke-width="5"/><line x1="50" y1="42" x2="74" y2="55" stroke="%2358a6ff" stroke-width="5"/><line x1="50" y1="65" x2="32" y2="92" stroke="%2358a6ff" stroke-width="5"/><line x1="50" y1="65" x2="68" y2="92" stroke="%2358a6ff" stroke-width="5"/></svg>';
const LIFESPAN_MS = 24 * 60 * 60 * 1000;

let currentSprite = localStorage.getItem('stickman_custom_png') || DEFAULT_STICKMAN;
let mainPet = null;
let desktopPipPet = null;

const stage = document.getElementById('stage');
const spriteInput = document.getElementById('sprite-input');
const timerDisplay = document.getElementById('timer-display');
const statusDot = document.getElementById('status-dot');

// Upload do stickman do usuário
spriteInput.addEventListener('change', (e) => {
    const file = e.target.files;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        currentSprite = ev.target.result;
        localStorage.setItem('stickman_custom_png', currentSprite);
        activateLifeCycle();
    };
    reader.readAsDataURL(file);
});

// Abre uma janela flutuante desacoplada quando o usuário arrasta o boneco para fora da tela
async function popOutToDesktop() {
    if (!('documentPictureInPicture' in window)) {
        alert("To drag the stickman onto your desktop, please use Google Chrome, Edge, or Brave on a laptop/PC!");
        return;
    }

    try {
        const pipWin = await documentPictureInPicture.requestWindow({
            width: 340,
            height: 220
        });

        pipWin.document.body.style.margin = '0';
        pipWin.document.body.style.background = '#0d1117';
        pipWin.document.body.style.overflow = 'hidden';
        pipWin.document.body.style.position = 'relative';
        pipWin.document.body.style.height = '100vh';

        if (mainPet) mainPet.destroy();

        desktopPipPet = new LivingStickman(
            pipWin.document,
            pipWin,
            pipWin.document.body,
            currentSprite,
            null,
            handleExpiration
        );
        desktopPipPet.say("Yay! I'm on your desktop now!");

        // Quando o usuário fechar a janela flutuante, o boneco volta para o palco principal
        pipWin.addEventListener('pagehide', () => {
            if (desktopPipPet) desktopPipPet.destroy();
            spawnOnMainStage();
        });
    } catch (err) {
        console.error("Pop-out cancelled or blocked:", err);
    }
}

function handleExpiration() {
    statusDot.classList.remove('alive');
    timerDisplay.textContent = "Expired (24H ended) — Click Activate to wake up!";
    timerDisplay.style.color = "#f85149";
}

function spawnOnMainStage() {
    if (mainPet) mainPet.destroy();
    statusDot.classList.add('alive');
    timerDisplay.style.color = "#2ea043";

    mainPet = new LivingStickman(
        document,
        window,
        stage,
        currentSprite,
        popOutToDesktop, // Dispara automaticamente ao arrastar para a borda da tela!
        handleExpiration
    );
}

function activateLifeCycle() {
    localStorage.setItem('stickman_24h_start', Date.now().toString());
    spawnOnMainStage();
}

document.getElementById('btn-activate').addEventListener('click', activateLifeCycle);
document.getElementById('btn-popout').addEventListener('click', () => {
    const start = parseInt(localStorage.getItem('stickman_24h_start') || '0', 10);
    if (Date.now() - start >= LIFESPAN_MS) {
        localStorage.setItem('stickman_24h_start', Date.now().toString());
    }
    popOutToDesktop();
});

// Atualiza o relógio de 24 horas a cada segundo
setInterval(() => {
    const start = parseInt(localStorage.getItem('stickman_24h_start') || '0', 10);
    if (!start) return;

    const rem = LIFESPAN_MS - (Date.now() - start);
    if (rem > 0) {
        const h = Math.floor(rem / 3600000);
        const m = Math.floor((rem % 3600000) / 60000);
        const s = Math.floor((rem % 60000) / 1000);
        timerDisplay.textContent = `Alive: ${h}h ${m}m ${s}s left`;
    }
}, 1000);

// Se já estiver dentro do ciclo de 24h ao abrir o site, continua vivo
const savedStart = parseInt(localStorage.getItem('stickman_24h_start') || '0', 10);
if (Date.now() - savedStart < LIFESPAN_MS) {
    spawnOnMainStage();
}
