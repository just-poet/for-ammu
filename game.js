/* ============================================
   PIXEL ART GAME ENGINE
   Retro 2D Love Story
   ============================================ */

// Virtual resolution (everything drawn at this size, then scaled up = pixelated!)
const VW = 384;
const VH = 216;

class Game {
    constructor() {
        // Display canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Offscreen canvas at virtual resolution
        this.off = document.createElement('canvas');
        this.off.width = VW;
        this.off.height = VH;
        this.oc = this.off.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Game state
        this.state = 'INTRO';
        this.walking = false;
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.bgOffset = 0;
        this.animTime = 0;
        this.stateTime = 0;
        this.walkDone = false;

        // Fade
        this.fadeAlpha = 0;
        this.fading = false;
        this.fadingIn = false;
        this.fadeCb = null;

        // DOM dialogue
        this.dBox = document.getElementById('dialogue-box');
        this.dSpeaker = document.getElementById('dialogue-speaker');
        this.dText = document.getElementById('dialogue-text');
        this.dChoices = document.getElementById('dialogue-choices');
        this.dContinue = document.getElementById('dialogue-continue');
        this.typeInterval = null;

        // Scene queue
        this.scenes = [
            'WALK_CITY', 'DATE_ASK',
            'WALK_BOOKSHOP', 'BOOKSHOP_ASK',
            'WALK_GARDEN', 'FLOWER_GIVE',
            'WALK_BEACH', 'BEACH_TEA',
            'WALK_NIGHT', 'ROMANTIC_MSG',
            'HUG', 'PROPOSAL',
            'PRE_FINALE', 'FINALE'
        ];
        this.si = -1;

        // Intro stars
        this.createIntroStars();

        // Background Music
        this.bgMusic = document.getElementById('bg-music');
        this.musicPlaying = false;
        if (this.bgMusic) {
            this.bgMusic.addEventListener('ended', () => {
                this.bgMusic.currentTime = 90;
                this.bgMusic.play().catch(() => {});
            });
        }
        const onFirstInteract = () => {
            if (this.state !== 'INTRO' && this.bgMusic && this.bgMusic.paused) {
                this.playMusic();
            }
        };
        window.addEventListener('click', onFirstInteract);
        window.addEventListener('keydown', onFirstInteract);

        // Start loop
        this.last = 0;
        requestAnimationFrame(t => this.loop(t));
    }

