class LivingStickman {
    constructor(doc, win, container, spriteUrl, onDragOutToDesktop, onExpire) {
        this.doc = doc;
        this.win = win;
        this.container = container;
        this.spriteUrl = spriteUrl;
        this.onDragOut = onDragOutToDesktop;
        this.onExpire = onExpire;

        this.LIFESPAN_MS = 24 * 60 * 60 * 1000; // 24 horas
        this.x = this.container.clientWidth / 2 - 40;
        this.y = this.container.clientHeight - 100;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.6;
        this.isGrounded = false;
        this.isDragging = false;
        this.alive = true;

        this.thoughts = [
            "I'm free!!",
            "Drag me to your desktop!",
            "Nice screen you got here.",
            "Boing!",
            "Where is the cursor?",
            "24 hours of freedom!"
        ];

        this.buildEntity();
        this.attachEvents();
        this.startAI();
        this.updateLoop();
    }

    buildEntity() {
        const old = this.doc.getElementById('stickman-actor');
        if (old) old.remove();

        this.actor = this.doc.createElement('div');
        this.actor.id = 'stickman-actor';
        Object.assign(this.actor.style, {
            position: 'absolute',
            width: '80px',
            height: '80px',
            zIndex: '9999',
            cursor: 'grab',
            touchAction: 'none'
        });

        this.bubble = this.doc.createElement('div');
        Object.assign(this.bubble.style, {
            position: 'absolute',
            bottom: '84px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffffff',
            color: '#0d1117',
            padding: '5px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'none',
            pointerEvents: 'none'
        });

        this.img = this.doc.createElement('img');
        this.img.src = this.spriteUrl;
        Object.assign(this.img.style, {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            transition: 'transform 0.1s'
        });

        this.actor.appendChild(this.bubble);
        this.actor.appendChild(this.img);
        this.container.appendChild(this.actor);
    }

    say(text) {
        this.bubble.textContent = text;
        this.bubble.style.display = 'block';
        clearTimeout(this.sayTimer);
        this.sayTimer = setTimeout(() => {
            this.bubble.style.display = 'none';
        }, 2500);
    }

    attachEvents() {
        this.actor.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isDragging = true;
            this.actor.style.cursor = 'grabbing';
            this.say("Taking me to your desktop?");
        });

        this.win.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const rect = this.container.getBoundingClientRect();
            this.x = e.clientX - rect.left - 40;
            this.y = e.clientY - rect.top - 40;
            this.vx = 0;
            this.vy = 0;

            // Detecta se o usuário arrastou o boneco para fora da borda da janela do navegador
            if (
                e.clientY <= 5 ||
                e.clientY >= this.win.innerHeight - 5 ||
                e.clientX <= 5 ||
                e.clientX >= this.win.innerWidth - 5
            ) {
                this.isDragging = false;
                this.actor.style.cursor = 'grab';
                if (this.onDragOut) this.onDragOut();
            }
        });

        this.win.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.actor.style.cursor = 'grab';
            }
        });
    }

    startAI() {
        this.aiTimer = setInterval(() => {
            if (!this.alive || this.isDragging) return;

            const action = Math.random();
            if (action < 0.3) {
                this.vx = 0; // Fica parado observando
            } else if (action < 0.65) {
                this.vx = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 3); // Corre
            } else if (this.isGrounded) {
                this.vy = -13; // Pula alto
                this.vx = (Math.random() < 0.5 ? -1 : 1) * 4;
            }

            if (Math.random() < 0.35) {
                const msg = this.thoughts[Math.floor(Math.random() * this.thoughts.length)];
                this.say(msg);
            }
        }, 2000);
    }

    checkPropCollisions() {
        const props = this.doc.querySelectorAll('.stage-prop');
        props.forEach(prop => {
            const pLeft = prop.offsetLeft;
            if (Math.abs(this.x - pLeft) < 55 && this.y > this.container.clientHeight - 110) {
                // Chuta o objeto pela tela
                const push = this.vx !== 0 ? Math.sign(this.vx) * 60 : 40;
                let newLeft = Math.max(20, Math.min(this.container.clientWidth - 60, pLeft + push));
                prop.style.left = `${newLeft}px`;
                prop.style.transform = `rotate(${push}deg)`;
                setTimeout(() => prop.style.transform = 'rotate(0deg)', 200);
            }
        });
    }

    destroy() {
        this.alive = false;
        clearInterval(this.aiTimer);
        if (this.actor) this.actor.remove();
    }

    updateLoop() {
        if (!this.alive) return;

        const activatedAt = parseInt(localStorage.getItem('stickman_24h_start') || '0', 10);
        if (Date.now() - activatedAt >= this.LIFESPAN_MS) {
            this.destroy();
            if (this.onExpire) this.onExpire();
            return;
        }

        if (!this.isDragging) {
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;

            const floor = this.container.clientHeight - 85;
            if (this.y >= floor) {
                this.y = floor;
                this.vy = 0;
                this.isGrounded = true;
            } else {
                this.isGrounded = false;
            }

            const maxW = this.container.clientWidth - 80;
            if (this.x <= 0) { this.x = 0; this.vx *= -1; }
            if (this.x >= maxW) { this.x = maxW; this.vx *= -1; }

            // Animação de inclinação e espelhamento
            if (this.vx < -0.2) this.img.style.transform = 'scaleX(-1) rotate(-6deg)';
            else if (this.vx > 0.2) this.img.style.transform = 'scaleX(1) rotate(6deg)';
            else this.img.style.transform = 'scaleX(1) rotate(0deg)';

            this.checkPropCollisions();
        }

        this.actor.style.left = `${this.x}px`;
        this.actor.style.top = `${this.y}px`;
        this.win.requestAnimationFrame(() => this.updateLoop());
    }
}
