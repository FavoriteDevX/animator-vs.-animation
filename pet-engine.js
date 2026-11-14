class StickmanPetEngine {
    constructor(targetDocument, targetWindow, spriteSrc, config, onExpire) {
        this.doc = targetDocument;
        this.win = targetWindow;
        this.spriteSrc = spriteSrc;
        this.config = config;
        this.onExpire = onExpire;

        this.LIFESPAN_MS = 24 * 60 * 60 * 1000; // 24 Hours
        this.x = this.win.innerWidth / 2 - 35;
        this.y = this.win.innerHeight - 90;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.65;
        this.isDragging = false;
        this.mouseX = this.x;
        this.mouseY = this.y;
        this.running = true;

        this.phrases = [
            "Where am I?",
            "Nice laptop!",
            "Feed me pixels!",
            "Don't close this tab!",
            "I'm alive!!",
            "What are you working on?"
        ];

        this.initElements();
        this.bindEvents();
        this.startAI();
        this.loop();
    }

    initElements() {
        const existing = this.doc.getElementById('stickman-entity');
        if (existing) existing.remove();

        this.wrapper = this.doc.createElement('div');
        this.wrapper.id = 'stickman-entity';
        Object.assign(this.wrapper.style, {
            position: 'fixed',
            left: `${this.x}px`,
            top: `${this.y}px`,
            width: '70px',
            height: '70px',
            zIndex: '999999',
            userSelect: 'none',
            cursor: 'grab'
        });

        this.speechBubble = this.doc.createElement('div');
        Object.assign(this.speechBubble.style, {
            position: 'absolute',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffffff',
            color: '#111111',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'none',
            pointerEvents: 'none'
        });

        this.img = this.doc.createElement('img');
        this.img.src = this.spriteSrc;
        Object.assign(this.img.style, {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            transition: 'transform 0.1s'
        });

        this.wrapper.appendChild(this.speechBubble);
        this.wrapper.appendChild(this.img);
        this.doc.body.appendChild(this.wrapper);
    }

    bindEvents() {
        this.wrapper.addEventListener('mousedown', () => {
            this.isDragging = true;
            this.wrapper.style.cursor = 'grabbing';
            this.say("Whoa! Put me down!");
        });

        this.win.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.wrapper.style.cursor = 'grab';
                this.vy = 0;
            }
        });

        this.win.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            if (this.isDragging) {
                this.x = e.clientX - 35;
                this.y = e.clientY - 35;
            }
        });
    }

    say(text) {
        if (!this.config.curious) return;
        this.speechBubble.textContent = text;
        this.speechBubble.style.display = 'block';
        clearTimeout(this.speechTimeout);
        this.speechTimeout = setTimeout(() => {
            this.speechBubble.style.display = 'none';
        }, 2500);
    }

    startAI() {
        this.aiInterval = setInterval(() => {
            if (!this.running || this.isDragging) return;

            const action = Math.random();
            const speed = Number(this.config.speed);

            if (this.config.vision && action < 0.35) {
                const diff = this.mouseX - 35 - this.x;
                this.vx = Math.abs(diff) > 15 ? Math.sign(diff) * speed : 0;
            } else if (action < 0.65) {
                this.vx = (Math.random() < 0.5 ? -1 : 1) * speed;
            } else {
                this.vx = 0;
            }

            if (this.config.happy && Math.random() < 0.3 && this.isGrounded()) {
                this.vy = -Number(this.config.jump);
            }

            if (this.config.curious && Math.random() < 0.25) {
                const randomPhrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
                this.say(randomPhrase);
            }
        }, 1800);
    }

    isGrounded() {
        return this.y >= this.win.innerHeight - 75;
    }

    destroy() {
        this.running = false;
        clearInterval(this.aiInterval);
        if (this.wrapper) this.wrapper.remove();
    }

    loop() {
        if (!this.running) return;

        const activatedAt = parseInt(localStorage.getItem('stickman_activated_at') || '0', 10);
        const remaining = this.LIFESPAN_MS - (Date.now() - activatedAt);

        if (remaining <= 0) {
            this.destroy();
            if (this.onExpire) this.onExpire();
            return;
        }

        if (!this.isDragging) {
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;

            const floor = this.win.innerHeight - 75;
            if (this.y >= floor) {
                this.y = floor;
                this.vy = 0;
            }

            if (this.x <= 0) {
                this.x = 0;
                this.vx *= -1;
            } else if (this.x >= this.win.innerWidth - 70) {
                this.x = this.win.innerWidth - 70;
                this.vx *= -1;
            }

            if (this.vx < 0) this.img.style.transform = 'scaleX(-1)';
            if (this.vx > 0) this.img.style.transform = 'scaleX(1)';
        }

        this.wrapper.style.left = `${this.x}px`;
        this.wrapper.style.top = `${this.y}px`;
        this.win.requestAnimationFrame(() => this.loop());
    }
}