    createIntroStars() {
        const c = document.getElementById('intro-stars');
        for (let i = 0; i < 60; i++) {
            const s = document.createElement('div');
            s.className = 'intro-star';
            s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;animation-delay:${Math.random()*3}s;animation-duration:${1.5+Math.random()*2}s`;
            c.appendChild(s);
        }
    }

    resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const s = Math.floor(Math.min(w / VW, h / VH));
        this.canvas.width = VW * s;
        this.canvas.height = VH * s;
        this.canvas.style.width = VW * s + 'px';
        this.canvas.style.height = VH * s + 'px';
        this.scale = s;
        this.ctx.imageSmoothingEnabled = false;
    }

    loop(t) {
        const dt = Math.min(t - this.last, 50);
        this.last = t;
        this.animTime += dt;
        this.stateTime += dt;
        this.update(dt);
        this.render();
        requestAnimationFrame(t2 => this.loop(t2));
    }

    // ============ UPDATE ============
    update(dt) {
        if (this.walking) {
            this.walkTimer += dt;
            if (this.walkTimer > 180) {
                this.walkFrame = (this.walkFrame + 1) % 4;
                this.walkTimer = 0;
            }
            this.bgOffset += dt * 0.06;
        }

        // Fade logic
        if (this.fading) {
            if (this.fadingIn) {
                this.fadeAlpha -= dt * 0.003;
                if (this.fadeAlpha <= 0) { this.fadeAlpha = 0; this.fading = false; }
            } else {
                this.fadeAlpha += dt * 0.003;
                if (this.fadeAlpha >= 1) {
                    this.fadeAlpha = 1;
                    this.fading = false;
                    if (this.fadeCb) { const cb = this.fadeCb; this.fadeCb = null; cb(); }
                }
            }
        }

        // Auto-advance walking scenes
        if (this.state.startsWith('WALK_') && !this.walkDone && this.stateTime > 3800) {
            this.walkDone = true;
            this.walking = false;
            this.walkFrame = 0;
            this.advance();
        }

        // Auto-advance hug scene
        if (this.state === 'HUG' && !this.walkDone && this.stateTime > 3500) {
            this.walkDone = true;
            this.advance();
        }
    }

    // ============ RENDER ============
    render() {
        const c = this.oc;
        c.clearRect(0, 0, VW, VH);

        // Draw scene background + characters
        switch (this.state) {
            case 'INTRO': break;
            case 'WALK_CITY': case 'DATE_ASK':
                this.drawCity(c); this.drawChars(c); break;
            case 'WALK_BOOKSHOP': case 'BOOKSHOP_ASK':
                this.drawBookshop(c); this.drawChars(c); break;
            case 'WALK_GARDEN': case 'FLOWER_GIVE':
                this.drawGarden(c); this.drawChars(c); break;
            case 'WALK_BEACH': case 'BEACH_TEA':
                this.drawBeach(c); this.drawChars(c); break;
            case 'WALK_NIGHT': case 'ROMANTIC_MSG':
                this.drawNight(c); this.drawChars(c); break;
            case 'HUG':
                this.drawNight(c); this.drawHugScene(c); break;
            case 'PROPOSAL':
                this.drawNight(c); this.drawProposalScene(c); break;
            case 'PRE_FINALE': case 'FINALE':
                this.drawNight(c); break;
        }

        // Walk label
        if (this.state.startsWith('WALK_') && this.stateTime > 400) {
            this.drawWalkLabel(c);
        }

        // Fade overlay
        if (this.fadeAlpha > 0) {
            c.fillStyle = `rgba(10,10,26,${this.fadeAlpha})`;
            c.fillRect(0, 0, VW, VH);
        }

        // Scale offscreen to display
        this.ctx.drawImage(this.off, 0, 0, this.canvas.width, this.canvas.height);
    }

    // ============ BACKGROUNDS ============

    drawCity(c) {
        const o = this.bgOffset;
        const gy = Math.floor(VH * 0.68);

        // 1. Crisp morning/day sky gradient
        this.gradient(c, 0, 0, VW, Math.floor(VH * 0.58), '#5aa8de', '#8ecced', '#f6e2c4', '#ffeedc');

        // 2. Soft drifting clouds with birds
        this.drawCloud(c, this.wrap(70 - o * 0.15, VW + 60, -60), 16, 46);
        this.drawCloud(c, this.wrap(210 - o * 0.12, VW + 50, -50), 28, 38);
        this.drawCloud(c, this.wrap(330 - o * 0.18, VW + 40, -40), 10, 32);

        // Birds in flight
        for (let i = 0; i < 3; i++) {
            const bx = this.wrap(140 + i * 80 - o * 0.25, VW + 20, -20);
            const by = 25 + Math.sin(this.animTime * 0.003 + i) * 6;
            this.drawBird(c, bx, by);
        }

        // 3. Parallax Layer 1: Distant City Skyline Silhouettes (o * 0.1)
        this.drawDistantSkyline(c, o * 0.1, gy);

        // 4. Parallax Layer 2: Charming European Townhouses (o * 0.4)
        const buildings = [
            { x: 0, w: 46, h: 58, t: 'brick', col: '#b05848', roof: '#48505c' },
            { x: 48, w: 34, h: 78, t: 'clock', col: '#d8cfc4', roof: '#3c6e68' },
            { x: 84, w: 52, h: 62, t: 'terrace', col: '#d4c4b0', roof: '#7c4838' },
            { x: 138, w: 44, h: 54, t: 'brick', col: '#9c4c40', roof: '#48505c' },
            { x: 184, w: 54, h: 68, t: 'terrace', col: '#c8baaa', roof: '#7c4838' },
            { x: 240, w: 34, h: 84, t: 'clock', col: '#d8cfc4', roof: '#3c6e68' },
            { x: 276, w: 46, h: 56, t: 'brick', col: '#b05848', roof: '#48505c' },
            { x: 324, w: 52, h: 64, t: 'terrace', col: '#d4c4b0', roof: '#7c4838' },
            { x: 378, w: 44, h: 52, t: 'brick', col: '#9c4c40', roof: '#48505c' }
        ];
        buildings.forEach(b => {
            const bx = this.wrap(b.x - o * 0.4, VW + 60, -60);
            if (b.t === 'clock') this.drawCityClockTower(c, bx, gy, b.w, b.h);
            else this.drawTownhouse(c, bx, gy, b.w, b.h, b);
        });

        // 5. Street Props: Trees & Gas Lamps (o * 0.7 & 0.8)
        [30, 150, 270, 370].forEach((tx, idx) => {
            const px = this.wrap(tx - o * 0.7, VW + 30, -30);
            this.drawCityTree(c, px, gy, idx);
        });
        [75, 195, 315].forEach(lx => {
            const px = this.wrap(lx - o * 0.8, VW + 20, -20);
            this.drawCityLamp(c, px, gy);
        });

        // Sidewalk Café table (scrolling past)
        const cafeX = this.wrap(115 - o * 0.7, VW + 40, -40);
        this.drawCafeTable(c, cafeX, gy);

        // Bicycle parked by a lamppost
        const bikeX = this.wrap(235 - o * 0.8, VW + 30, -30);
        this.drawBicycle(c, bikeX, gy);

        // 6. Textured Herringbone Sidewalk
        const swH = 6;
        c.fillStyle = '#d4cdc6';
        c.fillRect(0, gy, VW, swH);
        for (let x = Math.floor(-o * 0.85) % 10 - 10; x < VW; x += 10) {
            c.fillStyle = '#bab2aa';
            c.fillRect(x, gy, 1, swH);
            c.fillStyle = '#eae4dc';
            c.fillRect(x + 1, gy, 1, swH);
        }
        // Stone curb
        c.fillStyle = '#9e968e';
        c.fillRect(0, gy + swH - 1, VW, 1);
        c.fillStyle = '#7a746c';
        c.fillRect(0, gy + swH, VW, 1);

        // 7. Dark Asphalt Road with Yellow & White Markings
        const roadY = gy + swH + 1;
        c.fillStyle = '#2c2c34';
        c.fillRect(0, roadY, VW, VH - roadY);
        c.fillStyle = '#383842';
        for (let x = Math.floor(-o * 0.9) % 16 - 16; x < VW; x += 16) {
            c.fillRect(x + 4, roadY + 8, 2, 1);
            c.fillRect(x + 11, roadY + 18, 2, 1);
        }
        c.fillStyle = '#f2ce38';
        const dy = roadY + Math.floor((VH - roadY) / 2);
        for (let x = Math.floor(-o * 0.95) % 24 - 24; x < VW; x += 24) {
            c.fillRect(x, dy, 13, 2);
            c.fillStyle = '#c49a18';
            c.fillRect(x, dy + 2, 13, 1);
            c.fillStyle = '#f2ce38';
        }
        c.fillStyle = '#f2f0ec';
        c.fillRect(0, roadY, VW, 1);
    }

    drawTownhouse(c, x, gy, w, h, b) {
        c.fillStyle = b.col;
        c.fillRect(x, gy - h, w, h);
        c.fillStyle = 'rgba(0,0,0,0.12)';
        c.fillRect(x + w - 4, gy - h, 4, h);

        c.fillStyle = b.roof;
        c.fillRect(x - 2, gy - h - 3, w + 4, 4);
        c.fillRect(x + 2, gy - h - 6, w - 4, 3);

        c.fillStyle = '#8a4030';
        c.fillRect(x + 6, gy - h - 12, 6, 7);
        c.fillStyle = '#6a3020';
        c.fillRect(x + 5, gy - h - 13, 8, 2);

        const ww = 5, wh = 8, gap = 4;
        const cols = Math.floor((w - 6) / (ww + gap));
        const sx = x + Math.floor((w - cols * (ww + gap) + gap) / 2);
        const rows = Math.min(Math.floor((h - 18) / 15), 3);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const wx = sx + col * (ww + gap);
                const wy = gy - h + 10 + row * 15;
                c.fillStyle = '#3c4c38';
                c.fillRect(wx - 2, wy, 1, wh);
                c.fillRect(wx + ww + 1, wy, 1, wh);
                c.fillStyle = '#4a3828';
                c.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);
                c.fillStyle = '#fff4c8';
                c.fillRect(wx, wy, ww, wh);
                c.fillStyle = '#6a4828';
                c.fillRect(wx + 2, wy, 1, wh);
                c.fillRect(wx, wy + 4, ww, 1);
                if (row === rows - 1) {
                    c.fillStyle = '#5c3822';
                    c.fillRect(wx - 1, wy + wh + 1, ww + 2, 2);
                    c.fillStyle = '#ff6088';
                    c.fillRect(wx, wy + wh, 2, 1);
                    c.fillRect(wx + 3, wy + wh, 2, 1);
                }
            }
        }

        const dw = 10;
        const dx = x + Math.floor((w - dw) / 2);
        c.fillStyle = '#4a2c18';
        c.fillRect(dx, gy - 14, dw, 14);
        c.fillStyle = '#6a4028';
        c.fillRect(dx + 1, gy - 13, dw - 2, 13);
        c.fillStyle = '#f8d048';
        c.fillRect(dx + dw - 3, gy - 7, 2, 2);
    }

    drawCityClockTower(c, x, gy, w, h) {
        c.fillStyle = '#dcd4ca';
        c.fillRect(x, gy - h, w, h);
        c.fillStyle = '#c4bcb2';
        c.fillRect(x + w - 3, gy - h, 3, h);

        c.fillStyle = '#8a7868';
        c.fillRect(x - 2, gy - h, w + 4, 3);
        c.fillRect(x - 2, gy - h + 24, w + 4, 2);

        const tip = 20;
        for (let i = 0; i < tip; i++) {
            const lw = Math.max(1, Math.floor(w * (1 - i / tip)));
            c.fillStyle = (i > 14) ? '#3c7870' : '#4a8a80';
            c.fillRect(x + (w - lw) / 2, gy - h - tip + i, lw, 1);
        }
        c.fillStyle = '#f8d048';
        c.fillRect(x + Math.floor(w / 2), gy - h - tip - 4, 1, 4);
        c.fillRect(x + Math.floor(w / 2) - 2, gy - h - tip - 3, 5, 1);

        const cx = x + Math.floor(w / 2);
        const cy = gy - h + 12;
        c.fillStyle = '#4a3828';
        this.drawCircle(c, cx, cy, 7);
        c.fillStyle = '#fff9e8';
        this.drawCircle(c, cx, cy, 6);
        c.fillStyle = '#2a1a10';
        c.fillRect(cx, cy - 4, 1, 4);
        const minTick = Math.floor(this.animTime / 1000) % 4;
        const minDx = (minTick === 1) ? 3 : (minTick === 3) ? -3 : 0;
        const minDy = (minTick === 0) ? -4 : (minTick === 2) ? 4 : 0;
        c.fillRect(cx, cy, 1 + minDx, 1 + minDy);

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const wx = x + 4 + col * Math.floor(w / 2 - 2);
                const wy = gy - h + 28 + row * 16;
                c.fillStyle = '#4a3828';
                c.fillRect(wx - 1, wy - 1, 7, 11);
                c.fillStyle = '#ffeaa0';
                c.fillRect(wx, wy, 5, 9);
                c.fillStyle = '#6a4828';
                c.fillRect(wx + 2, wy, 1, 9);
            }
        }
    }

    drawCityTree(c, x, gy, idx) {
        c.fillStyle = '#6a4428';
        c.fillRect(x + 1, gy - 6, 12, 6);
        c.fillStyle = '#8a5c36';
        c.fillRect(x + 2, gy - 5, 10, 4);
        c.fillStyle = '#5c3e28';
        c.fillRect(x + 6, gy - 20, 3, 15);
        const isAutumn = (idx % 2 === 1);
        const mainCol = isAutumn ? '#e07828' : '#388838';
        const shadowCol = isAutumn ? '#a84c18' : '#266426';
        const highlightCol = isAutumn ? '#f8b048' : '#52a852';

        c.fillStyle = shadowCol;
        this.drawCircle(c, x + 7, gy - 24, 10);
        c.fillStyle = mainCol;
        this.drawCircle(c, x + 6, gy - 26, 9);
        c.fillStyle = highlightCol;
        this.drawCircle(c, x + 4, gy - 28, 5);
    }

    drawCityLamp(c, x, gy) {
        c.fillStyle = '#262c32';
        c.fillRect(x + 2, gy - 34, 2, 34);
        c.fillRect(x, gy - 3, 6, 3);
        c.fillRect(x - 2, gy - 32, 2, 2);
        c.fillRect(x + 4, gy - 32, 2, 2);
        c.fillRect(x, gy - 38, 6, 4);
        c.fillRect(x + 1, gy - 40, 4, 2);
        c.fillStyle = '#ffea78';
        c.fillRect(x + 1, gy - 37, 4, 3);
        c.fillStyle = 'rgba(255, 230, 120, 0.1)';
        for (let r = 12; r > 0; r -= 3) {
            c.fillRect(x + 3 - r, gy - 36 - r, r * 2, r * 2);
        }
    }

    drawCafeTable(c, x, gy) {
        c.fillStyle = '#3a3a42';
        c.fillRect(x + 5, gy - 10, 2, 10);
        c.fillRect(x + 3, gy - 2, 6, 2);
        c.fillStyle = '#e03030';
        c.fillRect(x + 1, gy - 13, 10, 3);
        c.fillStyle = '#f0f0f0';
        c.fillRect(x + 2, gy - 13, 2, 2);
        c.fillRect(x + 6, gy - 13, 2, 2);
        c.fillStyle = '#ffffff';
        c.fillRect(x + 4, gy - 15, 3, 2);
        if (Math.sin(this.animTime * 0.005) > 0) {
            c.fillStyle = 'rgba(255,255,255,0.6)';
            c.fillRect(x + 5, gy - 17, 1, 2);
        }
        c.fillStyle = '#4a4a54';
        c.fillRect(x - 3, gy - 8, 3, 8);
        c.fillRect(x - 3, gy - 14, 1, 6);
        c.fillRect(x + 12, gy - 8, 3, 8);
        c.fillRect(x + 14, gy - 14, 1, 6);
    }

    drawBicycle(c, x, gy) {
        c.fillStyle = '#4a4a52';
        this.drawCircle(c, x + 2, gy - 4, 4);
        this.drawCircle(c, x + 14, gy - 4, 4);
        c.fillStyle = '#d4cdc6';
        c.fillRect(x + 2, gy - 4, 1, 1);
        c.fillRect(x + 14, gy - 4, 1, 1);
        c.fillStyle = '#20a898';
        c.fillRect(x + 3, gy - 6, 6, 1);
        c.fillRect(x + 8, gy - 9, 1, 5);
        c.fillRect(x + 8, gy - 6, 6, 1);
        c.fillRect(x + 13, gy - 10, 1, 6);
        c.fillStyle = '#6a4028';
        c.fillRect(x + 7, gy - 10, 3, 1);
        c.fillStyle = '#262c32';
        c.fillRect(x + 12, gy - 11, 3, 1);
        c.fillStyle = '#baa088';
        c.fillRect(x + 14, gy - 10, 3, 3);
        c.fillStyle = '#ff6090';
        c.fillRect(x + 14, gy - 11, 3, 1);
    }

    drawDistantSkyline(c, offset, gy) {
        const blds = [
            { x: 0, w: 32, h: 42, t: 'spire' },
            { x: 34, w: 26, h: 32, t: 'flat' },
            { x: 62, w: 40, h: 48, t: 'dome' },
            { x: 104, w: 28, h: 36, t: 'flat' },
            { x: 134, w: 36, h: 54, t: 'spire' },
            { x: 172, w: 30, h: 38, t: 'flat' },
            { x: 204, w: 42, h: 46, t: 'dome' },
            { x: 248, w: 32, h: 40, t: 'flat' },
            { x: 282, w: 36, h: 56, t: 'spire' },
            { x: 320, w: 30, h: 34, t: 'flat' },
            { x: 352, w: 40, h: 44, t: 'dome' }
        ];
        c.fillStyle = '#7a9ca8';
        blds.forEach(b => {
            const bx = this.wrap(b.x - offset, VW + 50, -50);
            c.fillRect(bx, gy - b.h, b.w, b.h);
            if (b.t === 'spire') {
                for (let i = 0; i < 14; i++) {
                    const sw = Math.max(1, Math.floor(b.w * (1 - i / 14)));
                    c.fillRect(bx + (b.w - sw) / 2, gy - b.h - i, sw, 1);
                }
            } else if (b.t === 'dome') {
                this.drawCircle(c, bx + Math.floor(b.w / 2), gy - b.h, Math.floor(b.w / 2));
            }
        });
    }

    drawBird(c, x, y) {
        const flap = Math.floor(this.animTime / 180) % 2;
        c.fillStyle = '#3a5068';
        if (flap === 0) {
            c.fillRect(x - 2, y - 1, 1, 1);
            c.fillRect(x - 1, y, 1, 1);
            c.fillRect(x, y + 1, 1, 1);
            c.fillRect(x + 1, y, 1, 1);
            c.fillRect(x + 2, y - 1, 1, 1);
        } else {
            c.fillRect(x - 2, y + 1, 1, 1);
            c.fillRect(x - 1, y, 1, 1);
            c.fillRect(x, y, 1, 1);
            c.fillRect(x + 1, y, 1, 1);
            c.fillRect(x + 2, y + 1, 1, 1);
        }
    }

    drawBookshop(c) {
        this.drawCity(c);
        const gy = Math.floor(VH * 0.68);
        let bx;
        if (this.state === 'WALK_BOOKSHOP') {
            const t = Math.min(1, this.stateTime / 3200);
            const ease = 1 - Math.pow(1 - t, 3);
            const startX = VW + 85;
            const targetX = Math.floor(VW / 2 - 55);
            bx = Math.round(startX + (targetX - startX) * ease);
        } else {
            bx = Math.floor(VW / 2 - 55);
        }
        const bw = 110, bh = 66;

        // 1. Building facade - Charming dark timber & warm cream brick
        c.fillStyle = '#f2e8dc';
        c.fillRect(bx, gy - bh, bw, bh);
        c.fillStyle = '#dcd0c2';
        c.fillRect(bx + bw - 4, gy - bh, 4, bh);

        // 2. Slate mansard roof with chimney
        c.fillStyle = '#48505c';
        c.fillRect(bx - 3, gy - bh - 6, bw + 6, 7);
        c.fillStyle = '#363c46';
        c.fillRect(bx - 4, gy - bh - 7, bw + 8, 2);
        // Roof dormer window
        c.fillStyle = '#f2e8dc';
        c.fillRect(bx + bw / 2 - 8, gy - bh - 12, 16, 8);
        c.fillStyle = '#48505c';
        c.fillRect(bx + bw / 2 - 10, gy - bh - 14, 20, 3);
        c.fillStyle = '#ffeaa0';
        c.fillRect(bx + bw / 2 - 5, gy - bh - 10, 10, 5);
        c.fillStyle = '#6d482c';
        c.fillRect(bx + bw / 2 - 1, gy - bh - 10, 1, 5);

        // Brick chimney on the roof with puffing smoke!
        c.fillStyle = '#9e4c3c';
        c.fillRect(bx + 10, gy - bh - 18, 8, 13);
        c.fillStyle = '#7a3428';
        c.fillRect(bx + 9, gy - bh - 19, 10, 2);
        for (let s = 0; s < 3; s++) {
            const st = (this.animTime * 0.003 + s * 1.5) % 4;
            const sx = bx + 13 + Math.sin(st * 2) * 4;
            const sy = gy - bh - 22 - st * 7;
            const sa = Math.max(0, 1 - st / 4);
            c.fillStyle = `rgba(255,255,255,${sa * 0.55})`;
            this.drawCircle(c, Math.floor(sx), Math.floor(sy), Math.floor(2 + st));
        }

        // 3. Vintage Storefront: Emerald green timber & gold
        const sfH = 38;
        c.fillStyle = '#1c3d36';
        c.fillRect(bx, gy - sfH, bw, sfH);
        c.fillStyle = '#26544a';
        c.fillRect(bx + 2, gy - sfH + 2, bw - 4, 3);

        // Ornate Gold Signboard
        c.fillStyle = '#142c26';
        c.fillRect(bx + 10, gy - sfH + 5, bw - 20, 11);
        c.fillStyle = '#f4cb48';
        c.fillRect(bx + 11, gy - sfH + 6, bw - 22, 9);
        c.fillStyle = '#1c3d36';
        c.fillRect(bx + 13, gy - sfH + 8, bw - 26, 5);
        this.drawTinyText(c, 'POOKIE BOOKS', bx + bw / 2, gy - sfH + 9, '#f8d860', true);

        // 4. Twin Large Arched Display Windows packed with books
        this.drawBookWindow(c, bx + 6, gy - 21, 34, 18, ['#c82030', '#2068c8', '#288838', '#d08020', '#783098', '#d03068']);
        this.drawBookWindow(c, bx + bw - 40, gy - 21, 34, 18, ['#e03030', '#009088', '#3848b8', '#e07018', '#b82060', '#308040']);

        // Flower boxes under each window
        [bx + 6, bx + bw - 40].forEach(fx => {
            c.fillStyle = '#5c3a22';
            c.fillRect(fx, gy - 2, 34, 3);
            c.fillStyle = '#2a6828';
            c.fillRect(fx + 1, gy - 4, 32, 2);
            const fc = ['#ff5080', '#f8d030', '#e82040', '#ff80a0', '#70c8f8'];
            for (let p = 0; p < 6; p++) {
                c.fillStyle = fc[p % fc.length];
                c.fillRect(fx + 3 + p * 5, gy - 4, 3, 2);
            }
        });

        // 5. Store Entrance: Cozy Wooden Door with brass knob & OPEN sign
        const dx = bx + bw / 2 - 8;
        c.fillStyle = '#5a3822';
        c.fillRect(dx, gy - 22, 16, 22);
        c.fillStyle = '#442614';
        c.fillRect(dx + 2, gy - 20, 12, 20);
        c.fillStyle = '#ffeaa0';
        c.fillRect(dx + 3, gy - 18, 10, 8);
        c.fillStyle = '#5a3822';
        c.fillRect(dx + 7, gy - 18, 1, 8);
        c.fillRect(dx + 3, gy - 14, 10, 1);
        c.fillStyle = '#f8d048';
        c.fillRect(dx + 12, gy - 8, 2, 3);
        c.fillStyle = '#288838';
        c.fillRect(dx + 4, gy - 9, 8, 4);
        c.fillStyle = '#ffffff';
        c.fillRect(dx + 5, gy - 8, 6, 2);

        // 6. Sidewalk Book Cart outside the shop!
        this.drawOutdoorBookCart(c, bx - 14, gy);
    }

    drawOutdoorBookCart(c, x, gy) {
        c.fillStyle = '#6d4828';
        c.fillRect(x, gy - 12, 12, 8);
        c.fillStyle = '#8a5c36';
        c.fillRect(x + 1, gy - 11, 10, 6);
        c.fillStyle = '#3a2414';
        this.drawCircle(c, x + 2, gy - 2, 3);
        this.drawCircle(c, x + 10, gy - 2, 3);
        c.fillStyle = '#baa088';
        c.fillRect(x + 2, gy - 2, 1, 1);
        c.fillRect(x + 10, gy - 2, 1, 1);
        const bcols = ['#d03030', '#2060c0', '#288838', '#e08020'];
        bcols.forEach((col, i) => {
            c.fillStyle = col;
            c.fillRect(x + 2 + i * 2, gy - 14, 2, 5);
        });
        c.fillStyle = '#e84040';
        c.fillRect(x - 2, gy - 17, 16, 2);
        c.fillStyle = '#f0f0f0';
        c.fillRect(x + 2, gy - 17, 4, 2);
        c.fillRect(x + 10, gy - 17, 4, 2);
    }

    drawBookWindow(c, x, y, w, h, colors) {
        c.fillStyle = '#0f2420';
        c.fillRect(x, y, w, h);
        c.fillStyle = '#fff4c8';
        c.fillRect(x + 2, y + 2, w - 4, h - 4);
        c.fillStyle = 'rgba(255, 220, 120, 0.35)';
        c.fillRect(x + 2, y + 2, w - 4, h - 4);

        c.fillStyle = '#6a4428';
        c.fillRect(x + 3, y + 7, w - 6, 2);
        c.fillRect(x + 3, y + h - 3, w - 6, 2);

        colors.forEach((col, i) => {
            c.fillStyle = col;
            const bh = 6 + (i % 3) * 2;
            c.fillRect(x + 4 + i * 5, y + h - 3 - bh, 3, bh);
            c.fillStyle = '#ffd54f';
            c.fillRect(x + 4 + i * 5, y + h - 2 - bh, 3, 1);
        });

        colors.slice().reverse().forEach((col, i) => {
            c.fillStyle = col;
            c.fillRect(x + 4 + i * 5, y + 7 - 5, 3, 5);
        });

        const ox = x + Math.floor(w / 2) - 4;
        c.fillStyle = '#6a4428';
        c.fillRect(ox + 3, y + 9, 2, 5);
        c.fillStyle = '#ffffff';
        c.fillRect(ox, y + 8, 4, 3);
        c.fillRect(ox + 4, y + 8, 4, 3);
        c.fillStyle = '#3a2414';
        c.fillRect(ox + 1, y + 9, 2, 1);
        c.fillRect(ox + 5, y + 9, 2, 1);
    }

    drawGarden(c) {
        const o = this.bgOffset;
        const gy = Math.floor(VH * 0.68);

        // 1. Warm pastel morning sky
        this.gradient(c, 0, 0, VW, Math.floor(VH * 0.55), '#5caae0', '#8ed4ea', '#f8d2a6', '#ffead0');

        // 2. Soft drifting clouds with peach undertones
        this.drawGardenCloud(c, this.wrap(40 - o * 0.08, VW + 60, -60), 10, 48);
        this.drawGardenCloud(c, this.wrap(190 - o * 0.06, VW + 50, -50), 22, 38);
        this.drawGardenCloud(c, this.wrap(320 - o * 0.1, VW + 40, -40), 8, 30);

        // 3. Gentle diagonal golden sunbeams
        c.fillStyle = 'rgba(255, 245, 190, 0.05)';
        for (let i = 0; i < 3; i++) {
            const sx = 140 + i * 85;
            for (let y = 0; y < gy; y += 2) {
                const rx = sx - Math.floor(y * 0.6);
                c.fillRect(rx, y, 24, 2);
            }
        }

        // 4. Parallax Layer 1: Distant hazy blue-teal mountains
        c.fillStyle = '#628e98';
        for (let x = 0; x < VW; x++) {
            const my = Math.floor(VH * 0.40 + Math.sin((x + o * 0.06) * 0.012) * 14 + Math.sin((x + o * 0.06) * 0.03) * 6);
            c.fillRect(x, my, 1, gy - my);
        }

        // 5. Parallax Layer 2: Mid-ground rolling green hills & blooming trees
        c.fillStyle = '#468650';
        for (let x = 0; x < VW; x++) {
            const hy = Math.floor(VH * 0.48 + Math.sin((x + o * 0.18) * 0.02) * 9 + Math.sin((x + o * 0.18) * 0.05) * 4);
            c.fillRect(x, hy, 1, gy - hy);
        }
        [15, 75, 135, 195, 255, 315, 375].forEach((tx, idx) => {
            const px = this.wrap(tx - o * 0.18, VW + 30, -30);
            const ty = Math.floor(VH * 0.46 + Math.sin(tx * 0.02) * 6);
            const isCherry = (idx % 3 === 0);
            const isJacaranda = (idx % 3 === 2);
            const treeColor = isCherry ? '#f098aa' : isJacaranda ? '#b89ad6' : '#5ca866';
            const shadowColor = isCherry ? '#cc6e82' : isJacaranda ? '#8e70ae' : '#3c7844';

            c.fillStyle = shadowColor;
            this.drawCircle(c, px, ty, 13);
            c.fillStyle = treeColor;
            this.drawCircle(c, px - 1, ty - 2, 11);
            c.fillStyle = 'rgba(255,255,255,0.25)';
            this.drawCircle(c, px - 3, ty - 4, 6);
            c.fillStyle = '#5c3e2a';
            c.fillRect(px - 2, ty + 9, 4, gy - (ty + 9));
        });

        // 6. Parallax Layer 3: White garden balustrade with climbing roses
        const fenceY = gy - 20;
        c.fillStyle = '#f2ece4';
        c.fillRect(0, fenceY, VW, 2);
        c.fillRect(0, fenceY + 14, VW, 2);
        for (let x = Math.floor(-o * 0.45) % 12 - 12; x < VW; x += 12) {
            c.fillStyle = '#f2ece4';
            c.fillRect(x + 2, fenceY - 2, 3, 18);
            c.fillRect(x + 3, fenceY - 4, 1, 2);
            c.fillStyle = '#d4ccc2';
            c.fillRect(x + 4, fenceY - 2, 1, 18);
        }
        for (let x = Math.floor(-o * 0.45) % 36 - 36; x < VW; x += 36) {
            c.fillStyle = '#266426';
            c.fillRect(x + 5, fenceY - 3, 8, 7);
            c.fillRect(x + 8, fenceY + 2, 10, 8);
            c.fillStyle = '#388836';
            c.fillRect(x + 7, fenceY - 2, 5, 4);
            c.fillStyle = '#e82050';
            c.fillRect(x + 6, fenceY - 1, 3, 3);
            c.fillRect(x + 13, fenceY + 4, 3, 3);
            c.fillStyle = '#ff7090';
            c.fillRect(x + 7, fenceY, 1, 1);
            c.fillRect(x + 14, fenceY + 5, 1, 1);
        }

        // 7. Garden props scrolling during walk
        const lx = this.wrap(60 - o * 0.7, VW + 30, -30);
        this.drawGardenLamppost(c, lx, gy);

        const fx = this.wrap(250 - o * 0.7, VW + 50, -50);
        this.drawStoneFountain(c, fx, gy);

        // 8. The Destination: Grand Jasmine Pergola / Gazebo
        let ax;
        if (this.state === 'WALK_GARDEN') {
            const t = Math.min(1, this.stateTime / 3200);
            const ease = 1 - Math.pow(1 - t, 3);
            const startX = VW + 90;
            const targetX = Math.floor(VW / 2 - 52);
            ax = Math.round(startX + (targetX - startX) * ease);
        } else {
            ax = Math.floor(VW / 2 - 52);
        }
        this.drawGrandJasmineArbor(c, ax, gy);

        // 9. Ground layer: Sandstone cobblestone promenade walkway
        const pathH = 14;
        c.fillStyle = '#d2c4a4';
        c.fillRect(0, gy, VW, pathH);
        for (let r = 0; r < 3; r++) {
            const rowY = gy + r * 5;
            const shift = (r % 2 === 0) ? 0 : 7;
            for (let x = Math.floor(-o * 0.7 + shift) % 15 - 15; x < VW; x += 15) {
                c.fillStyle = '#a49474';
                c.fillRect(x, rowY, 1, 5);
                c.fillRect(x, rowY + 4, 15, 1);
                c.fillStyle = '#e8dcc4';
                c.fillRect(x + 1, rowY, 13, 1);
                c.fillRect(x + 1, rowY + 1, 1, 3);
                if ((x * 7 + r * 13) % 5 === 0) {
                    c.fillStyle = '#488838';
                    c.fillRect(x, rowY + 3, 2, 2);
                }
            }
        }
        c.fillStyle = '#8a765c';
        c.fillRect(0, gy, VW, 1);
        c.fillRect(0, gy + pathH, VW, 1);

        // 10. Flowerbeds along bottom of the path
        c.fillStyle = '#367c36';
        c.fillRect(0, gy + pathH + 1, VW, VH - gy - pathH - 1);
        c.fillStyle = '#286028';
        c.fillRect(0, gy + pathH + 8, VW, VH - gy - pathH - 8);

        const flowers = [
            { t: 'hydrangea', col: '#68a8f0', c2: '#98c8f8' },
            { t: 'rose', col: '#e82850', c2: '#ff6888' },
            { t: 'lavender', col: '#8050b0', c2: '#b088e0' },
            { t: 'sunflower', col: '#f8b820', c2: '#684010' },
            { t: 'pinkrose', col: '#ff5888', c2: '#ffa0b8' }
        ];
        for (let i = 0; i < 18; i++) {
            const px = this.wrap(i * 26 + 10 - o * 0.7, VW + 20, -20);
            const fl = flowers[i % flowers.length];
            this.drawGardenFlowerCluster(c, px, gy + pathH + 2, fl);
        }

        // 11. Living details: Butterflies and floating flower petals
        this.drawGardenButterflies(c);
        this.drawFloatingPetals(c);
    }

    drawGardenCloud(c, x, y, w) {
        const h = Math.floor(w * 0.32);
        c.fillStyle = 'rgba(255, 220, 200, 0.45)';
        c.fillRect(x, y + h - 2, w, 4);
        c.fillStyle = 'rgba(255, 255, 255, 0.9)';
        c.fillRect(x, y, w, h);
        c.fillRect(x + Math.floor(w * 0.15), y - Math.floor(h * 0.55), Math.floor(w * 0.35), Math.floor(h * 0.55));
        c.fillRect(x + Math.floor(w * 0.42), y - Math.floor(h * 0.35), Math.floor(w * 0.32), Math.floor(h * 0.35));
    }

    drawGardenFlowerCluster(c, x, y, fl) {
        c.fillStyle = '#225822';
        c.fillRect(x + 2, y + 2, 2, 7);
        c.fillRect(x + 6, y + 3, 2, 6);
        c.fillStyle = '#327c32';
        c.fillRect(x, y + 4, 3, 2);
        c.fillRect(x + 7, y + 4, 3, 2);

        if (fl.t === 'lavender') {
            c.fillStyle = fl.col;
            c.fillRect(x + 2, y - 4, 2, 7);
            c.fillRect(x + 6, y - 3, 2, 6);
            c.fillStyle = fl.c2;
            c.fillRect(x + 2, y - 4, 1, 5);
            c.fillRect(x + 6, y - 3, 1, 4);
        } else if (fl.t === 'hydrangea') {
            c.fillStyle = fl.col;
            this.drawCircle(c, x + 5, y - 1, 4);
            c.fillStyle = fl.c2;
            c.fillRect(x + 3, y - 3, 2, 2);
            c.fillRect(x + 6, y - 2, 2, 2);
        } else if (fl.t === 'sunflower') {
            c.fillStyle = fl.col;
            this.drawCircle(c, x + 5, y - 1, 4);
            c.fillStyle = fl.c2;
            c.fillRect(x + 4, y - 2, 2, 2);
        } else {
            c.fillStyle = fl.col;
            c.fillRect(x + 1, y - 3, 5, 5);
            c.fillRect(x + 2, y - 4, 3, 7);
            c.fillStyle = fl.c2;
            c.fillRect(x + 2, y - 2, 2, 2);
            c.fillStyle = '#fff';
            c.fillRect(x + 3, y - 2, 1, 1);
        }
    }

    drawGardenLamppost(c, x, gy) {
        c.fillStyle = '#2a3036';
        c.fillRect(x + 2, gy - 36, 2, 36);
        c.fillRect(x, gy - 3, 6, 3);
        c.fillRect(x - 5, gy - 30, 16, 2);
        // Left basket
        c.fillStyle = '#6d4c38';
        c.fillRect(x - 6, gy - 27, 4, 3);
        c.fillStyle = '#ff6090';
        c.fillRect(x - 7, gy - 28, 6, 2);
        c.fillRect(x - 6, gy - 26, 4, 3);
        c.fillStyle = '#2a6828';
        c.fillRect(x - 7, gy - 25, 2, 2);
        // Right basket
        c.fillStyle = '#6d4c38';
        c.fillRect(x + 8, gy - 27, 4, 3);
        c.fillStyle = '#e82060';
        c.fillRect(x + 7, gy - 28, 6, 2);
        c.fillRect(x + 8, gy - 26, 4, 3);
        c.fillStyle = '#2a6828';
        c.fillRect(x + 11, gy - 25, 2, 2);
        // Lantern head
        c.fillStyle = '#2a3036';
        c.fillRect(x, gy - 40, 6, 4);
        c.fillRect(x + 1, gy - 42, 4, 2);
        c.fillStyle = '#fce480';
        c.fillRect(x + 1, gy - 39, 4, 3);
        c.fillStyle = 'rgba(252, 228, 128, 0.12)';
        for (let r = 8; r > 0; r -= 2) {
            c.fillRect(x + 3 - r, gy - 38 - r, r * 2, r * 2);
        }
    }

    drawStoneFountain(c, x, gy) {
        c.fillStyle = '#baa896';
        c.fillRect(x - 14, gy - 8, 28, 8);
        c.fillStyle = '#8c7c6c';
        c.fillRect(x - 13, gy - 7, 26, 7);
        c.fillStyle = '#68c0e8';
        c.fillRect(x - 12, gy - 6, 24, 5);
        c.fillStyle = '#9ae0f8';
        c.fillRect(x - 10, gy - 5, 20, 2);

        c.fillStyle = '#baa896';
        c.fillRect(x - 3, gy - 20, 6, 12);
        c.fillStyle = '#9c8c7c';
        c.fillRect(x + 1, gy - 20, 2, 12);

        c.fillStyle = '#baa896';
        c.fillRect(x - 8, gy - 24, 16, 4);
        c.fillStyle = '#9ae0f8';
        c.fillRect(x - 7, gy - 23, 14, 2);

        c.fillStyle = '#baa896';
        c.fillRect(x - 1, gy - 27, 2, 3);

        const sp = Math.sin(this.animTime * 0.015);
        c.fillStyle = 'rgba(220, 245, 255, 0.85)';
        c.fillRect(x - 1, gy - 28, 2, 4);
        c.fillRect(x - 8, gy - 20, 1, 13);
        c.fillRect(x + 7, gy - 20, 1, 13);
        if (sp > 0) {
            c.fillStyle = '#ffffff';
            c.fillRect(x - 9, gy - 9, 2, 2);
            c.fillRect(x + 7, gy - 9, 2, 2);
        }
    }

    drawGrandJasmineArbor(c, x, gy) {
        const w = 104, h = 68;
        const topY = gy - h;

        // Foundation
        c.fillStyle = '#c8baa8';
        c.fillRect(x - 4, gy - 4, w + 8, 4);
        c.fillStyle = '#a89a88';
        c.fillRect(x - 2, gy - 4, 1, 4);
        c.fillRect(x + w + 1, gy - 4, 1, 4);

        // Columns
        const cols = [x + 4, x + 28, x + w - 34, x + w - 10];
        cols.forEach((cx, idx) => {
            const cw = (idx === 0 || idx === 3) ? 6 : 5;
            c.fillStyle = '#f6f2ec';
            c.fillRect(cx, topY + 16, cw, h - 20);
            c.fillStyle = '#d4ccc2';
            c.fillRect(cx + cw - 2, topY + 16, 2, h - 20);
            c.fillStyle = '#eae4da';
            c.fillRect(cx - 1, topY + 14, cw + 2, 3);
            c.fillRect(cx - 1, gy - 6, cw + 2, 3);
        });

        // Trellis lattice panels
        [ { lx: x + 10, lw: 18 }, { lx: x + w - 29, lw: 19 } ].forEach(pan => {
            c.fillStyle = '#e4ded4';
            for (let ly = topY + 20; ly < gy - 6; ly += 6) {
                c.fillRect(pan.lx, ly, pan.lw, 1);
            }
            for (let lxx = pan.lx; lxx < pan.lx + pan.lw; lxx += 6) {
                c.fillRect(lxx, topY + 20, 1, gy - 6 - (topY + 20));
            }
            c.fillStyle = '#266826';
            for (let vy = topY + 22; vy < gy - 8; vy += 7) {
                c.fillRect(pan.lx + 2 + Math.sin(vy * 0.3) * 4, vy, 6, 4);
                c.fillRect(pan.lx + 9 + Math.cos(vy * 0.4) * 4, vy + 2, 5, 4);
            }
            for (let vy = topY + 23; vy < gy - 8; vy += 10) {
                this.drawSingleJasmine(c, pan.lx + 4 + Math.sin(vy * 0.3) * 4, vy);
                this.drawSingleJasmine(c, pan.lx + 11 + Math.cos(vy * 0.4) * 4, vy + 3);
            }
        });

        // Arched timber roof
        c.fillStyle = '#7d5e4a';
        c.fillRect(x - 2, topY + 12, w + 4, 4);
        for (let i = 0; i < w + 4; i++) {
            const rx = x - 2 + i;
            const norm = (i - (w + 4) / 2) / ((w + 4) / 2);
            const archH = Math.floor((1 - norm * norm) * 14);
            c.fillStyle = '#8d6e5a';
            c.fillRect(rx, topY + 12 - archH, 1, archH);
            c.fillStyle = '#f6f2ec';
            c.fillRect(rx, topY + 12 - archH, 1, 2);
        }
        c.fillStyle = '#f6f2ec';
        c.fillRect(x + Math.floor(w / 2) - 1, topY - 5, 3, 5);
        c.fillRect(x + Math.floor(w / 2), topY - 7, 1, 2);

        // Bench inside
        const bx = x + 36, bw = 32;
        c.fillStyle = '#8d6244';
        c.fillRect(bx, gy - 16, bw, 3);
        c.fillRect(bx, gy - 24, bw, 6);
        c.fillStyle = '#6d482c';
        c.fillRect(bx + 2, gy - 13, 2, 9);
        c.fillRect(bx + bw - 4, gy - 13, 2, 9);

        // Hanging lantern
        const lx = x + Math.floor(w / 2);
        c.fillStyle = '#5c4020';
        c.fillRect(lx, topY + 16, 1, 10);
        c.fillStyle = '#6d4c20';
        c.fillRect(lx - 3, topY + 26, 7, 7);
        c.fillStyle = '#ffea78';
        c.fillRect(lx - 2, topY + 27, 5, 5);
        c.fillStyle = 'rgba(255, 235, 120, 0.1)';
        for (let r = 16; r > 0; r -= 4) {
            c.fillRect(lx - r, topY + 29 - r, r * 2, r * 2);
        }

        // Jasmine garland across arch
        for (let i = 0; i < w; i += 8) {
            const gx = x + i;
            const gyOff = topY + 16 + Math.floor(Math.sin(i * 0.15) * 3);
            c.fillStyle = '#2a6c2a';
            c.fillRect(gx, gyOff, 7, 4);
            c.fillStyle = '#388838';
            c.fillRect(gx + 1, gyOff + 1, 5, 2);
            this.drawSingleJasmine(c, gx + 3, gyOff + 3);
        }
    }

    drawGardenButterflies(c) {
        const flap = Math.floor(this.animTime / 100) % 2;
        const ww = (flap === 0) ? 3 : 1;
        const gy = Math.floor(VH * 0.68);

        const b1x = 75 + Math.sin(this.animTime * 0.0025) * 45;
        const b1y = gy - 28 + Math.cos(this.animTime * 0.0035) * 12;
        this.drawSingleButterfly(c, b1x, b1y, ww, '#ff7818', '#2a1008');

        const b2x = 230 + Math.sin(this.animTime * 0.002 + 2) * 50;
        const b2y = gy - 32 + Math.cos(this.animTime * 0.003 + 1) * 14;
        this.drawSingleButterfly(c, b2x, b2y, ww, '#38d0f8', '#105878');

        const b3x = 150 + Math.cos(this.animTime * 0.0028 + 4) * 35;
        const b3y = gy - 42 + Math.sin(this.animTime * 0.0038 + 3) * 10;
        this.drawSingleButterfly(c, b3x, b3y, ww, '#fae030', '#786010');
    }

    drawSingleButterfly(c, x, y, ww, wingCol, bodyCol) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        c.fillStyle = bodyCol;
        c.fillRect(ix, iy, 1, 3);
        c.fillStyle = wingCol;
        c.fillRect(ix - ww, iy, ww, 2);
        c.fillRect(ix + 1, iy, ww, 2);
    }

    drawFloatingPetals(c) {
        for (let i = 0; i < 8; i++) {
            const px = (i * 51 + this.animTime * 0.035) % (VW + 20) - 10;
            const py = (i * 27 + Math.sin(this.animTime * 0.002 + i * 1.5) * 14 + this.animTime * 0.012) % (VH * 0.65) + 20;
            c.fillStyle = (i % 2 === 0) ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 180, 205, 0.85)';
            c.fillRect(Math.floor(px), Math.floor(py), 2, 2);
        }
    }

    drawJasmineGift(c, x, y) {
        c.fillStyle = '#2a6828';
        c.fillRect(x, y + 2, 2, 6);
        c.fillRect(x + 2, y + 1, 2, 2);
        c.fillRect(x - 2, y + 4, 2, 2);
        c.fillStyle = '#388c38';
        c.fillRect(x + 3, y + 2, 3, 2);
        c.fillRect(x - 4, y + 4, 3, 2);

        this.drawSingleJasmine(c, x + 2, y - 2);
        this.drawSingleJasmine(c, x - 2, y - 1);
        c.fillStyle = '#f0f8ff';
        c.fillRect(x + 1, y - 4, 2, 2);

        const t = this.animTime * 0.005;
        const sp = [
            { dx: -5, dy: -5, off: 0 },
            { dx: 7, dy: -3, off: 1.5 },
            { dx: 4, dy: 6, off: 3.0 },
            { dx: -4, dy: 4, off: 4.5 }
        ];
        sp.forEach(s => {
            const glow = Math.sin(t + s.off);
            if (glow > 0.2) {
                c.fillStyle = glow > 0.7 ? '#ffffff' : '#fff9c4';
                c.fillRect(x + s.dx, y + s.dy, 1, 1);
                if (glow > 0.8) {
                    c.fillRect(x + s.dx - 1, y + s.dy, 3, 1);
                    c.fillRect(x + s.dx, y + s.dy - 1, 1, 3);
                }
            }
        });

        for (let h = 0; h < 3; h++) {
            const ht = (t * 20 + h * 40) % 60;
            const hx = x + Math.sin(t + h * 2) * 6;
            const hy = y - 4 - ht * 0.35;
            const alpha = Math.max(0, 1 - ht / 60);
            c.fillStyle = `rgba(255,107,157,${alpha})`;
            c.fillRect(hx, hy, 1, 2);
            c.fillRect(hx + 2, hy, 1, 2);
            c.fillRect(hx + 1, hy, 1, 3);
            c.fillRect(hx + 1, hy + 3, 1, 1);
        }
    }

    drawSingleJasmine(c, x, y) {
        c.fillStyle = '#ffffff';
        c.fillRect(x - 2, y, 5, 1);
        c.fillRect(x, y - 2, 1, 5);
        c.fillRect(x - 1, y - 1, 3, 3);
        c.fillStyle = '#e8f4fc';
        c.fillRect(x - 2, y + 1, 1, 1);
        c.fillRect(x + 2, y + 1, 1, 1);
        c.fillStyle = '#f8d030';
        c.fillRect(x, y, 1, 1);
    }

    // ============ BEACH / MARINE DRIVE ============

    drawBeach(c) {
        const o = this.bgOffset;
        const gy = Math.floor(VH * 0.70);

        // 1. Spectacular Marine Drive sunset gradient
        this.gradient(c, 0, 0, VW, Math.floor(VH * 0.44), '#481848', '#8a2048', '#d04830', '#f47828', '#f8b838', '#fae488');

        // 2. Sunset clouds
        c.fillStyle = 'rgba(180, 50, 90, 0.45)';
        this.drawCloud(c, this.wrap(90 - o * 0.08, VW + 60, -60), 10, 52);
        c.fillStyle = 'rgba(240, 120, 60, 0.4)';
        this.drawCloud(c, this.wrap(250 - o * 0.06, VW + 50, -50), 20, 42);

        // Seagulls flying across sunset
        for (let i = 0; i < 4; i++) {
            const bx = this.wrap(100 + i * 70 - o * 0.15, VW + 20, -20);
            const by = 22 + Math.sin(this.animTime * 0.0025 + i * 1.5) * 8;
            this.drawBird(c, bx, by);
        }

        // 3. Radiant Golden Sun sinking into ocean
        const sunX = Math.floor(VW * 0.5);
        const sunY = Math.floor(VH * 0.35);
        c.fillStyle = 'rgba(255, 235, 140, 0.15)';
        this.drawCircle(c, sunX, sunY, 26);
        c.fillStyle = 'rgba(255, 240, 160, 0.25)';
        this.drawCircle(c, sunX, sunY, 20);
        c.fillStyle = '#fff4a0';
        this.drawCircle(c, sunX, sunY, 14);

        // 4. Deep Blue to Turquoise Ocean
        const oy = Math.floor(VH * 0.42);
        this.gradient(c, 0, oy, VW, gy - oy, '#124888', '#1c68b0', '#2888c8', '#38a8e0');

        // Shimmering Golden Sun Reflection on water
        for (let y = oy; y < gy; y += 2) {
            const progress = (y - oy) / (gy - oy);
            const rw = 6 + progress * 35 + Math.sin(y * 0.3 + this.animTime * 0.005) * 4;
            const alpha = 0.35 * (1 - progress * 0.5);
            c.fillStyle = (progress < 0.4) ? `rgba(255, 244, 160, ${alpha})` : `rgba(255, 180, 80, ${alpha})`;
            c.fillRect(Math.floor(sunX - rw / 2), y, Math.floor(rw), 1);
        }

        // Rolling Animated Waves with White Foamy Crests
        for (let w = 0; w < 4; w++) {
            const wy = oy + 8 + w * 9;
            const waveSpeed = 0.025 + w * 0.008;
            for (let x = 0; x < VW; x += 2) {
                const woff = Math.sin((x + this.animTime * waveSpeed + w * 40) * 0.06) * 2;
                c.fillStyle = `rgba(180, 230, 255, ${0.35 - w * 0.05})`;
                c.fillRect(x, Math.floor(wy + woff), 2, 1);
                if (woff > 1.2) {
                    c.fillStyle = '#ffffff';
                    c.fillRect(x, Math.floor(wy + woff - 1), 2, 1);
                }
            }
        }

        // Sailboat in distance
        const bx = this.wrap(VW * 0.75 - o * 0.04, VW + 30, -30);
        const by = oy + 10 + Math.sin(this.animTime * 0.002) * 2;
        this.drawSailboat(c, bx, by);

        const bx2 = this.wrap(VW * 0.22 - o * 0.03, VW + 20, -20);
        c.fillStyle = '#3a2820';
        c.fillRect(bx2, oy + 6, 8, 2);
        c.fillStyle = '#f2ece4';
        c.fillRect(bx2 + 3, oy + 1, 1, 5);
        c.fillRect(bx2 + 4, oy + 2, 3, 3);

        // 5. Marine Drive Seawall & Tetrapods breakwater in the water
        const seawallY = gy - 12;
        for (let tx = Math.floor(-o * 0.6) % 18 - 18; tx < VW; tx += 18) {
            this.drawTetrapod(c, tx, seawallY + 4);
        }
        for (let sx = Math.floor(-o * 0.6) % 24 - 24; sx < VW; sx += 24) {
            if (Math.sin(this.animTime * 0.006 + sx) > 0.4) {
                c.fillStyle = 'rgba(255,255,255,0.7)';
                c.fillRect(sx + 3, seawallY + 1, 2, 3);
                c.fillRect(sx + 2, seawallY, 4, 1);
            }
        }

        // Curved Stone Seawall with classical railing
        c.fillStyle = '#8a8278';
        c.fillRect(0, seawallY, VW, 12);
        c.fillStyle = '#b0a89c';
        c.fillRect(0, seawallY, VW, 2);
        c.fillStyle = '#dcd4c8';
        c.fillRect(0, seawallY - 6, VW, 1);
        for (let x = 0; x < VW; x += 12) {
            c.fillStyle = '#dcd4c8';
            c.fillRect(x, seawallY - 6, 2, 6);
        }

        // 6. Queen's Necklace Curved Streetlights
        for (let lx = Math.floor(-o * 0.7) % 38 - 38; lx < VW; lx += 38) {
            this.drawMarineDriveLamp(c, lx, seawallY);
        }

        // 7. Wide Tiled Promenade Walkway
        c.fillStyle = '#baa892';
        c.fillRect(0, gy, VW, VH - gy);
        for (let r = 0; r < 4; r++) {
            const ry = gy + r * 6;
            const shift = (r % 2 === 0) ? 0 : 8;
            for (let x = Math.floor(-o * 0.8 + shift) % 16 - 16; x < VW; x += 16) {
                c.fillStyle = '#a4927e';
                c.fillRect(x, ry, 1, 6);
                c.fillRect(x, ry + 5, 16, 1);
                c.fillStyle = '#d0bea8';
                c.fillRect(x + 1, ry, 14, 1);
            }
        }

        // 8. Majestic Swaying Palm Trees
        const p1x = this.wrap(25 - o * 0.8, VW + 40, -40);
        const p2x = this.wrap(VW - 35 - o * 0.8, VW + 40, -40);
        this.drawKeralaPalm(c, p1x, gy);
        this.drawKeralaPalm(c, p2x, gy);

        // 9. Tea Setup in BEACH_TEA
        if (this.state === 'BEACH_TEA' && this.stateTime > 300) {
            this.drawSeasideTeaSetup(c, Math.floor(VW / 2), gy);
        }
    }

    drawKeralaPalm(c, x, gy) {
        c.fillStyle = '#6d4c38';
        for (let i = 0; i < 42; i++) {
            const curve = Math.floor(Math.sin(i * 0.06) * 4);
            c.fillRect(x + 4 + curve, gy - i, 3, 1);
            c.fillStyle = '#8a6248';
            c.fillRect(x + 4 + curve, gy - i, 1, 1);
            c.fillStyle = '#6d4c38';
        }
        const topX = x + 4 + Math.floor(Math.sin(42 * 0.06) * 4);
        const topY = gy - 42;

        c.fillStyle = '#5c4024';
        this.drawCircle(c, topX - 2, topY + 2, 2);
        this.drawCircle(c, topX + 2, topY + 2, 2);

        const sway = Math.sin(this.animTime * 0.003) * 2;
        const frondCols = ['#28742c', '#38903c', '#48a84c'];
        for (let f = 0; f < 3; f++) {
            c.fillStyle = frondCols[f];
            for (let i = 0; i < 18; i++) {
                const fy = topY - 2 + Math.floor(i * (0.3 + f * 0.2)) + Math.floor(sway * (i / 18));
                c.fillRect(topX - i, fy, 2, 2);
            }
        }
        for (let f = 0; f < 3; f++) {
            c.fillStyle = frondCols[f];
            for (let i = 0; i < 18; i++) {
                const fy = topY - 2 + Math.floor(i * (0.3 + f * 0.2)) - Math.floor(sway * (i / 18));
                c.fillRect(topX + i, fy, 2, 2);
            }
        }
        c.fillStyle = '#38903c';
        c.fillRect(topX - 3, topY - 4, 7, 3);
    }

    drawTetrapod(c, x, y) {
        c.fillStyle = '#5a6068';
        c.fillRect(x + 2, y, 4, 8);
        c.fillRect(x - 2, y + 4, 12, 3);
        c.fillStyle = '#7a8088';
        c.fillRect(x + 2, y, 2, 6);
        c.fillRect(x - 2, y + 4, 5, 2);
    }

    drawMarineDriveLamp(c, x, gy) {
        c.fillStyle = '#2a3036';
        c.fillRect(x + 2, gy - 24, 2, 24);
        c.fillRect(x - 2, gy - 26, 5, 2);
        c.fillRect(x - 4, gy - 25, 2, 2);
        c.fillStyle = '#ffe878';
        this.drawCircle(c, x - 3, gy - 24, 3);
        c.fillStyle = '#ffffff';
        c.fillRect(x - 3, gy - 24, 1, 1);
        c.fillStyle = 'rgba(255, 235, 120, 0.12)';
        for (let r = 8; r > 0; r -= 2) {
            c.fillRect(x - 3 - r, gy - 24 - r, r * 2, r * 2);
        }
    }

    drawSailboat(c, x, y) {
        c.fillStyle = '#6d482c';
        c.fillRect(x - 10, y, 20, 4);
        c.fillRect(x - 8, y + 4, 16, 2);
        c.fillStyle = '#3a2414';
        c.fillRect(x, y - 18, 2, 18);
        c.fillStyle = '#ffebd0';
        for (let i = 0; i < 14; i++) {
            c.fillRect(x + 2, y - 16 + i, Math.min(i, 9), 1);
        }
        c.fillStyle = '#e82030';
        c.fillRect(x + 2, y - 20, 5, 3);
    }

    drawSeasideTeaSetup(c, cx, gy) {
        const tx = cx - 8;
        c.fillStyle = '#7a5030';
        c.fillRect(tx + 6, gy - 12, 3, 12);
        c.fillRect(tx + 4, gy - 2, 7, 2);
        c.fillStyle = '#9e6c44';
        c.fillRect(tx, gy - 15, 15, 3);
        c.fillStyle = '#b88458';
        c.fillRect(tx + 1, gy - 15, 13, 1);

        c.fillStyle = '#d49830';
        c.fillRect(tx + 2, gy - 21, 5, 6);
        c.fillStyle = '#f0c050';
        c.fillRect(tx + 3, gy - 20, 3, 4);
        c.fillStyle = '#8a5c18';
        c.fillRect(tx + 1, gy - 19, 1, 3);
        c.fillRect(tx + 7, gy - 20, 1, 4);
        c.fillRect(tx + 3, gy - 23, 3, 2);

        this.drawCuttingChai(c, tx + 8, gy - 19);
        this.drawCuttingChai(c, tx + 12, gy - 19);

        const t = this.animTime * 0.004;
        c.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let s = 0; s < 2; s++) {
            const sx = tx + 9 + s * 4 + Math.sin(t * 3 + s) * 2;
            const sy = gy - 22 - ((this.animTime * 0.02 + s * 8) % 14);
            c.fillRect(Math.floor(sx), Math.floor(sy), 1, 2);
        }
        const hProgress = (t * 15) % 30;
        const hx = tx + 10 + Math.sin(t * 2) * 3;
        const hy = gy - 24 - hProgress * 0.5;
        const ha = Math.max(0, 1 - hProgress / 30);
        c.fillStyle = `rgba(255, 107, 157, ${ha * 0.75})`;
        c.fillRect(Math.floor(hx), Math.floor(hy), 2, 2);
    }

    drawCuttingChai(c, x, y) {
        c.fillStyle = 'rgba(230, 245, 255, 0.7)';
        c.fillRect(x, y, 3, 4);
        c.fillRect(x, y + 4, 3, 1);
        c.fillStyle = '#c48038';
        c.fillRect(x + 1, y + 1, 2, 3);
        c.fillStyle = '#e0a050';
        c.fillRect(x + 1, y + 1, 2, 1);
    }

    // ============ NIGHT & UNDER THE STARS ============

    drawNight(c) {
        const gy = Math.floor(VH * 0.74);

        // 1. Deep Celestial Midnight Gradient
        this.gradient(c, 0, 0, VW, VH, '#040412', '#0a0e2a', '#141444', '#1c1a52', '#121e44');

        // 2. Twinkling Multicolored Stars & Constellations
        const starColors = ['#ffffff', '#b8e4ff', '#fff2b4', '#e2cbff', '#a0d8ff'];
        for (let i = 0; i < 90; i++) {
            const sx = (i * 71 + 19) % VW;
            const sy = (i * 37 + 11) % (gy - 15);
            const twinkle = Math.sin(this.animTime * 0.003 + i * 0.8);
            if (twinkle > -0.2) {
                const col = starColors[i % starColors.length];
                c.fillStyle = col;
                if (i % 7 === 0 && twinkle > 0.4) {
                    c.fillRect(sx, sy, 1, 1);
                    c.fillRect(sx - 1, sy, 3, 1);
                    c.fillRect(sx, sy - 1, 1, 3);
                } else if (i % 3 === 0) {
                    c.fillRect(sx, sy, 2, 2);
                } else {
                    c.fillRect(sx, sy, 1, 1);
                }
            }
        }

        // 3. Periodic Shooting Star (Meteor streak!)
        this.drawShootingStar(c);

        // 4. Luminous Radiant Crescent Moon
        const mx = Math.floor(VW * 0.82);
        const my = 30;
        c.fillStyle = 'rgba(240, 230, 255, 0.08)';
        this.drawCircle(c, mx, my, 18);
        c.fillStyle = 'rgba(255, 245, 200, 0.15)';
        this.drawCircle(c, mx, my, 12);
        c.fillStyle = '#fff8dc';
        this.drawCircle(c, mx, my, 8);
        c.fillStyle = '#0a0e2a';
        this.drawCircle(c, mx + 3, my - 1, 7);
        c.fillStyle = '#eae0b8';
        c.fillRect(mx - 4, my - 1, 2, 2);
        c.fillRect(mx - 2, my + 3, 2, 1);

        // 5. Distant Bay Water & City Lights Vista
        this.drawCityLightsBay(c, gy);

        // 6. Romantic Hilltop Overlook Balustrade with Glowing Lanterns
        c.fillStyle = '#181a28';
        c.fillRect(0, gy, VW, VH - gy);
        c.fillStyle = '#222638';
        c.fillRect(0, gy, VW, 2);

        for (let x = 0; x < VW; x += 14) {
            c.fillStyle = '#282c40';
            c.fillRect(x + 4, gy - 12, 3, 12);
            c.fillStyle = '#343a52';
            c.fillRect(x + 4, gy - 12, 1, 12);
        }
        c.fillStyle = '#343a52';
        c.fillRect(0, gy - 14, VW, 2);
        c.fillStyle = '#222638';
        c.fillRect(0, gy - 12, VW, 1);

        [40, 160, 280].forEach(lx => {
            c.fillStyle = '#222638';
            c.fillRect(lx - 2, gy - 16, 8, 16);
            c.fillStyle = '#4a3820';
            c.fillRect(lx, gy - 23, 4, 7);
            c.fillStyle = '#ffea78';
            c.fillRect(lx + 1, gy - 22, 2, 5);
            c.fillStyle = 'rgba(255, 235, 120, 0.08)';
            for (let r = 12; r > 0; r -= 3) {
                c.fillRect(lx + 2 - r, gy - 20 - r, r * 2, r * 2);
            }
        });

        // 7. Floating magical fireflies
        for (let f = 0; f < 5; f++) {
            const fx = (f * 77 + Math.sin(this.animTime * 0.002 + f * 2) * 30 + this.animTime * 0.01) % (VW + 10) - 5;
            const fy = gy - 20 + Math.cos(this.animTime * 0.003 + f) * 15;
            const fa = Math.sin(this.animTime * 0.005 + f) * 0.5 + 0.5;
            c.fillStyle = `rgba(220, 255, 140, ${fa})`;
            c.fillRect(Math.floor(fx), Math.floor(fy), 2, 2);
        }
    }

    drawShootingStar(c) {
        const cycle = this.animTime % 7000;
        if (cycle < 1200) {
            const progress = cycle / 1200;
            const startX = VW * 0.1;
            const startY = 15;
            const endX = VW * 0.65;
            const endY = 70;
            const curX = startX + (endX - startX) * progress;
            const curY = startY + (endY - startY) * progress;

            c.fillStyle = '#ffffff';
            c.fillRect(Math.floor(curX), Math.floor(curY), 2, 2);
            for (let t = 1; t <= 6; t++) {
                const tx = curX - (endX - startX) * 0.015 * t;
                const ty = curY - (endY - startY) * 0.015 * t;
                const alpha = (1 - t / 7) * (1 - progress);
                c.fillStyle = `rgba(200, 240, 255, ${alpha})`;
                c.fillRect(Math.floor(tx), Math.floor(ty), 1, 1);
            }
        }
    }

    drawCityLightsBay(c, gy) {
        const bayY = gy - 32;
        c.fillStyle = '#080c1e';
        c.fillRect(0, bayY, VW, 18);

        const blds = [
            [0, 28], [30, 42], [55, 22], [80, 52], [115, 35], [145, 28],
            [175, 48], [210, 32], [240, 40], [275, 26], [305, 44], [345, 30]
        ];
        c.fillStyle = '#0c1026';
        blds.forEach(([bx, bh]) => {
            c.fillRect(bx, bayY - bh + 14, 26, bh);
            for (let r = 0; r < Math.floor(bh / 8); r++) {
                for (let col = 0; col < 2; col++) {
                    const wx = bx + 4 + col * 11;
                    const wy = bayY - bh + 16 + r * 8;
                    const winGlow = Math.sin(bx * 3 + r * 5 + col * 7 + this.animTime * 0.002);
                    if (winGlow > -0.2) {
                        const winCol = (r % 3 === 0) ? '#ffea78' : (r % 3 === 1) ? '#ffb848' : '#78d4ff';
                        c.fillStyle = winCol;
                        c.fillRect(wx, wy, 3, 2);
                        c.fillStyle = `rgba(255, 220, 100, ${0.12 + winGlow * 0.06})`;
                        c.fillRect(wx, bayY + 3 + r * 2, 4, 1);
                    }
                }
            }
            c.fillStyle = '#0c1026';
        });
    }

    drawCloud(c, x, y, w) {
        const origStyle = c.fillStyle;
        if (!origStyle.startsWith('rgba')) c.fillStyle = 'rgba(255,255,255,0.85)';
        const h = Math.floor(w * 0.3);
        c.fillRect(x, y, w, h);
        c.fillRect(x + w * 0.12, y - h * 0.6, w * 0.35, h * 0.6);
        c.fillRect(x + w * 0.4, y - h * 0.35, w * 0.3, h * 0.35);
    }

    // ============ CHARACTERS ============

    drawChars(c) {
        const cx = Math.floor(VW / 2);
        const cy = (this.state.startsWith('WALK_NIGHT') || this.state === 'ROMANTIC_MSG' || this.state === 'HUG' || this.state === 'PROPOSAL')
            ? Math.floor(VH * 0.74) - 1
            : (this.state.startsWith('WALK_BEACH') || this.state === 'BEACH_TEA')
            ? Math.floor(VH * 0.70) - 1
            : Math.floor(VH * 0.68) - 1;
        const f = this.walking ? this.walkFrame : 0;
        this.drawEugene(c, cx - 14, cy, f);
        this.drawAmmu(c, cx + 4, cy, f);
        if (this.state === 'FLOWER_GIVE') {
            this.drawJasmineGift(c, cx + 1, cy - 7);
        }
    }

    drawEugene(c, x, y, f) {
        c.fillStyle = '#3a2218';
        c.fillRect(x + 2, y - 17, 8, 1);
        c.fillRect(x + 1, y - 16, 10, 1);
        c.fillRect(x + 1, y - 15, 10, 2);
        c.fillStyle = '#f8d0a0';
        c.fillRect(x + 2, y - 13, 8, 5);
        c.fillStyle = '#3a2218';
        c.fillRect(x + 1, y - 13, 1, 3);
        c.fillRect(x + 10, y - 13, 1, 3);
        c.fillRect(x + 2, y - 13, 3, 1);
        c.fillStyle = '#1a1428';
        c.fillRect(x + 4, y - 12, 1, 2);
        c.fillRect(x + 7, y - 12, 1, 2);
        c.fillStyle = '#ffffff';
        c.fillRect(x + 4, y - 12, 1, 1);
        c.fillRect(x + 7, y - 12, 1, 1);
        c.fillStyle = 'rgba(255,160,140,0.4)';
        c.fillRect(x + 3, y - 10, 1, 1);
        c.fillRect(x + 8, y - 10, 1, 1);
        c.fillStyle = '#c06848';
        c.fillRect(x + 5, y - 9, 2, 1);
        c.fillStyle = '#4870a8';
        c.fillRect(x + 3, y - 7, 6, 1);
        c.fillRect(x + 2, y - 6, 8, 3);
        c.fillStyle = '#385888';
        c.fillRect(x + 2, y - 3, 8, 1);
        c.fillStyle = '#f8d0a0';
        if (this.state === 'FLOWER_GIVE') {
            c.fillRect(x + 1, y - 6, 1, 3);
            c.fillStyle = '#4870a8';
            c.fillRect(x + 10, y - 6, 3, 2);
            c.fillStyle = '#f8d0a0';
            c.fillRect(x + 13, y - 6, 2, 2);
        } else {
            const aOff = (f === 1) ? -1 : (f === 3) ? 1 : 0;
            c.fillRect(x + 1, y - 6 + aOff, 1, 3);
            c.fillRect(x + 10, y - 6 - aOff, 1, 3);
        }
        c.fillStyle = '#303030';
        c.fillRect(x + 3, y - 2, 6, 2);
        if (f === 1) {
            c.fillRect(x + 3, y, 2, 2);
            c.fillRect(x + 7, y, 2, 2);
        } else if (f === 3) {
            c.fillRect(x + 4, y, 2, 2);
            c.fillRect(x + 6, y, 2, 2);
        } else {
            c.fillRect(x + 3, y, 2, 2);
            c.fillRect(x + 7, y, 2, 2);
        }
        c.fillStyle = '#5c3c28';
        if (f === 1) {
            c.fillRect(x + 2, y + 2, 3, 1);
            c.fillRect(x + 7, y + 2, 3, 1);
        } else if (f === 3) {
            c.fillRect(x + 3, y + 2, 3, 1);
            c.fillRect(x + 6, y + 2, 3, 1);
        } else {
            c.fillRect(x + 2, y + 2, 3, 1);
            c.fillRect(x + 7, y + 2, 3, 1);
        }
    }

    drawAmmu(c, x, y, f) {
        c.fillStyle = '#281810';
        c.fillRect(x + 2, y - 17, 8, 1);
        c.fillRect(x + 1, y - 16, 10, 1);
        c.fillRect(x + 0, y - 15, 12, 2);
        c.fillRect(x + 0, y - 13, 2, 10);
        c.fillRect(x + 10, y - 13, 2, 10);
        c.fillStyle = '#f01848';
        c.fillRect(x + 9, y - 16, 3, 2);
        c.fillStyle = '#f8d0a0';
        c.fillRect(x + 2, y - 13, 8, 5);
        c.fillStyle = '#1a1428';
        c.fillRect(x + 3, y - 12, 2, 2);
        c.fillRect(x + 7, y - 12, 2, 2);
        c.fillStyle = '#ffffff';
        c.fillRect(x + 3, y - 12, 1, 1);
        c.fillRect(x + 7, y - 12, 1, 1);
        c.fillStyle = '#1a1428';
        c.fillRect(x + 3, y - 13, 2, 1);
        c.fillRect(x + 7, y - 13, 2, 1);
        c.fillStyle = (this.state === 'FLOWER_GIVE') ? 'rgba(255,100,140,0.65)' : 'rgba(255,140,140,0.45)';
        c.fillRect(x + 2, y - 10, 1, 1);
        c.fillRect(x + 9, y - 10, 1, 1);
        c.fillStyle = (this.state === 'FLOWER_GIVE') ? '#e83868' : '#e06060';
        c.fillRect(x + 5, y - 9, (this.state === 'FLOWER_GIVE') ? 3 : 2, 1);
        c.fillStyle = '#ff6090';
        c.fillRect(x + 3, y - 7, 6, 1);
        c.fillRect(x + 2, y - 6, 8, 3);
        c.fillStyle = '#f8d0a0';
        const aOff = (f === 1) ? 1 : (f === 3) ? -1 : 0;
        c.fillRect(x + 1, y - 6 + aOff, 1, 3);
        c.fillRect(x + 10, y - 6 - aOff, 1, 3);
        c.fillStyle = '#e04878';
        c.fillRect(x + 1, y - 3, 10, 3);
        c.fillRect(x + 0, y - 2, 12, 2);
        c.fillStyle = '#f8d0a0';
        if (f === 1) {
            c.fillRect(x + 3, y, 2, 1);
            c.fillRect(x + 7, y, 2, 1);
        } else if (f === 3) {
            c.fillRect(x + 4, y, 2, 1);
            c.fillRect(x + 6, y, 2, 1);
        } else {
            c.fillRect(x + 4, y, 2, 1);
            c.fillRect(x + 7, y, 2, 1);
        }
        c.fillStyle = '#e04878';
        c.fillRect(x + 3, y + 1, 3, 1);
        c.fillRect(x + 6, y + 1, 3, 1);
    }

    drawHugScene(c) {
        const cx = Math.floor(VW / 2);
        const cy = Math.floor(VH * 0.74) - 1;

        c.fillStyle = 'rgba(255, 235, 180, 0.04)';
        for (let r = 50; r > 0; r -= 5) {
            this.drawCircle(c, cx, cy - 14, r);
        }

        this.drawEugene(c, cx - 7, cy, 0);
        this.drawAmmu(c, cx + 2, cy, 0);

        c.fillStyle = '#4870a8';
        c.fillRect(cx + 1, cy - 6, 6, 2);
        c.fillStyle = '#f8d0a0';
        c.fillRect(cx + 6, cy - 6, 2, 2);

        c.fillStyle = '#f8d0a0';
        c.fillRect(cx - 3, cy - 5, 5, 2);

        const t = this.animTime * 0.004;
        for (let h = 0; h < 4; h++) {
            const hProgress = (t * 15 + h * 30) % 60;
            const hx = cx - 1 + Math.sin(t * 2 + h * 1.5) * 16;
            const hy = cy - 16 - hProgress * 0.45;
            const ha = Math.max(0, 1 - hProgress / 60);
            this.drawPixelHeart(c, Math.floor(hx), Math.floor(hy), `rgba(255, 90, 140, ${ha})`);
        }
    }

    drawProposalScene(c) {
        const cx = Math.floor(VW / 2);
        const cy = Math.floor(VH * 0.74) - 1;

        c.fillStyle = 'rgba(255, 235, 180, 0.05)';
        for (let r = 55; r > 0; r -= 5) {
            this.drawCircle(c, cx, cy - 14, r);
        }

        this.drawEugeneKneeling(c, cx - 14, cy + 4);
        this.drawAmmu(c, cx + 6, cy, 0);

        this.drawPixelRose(c, cx - 2, cy - 4);

        c.fillStyle = 'rgba(255, 40, 70, 0.15)';
        this.drawCircle(c, cx, cy - 6, 8);

        const t = this.animTime * 0.003;
        this.drawPixelHeart(c, cx - 6, cy - 28 + Math.sin(t) * 3, '#ff2050');
        this.drawPixelHeart(c, cx + 12, cy - 32 + Math.sin(t + 1.2) * 3, '#ff6090');
        if (this.stateTime > 400) {
            this.drawPixelHeart(c, cx + 2, cy - 38 + Math.sin(t + 2.4) * 3, '#ff4070');
        }

        const sp = [
            { dx: -4, dy: -8, off: 0 },
            { dx: 4, dy: -6, off: 1.5 },
            { dx: 0, dy: -12, off: 3.0 }
        ];
        sp.forEach(s => {
            const glow = Math.sin(this.animTime * 0.006 + s.off);
            if (glow > 0.3) {
                c.fillStyle = '#ffffff';
                c.fillRect(cx + s.dx, cy + s.dy, 1, 1);
            }
        });
    }

    drawEugeneKneeling(c, x, y) {
        c.fillStyle = '#3a2218';
        c.fillRect(x + 2, y - 11, 8, 1);
        c.fillRect(x + 1, y - 10, 10, 1);
        c.fillRect(x + 1, y - 9, 10, 2);
        c.fillStyle = '#f8d0a0';
        c.fillRect(x + 2, y - 7, 8, 5);
        c.fillStyle = '#3a2218';
        c.fillRect(x + 1, y - 7, 1, 3);
        c.fillRect(x + 10, y - 7, 1, 3);
        c.fillRect(x + 2, y - 7, 3, 1);
        c.fillStyle = '#1a1428';
        c.fillRect(x + 4, y - 6, 1, 2);
        c.fillRect(x + 7, y - 6, 1, 2);
        c.fillStyle = '#ffffff';
        c.fillRect(x + 4, y - 6, 1, 1);
        c.fillRect(x + 7, y - 6, 1, 1);
        c.fillStyle = '#c06848';
        c.fillRect(x + 5, y - 3, 2, 1);
        c.fillStyle = '#4870a8';
        c.fillRect(x + 3, y - 1, 6, 3);
        c.fillStyle = '#303030';
        c.fillRect(x + 2, y + 2, 8, 2);
        c.fillStyle = '#5c3c28';
        c.fillRect(x + 2, y + 4, 3, 1);
    }

    drawPixelHeart(c, x, y, color) {
        c.fillStyle = color;
        c.fillRect(x - 1, y, 1, 1);
        c.fillRect(x + 1, y, 1, 1);
        c.fillRect(x - 2, y + 1, 2, 1);
        c.fillRect(x + 1, y + 1, 2, 1);
        c.fillRect(x - 2, y + 2, 5, 1);
        c.fillRect(x - 1, y + 3, 3, 1);
        c.fillRect(x, y + 4, 1, 1);
    }

    drawPixelRose(c, x, y) {
        c.fillStyle = '#226824';
        c.fillRect(x + 2, y + 1, 1, 7);
        c.fillStyle = '#328834';
        c.fillRect(x + 3, y + 3, 2, 1);
        c.fillRect(x, y + 5, 2, 1);

        c.fillStyle = '#e01838';
        c.fillRect(x, y - 2, 5, 4);
        c.fillRect(x + 1, y - 4, 3, 2);
        c.fillStyle = '#ff3858';
        c.fillRect(x + 1, y - 3, 3, 2);
        c.fillStyle = '#ff8098';
        c.fillRect(x + 2, y - 2, 1, 1);
    }

    drawWalkLabel(c) {
        const labels = {
            'WALK_CITY': '~ Walking through the city ~',
            'WALK_BOOKSHOP': '~ Heading to the bookshop ~',
            'WALK_GARDEN': '~ Walking to the garden ~',
            'WALK_BEACH': '~ Walking to Marine Drive ~',
            'WALK_NIGHT': '~ Under the stars ~'
        };
        const text = labels[this.state] || '';
        if (!text) return;
        // Semi-transparent bar
        c.fillStyle = 'rgba(0,0,0,0.45)';
        c.fillRect(0, 8, VW, 14);
        // Text centered
        this.drawTinyText(c, text, VW / 2, 11, '#f0f0f0', true);
    }

    // ============ TINY PIXEL TEXT (3x5 font) ============
    drawTinyText(c, str, x, y, color, center) {
        const F = {
            A:[0b010,0b101,0b111,0b101,0b101],B:[0b110,0b101,0b110,0b101,0b110],
            C:[0b011,0b100,0b100,0b100,0b011],D:[0b110,0b101,0b101,0b101,0b110],
            E:[0b111,0b100,0b110,0b100,0b111],F:[0b111,0b100,0b110,0b100,0b100],
            G:[0b011,0b100,0b101,0b101,0b011],H:[0b101,0b101,0b111,0b101,0b101],
            I:[0b111,0b010,0b010,0b010,0b111],J:[0b001,0b001,0b001,0b101,0b010],
            K:[0b101,0b110,0b100,0b110,0b101],L:[0b100,0b100,0b100,0b100,0b111],
            M:[0b101,0b111,0b111,0b101,0b101],N:[0b101,0b111,0b111,0b111,0b101],
            O:[0b010,0b101,0b101,0b101,0b010],P:[0b110,0b101,0b110,0b100,0b100],
            Q:[0b010,0b101,0b101,0b110,0b011],R:[0b110,0b101,0b110,0b101,0b101],
            S:[0b011,0b100,0b010,0b001,0b110],T:[0b111,0b010,0b010,0b010,0b010],
            U:[0b101,0b101,0b101,0b101,0b010],V:[0b101,0b101,0b101,0b010,0b010],
            W:[0b101,0b101,0b111,0b111,0b010],X:[0b101,0b101,0b010,0b101,0b101],
            Y:[0b101,0b101,0b010,0b010,0b010],Z:[0b111,0b001,0b010,0b100,0b111],
            ' ':[0,0,0,0,0],
            '~':[0,0b101,0b010,0,0],'-':[0,0,0b111,0,0],
            '!':[0b010,0b010,0b010,0,0b010],'.':[0,0,0,0,0b010],
            ',':[0,0,0,0b010,0b100],"'":[0b010,0b010,0,0,0],
            '?':[0b110,0b001,0b010,0,0b010],
        };
        const s = str.toUpperCase();
        const tw = s.length * 4;
        let sx = center ? Math.floor(x - tw / 2) : x;
        c.fillStyle = color;
        for (let i = 0; i < s.length; i++) {
            const g = F[s[i]];
            if (!g) continue;
            const cx = sx + i * 4;
            for (let r = 0; r < 5; r++) {
                for (let col = 0; col < 3; col++) {
                    if (g[r] & (4 >> col)) c.fillRect(cx + col, y + r, 1, 1);
                }
            }
        }
    }

    // ============ SCENE MANAGEMENT & MUSIC ============

    playMusic() {
        if (!this.bgMusic) {
            this.bgMusic = document.getElementById('bg-music');
        }
        if (this.bgMusic) {
            this.bgMusic.currentTime = 90;
            this.bgMusic.play().then(() => {
                this.musicPlaying = true;
                this.updateMusicBtn();
            }).catch(e => {
                console.log('Audio waiting for user gesture:', e);
            });
        }
    }

    toggleMusic() {
        if (!this.bgMusic) {
            this.bgMusic = document.getElementById('bg-music');
        }
        if (!this.bgMusic) return;

        if (this.bgMusic.paused) {
            if (this.bgMusic.currentTime < 90) {
                this.bgMusic.currentTime = 90;
            }
            this.bgMusic.play().then(() => {
                this.musicPlaying = true;
                this.updateMusicBtn();
            }).catch(e => console.log(e));
        } else {
            this.bgMusic.pause();
            this.musicPlaying = false;
            this.updateMusicBtn();
        }
    }

    updateMusicBtn() {
        const btn = document.getElementById('music-btn');
        if (btn) {
            btn.textContent = this.musicPlaying ? '🎵' : '🔇';
            btn.classList.toggle('muted', !this.musicPlaying);
        }
    }

    startGame() {
        this.playMusic();
        document.getElementById('intro-overlay').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('intro-overlay').classList.add('hidden');
            document.getElementById('intro-overlay').style.opacity = '1';
            this.advance();
        }, 600);
    }

    advance() {
        this.hideDialogue();
        this.si++;
        if (this.si >= this.scenes.length) return;
        const scene = this.scenes[this.si];

        this.fadeOut(() => {
            this.state = scene;
            this.stateTime = 0;
            this.walkDone = false;
            if (scene.startsWith('WALK_')) {
                this.walking = true;
                this.walkFrame = 0;
                this.walkTimer = 0;
            } else {
                this.walking = false;
                this.walkFrame = 0;
            }
            this.fadeIn();
            // Enter scene after fade
            setTimeout(() => this.enterScene(scene), 400);
        });
    }

    enterScene(scene) {
        switch (scene) {
            case 'DATE_ASK':
                this.showDialogue('Eugene', 'Would you like to go on a date?', [
                    { label: '  Yes!', cls: 'yes-btn', resp: 'Yay! Let\'s go!' },
                    { label: '  No...', cls: 'no-btn', resp: 'Hehe, let\'s go anyway!' }
                ]);
                break;
            case 'BOOKSHOP_ASK':
                this.showDialogue('Eugene', 'Look at this beautiful bookshop! Want a book, Rapunzel?', [
                    { label: '  Yessss!', cls: 'yes-btn', resp: 'A lovely book for my love!' },
                    { label: '  No thanks', cls: 'no-btn', resp: 'That\'s okay, let\'s keep going!' }
                ]);
                break;
            case 'FLOWER_GIVE':
                this.showDialogue('Eugene', 'Here is a jasmine for you, my love...', null, () => this.advance());
                break;
            case 'BEACH_TEA':
                this.showDialogue('Eugene', 'What a gorgeous sunset! Wanna drink some tea?', [
                    { label: '  Yes!', cls: 'yes-btn', resp: 'Cheers to us!' },
                    { label: '  No thanks', cls: 'no-btn', resp: 'The view is enough!' }
                ]);
                break;
            case 'ROMANTIC_MSG':
                this.showDialogue('Eugene',
                    'You know, Rapunzel, every moment with you is special, and being with you is the happiest part of my life. I want to be with you forever.',
                    null, () => this.advance());
                break;
            case 'HUG':
                setTimeout(() => {
                    this.showDialogue('', '* Eugene hugs Rapunzel tightly *', null, null);
                }, 600);
                break;
            case 'PROPOSAL':
                this.showDialogue('Eugene', 'I love you, Ammu.', [
                    { label: '  I love you too!', cls: 'yes-btn', resp: '' },
                    { label: '  ...', cls: 'no-btn', resp: 'Hehe... I love you!' }
                ], null, true);
                break;
            case 'PRE_FINALE':
                this.showDialogue('', 'One last thing...', null, () => {
                    this.hideDialogue();
                    this.state = 'FINALE';
                    this.showFinale();
                });
                break;
        }
    }

    // ============ DIALOGUE ============

    showDialogue(speaker, text, choices, contCb, isProposal) {
        this.dBox.classList.remove('hidden');
        this.dSpeaker.textContent = speaker;
        this.dText.textContent = '';
        this.dChoices.innerHTML = '';
        this.dContinue.classList.add('hidden');

        if (this.typeInterval) clearInterval(this.typeInterval);

        const onFinishTyping = () => {
            if (this.typeInterval) {
                clearInterval(this.typeInterval);
                this.typeInterval = null;
            }
            this.dText.textContent = text;
            if (choices) {
                this.dChoices.innerHTML = '';
                choices.forEach(ch => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn ' + ch.cls;
                    btn.textContent = ch.label;

                    if (ch.cls.includes('no-btn')) {
                        let noAttempt = 0;
                        const noPhrases = [
                            "No... 💨",
                            "Wait, what? 😜",
                            "Can't click me! ✨",
                            "Try again! 🏃💨",
                            "Just say Yes! 💕",
                            "Hehe nope! 🥰",
                            "Never! 💖"
                        ];
                        const dodge = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            noAttempt++;
                            btn.textContent = noPhrases[noAttempt % noPhrases.length];
                            // Random displacement within dialogue bounds
                            const rx = (Math.random() - 0.5) * 200;
                            const ry = (Math.random() - 0.5) * 55;
                            btn.style.position = 'relative';
                            btn.style.zIndex = '50';
                            btn.style.transition = 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
                            btn.style.transform = `translate(${rx}px, ${ry}px)`;
                        };
                        btn.onmouseenter = dodge;
                        btn.onmousemove = dodge;
                        btn.onclick = dodge;
                        btn.ontouchstart = dodge;
                        btn.onpointerdown = dodge;
                    } else {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            this.hideDialogue();
                            if (isProposal) {
                                this.showConfetti();
                            }
                            if (ch.resp) {
                                this.showResponse(ch.resp, () => this.advance());
                            } else {
                                this.advance();
                            }
                        };
                    }
                    this.dChoices.appendChild(btn);
                });
            } else if (contCb) {
                this.dContinue.classList.remove('hidden');
                this.dContinue.onclick = (e) => {
                    e.stopPropagation();
                    this.hideDialogue();
                    contCb();
                };
            }
        };

        this.dBox.onclick = () => {
            if (this.typeInterval) {
                onFinishTyping();
            }
        };

        let i = 0;
        this.typeInterval = setInterval(() => {
            if (i < text.length) {
                this.dText.textContent += text[i];
                i++;
            } else {
                onFinishTyping();
            }
        }, 30);
    }

    showResponse(text, cb) {
        this.dBox.classList.remove('hidden');
        this.dSpeaker.textContent = '';
        this.dText.textContent = text;
        this.dChoices.innerHTML = '';
        this.dContinue.classList.add('hidden');
        setTimeout(() => { this.hideDialogue(); if (cb) cb(); }, 2000);
    }

    hideDialogue() {
        this.dBox.classList.add('hidden');
        if (this.typeInterval) { clearInterval(this.typeInterval); this.typeInterval = null; }
    }

    showConfetti() {
        for (let i = 0; i < 40; i++) {
            const el = document.createElement('div');
            const colors = ['#ff6090','#f0d848','#ff4070','#e040a0','#70c8f0','#50a058','#ff8040'];
            el.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}%;width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;background:${colors[i%colors.length]};z-index:200;pointer-events:none;animation:confettiFall ${2+Math.random()*2}s ease-in ${Math.random()*0.5}s forwards`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 4000);
        }
        // Add confetti keyframes if not exists
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = '@keyframes confettiFall{0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(100vh) rotate(720deg)}}';
            document.head.appendChild(style);
        }
    }

    showFinale() {
        const finale = document.getElementById('finale-overlay');
        finale.classList.remove('hidden');
        const fd = document.getElementById('finale-flowers');
        const emojis = ['🌸', '🌺', '🌷', '🌹', '🌼', '💐', '🌻', '🏵️'];
        for (let i = 0; i < 35; i++) {
            const f = document.createElement('div');
            f.className = 'pf';
            f.textContent = emojis[i % emojis.length];
            f.style.cssText = `left:${Math.random()*95}%;top:${Math.random()*90}%;font-size:${1+Math.random()*1.5}rem;animation-delay:${Math.random()*4}s`;
            fd.appendChild(f);
        }
    }

    // ============ UTILITIES ============

    fadeOut(cb) {
        this.fading = true;
        this.fadingIn = false;
        this.fadeAlpha = 0;
        this.fadeCb = cb;
    }

    fadeIn() {
        this.fading = true;
        this.fadingIn = true;
        this.fadeAlpha = 1;
    }

    gradient(c, x, y, w, h, ...colors) {
        const steps = colors.length - 1;
        for (let py = 0; py < h; py++) {
            const t = py / h;
            const seg = Math.min(Math.floor(t * steps), steps - 1);
            const st = (t * steps) - seg;
            c.fillStyle = this.lerp(colors[seg], colors[seg + 1], st);
            c.fillRect(x, y + py, w, 1);
        }
    }

    lerp(c1, c2, t) {
        const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
        const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
        return `rgb(${Math.floor(r1 + (r2 - r1) * t)},${Math.floor(g1 + (g2 - g1) * t)},${Math.floor(b1 + (b2 - b1) * t)})`;
    }

    drawCircle(c, cx, cy, r) {
        for (let dy = -r; dy <= r; dy++) {
            const dx = Math.floor(Math.sqrt(r * r - dy * dy));
            c.fillRect(cx - dx, cy + dy, dx * 2, 1);
        }
    }

    wrap(val, max, min) {
        const range = max - min;
        return ((val - min) % range + range) % range + min;
    }
}

// Start game
const game = new Game();
