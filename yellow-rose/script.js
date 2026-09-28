/* ==========================================================================
   2D PIXEL ART ENGINE: TANGLED SUN-DROP FLOWER, CORONA CASTLE & BOAT SCENE
   Faithfully handcrafted in 2D Pixel Art based on Tangled Reference Images:
   1. Tangled Sun-Drop Lily (6 pointed glowing petals, fiery inner flame veins, curved stem, basal leaves)
   2. Kingdom of Corona Castle (Island bluff, village houses along slope, arched bridge, mint-green onion domes)
   3. "I See the Light" Gondola (Carved boat, hanging stern lantern, Eugene in teal vest, Rapunzel releasing floating lantern)
   ========================================================================== */

(function () {
    'use strict';

    const canvas = document.getElementById('pixel-canvas');
    const ctx = canvas.getContext('2d');

    // Virtual Internal Pixel Resolution for Crisp Retro Look
    const V_WIDTH = 640;
    const V_HEIGHT = 360;

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.imageSmoothingEnabled = false;

        const scaleX = canvas.width / V_WIDTH;
        const scaleY = canvas.height / V_HEIGHT;
        scale = Math.max(scaleX, scaleY); // Cover screen

        offsetX = (canvas.width - V_WIDTH * scale) / 2;
        offsetY = (canvas.height - V_HEIGHT * scale) / 2;
    }
    window.addEventListener('resize', resize);
    resize();

    // ==========================================================================
    // 1. AUDIO & MUSIC MANAGEMENT (Starts from 10s & On by Default)
    // ==========================================================================
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    const musicBtnText = document.getElementById('music-btn-text');
    let isPlaying = false;

    function playMusicFrom10s() {
        if (!bgMusic) return;
        if (bgMusic.currentTime < 10 || isNaN(bgMusic.currentTime)) {
            bgMusic.currentTime = 10;
        }
        const promise = bgMusic.play();
        if (promise !== undefined) {
            promise.then(() => {
                isPlaying = true;
                if (musicBtnText) musicBtnText.textContent = "MUSIC: PAUSE ⏸";
                if (musicBtn) musicBtn.style.borderColor = "#ffffff";
            }).catch(() => {
                // Autoplay blocked by browser policy: wait for first interaction
                if (musicBtnText) musicBtnText.textContent = "MUSIC: PLAY ▶";
            });
        }
    }

    function toggleMusic() {
        if (!bgMusic) return;
        if (bgMusic.paused) {
            playMusicFrom10s();
        } else {
            bgMusic.pause();
            isPlaying = false;
            if (musicBtnText) musicBtnText.textContent = "MUSIC: PLAY ▶";
            if (musicBtn) musicBtn.style.borderColor = "#ffcc00";
        }
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }

    // Loop from 10 seconds if track finishes
    if (bgMusic) {
        bgMusic.addEventListener('ended', () => {
            bgMusic.currentTime = 10;
            bgMusic.play().catch(() => {});
        });
    }

    // Attempt default play immediately
    playMusicFrom10s();
    window.addEventListener('DOMContentLoaded', playMusicFrom10s);
    window.addEventListener('load', playMusicFrom10s);

    // Fallback: If autoplay was blocked by browser policy, start on first touch/click
    const onAnyFirstInteraction = () => {
        if (bgMusic && bgMusic.paused) {
            playMusicFrom10s();
        }
    };
    ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(ev => {
        window.addEventListener(ev, onAnyFirstInteraction, { once: true });
    });

    // ==========================================================================
    // 2. PIXEL STARS & WISPY SKY CLOUDS (Atmospheric Night Sky)
    // ==========================================================================
    const stars = [];
    for (let i = 0; i < 85; i++) {
        stars.push({
            x: Math.floor(Math.random() * V_WIDTH),
            y: Math.floor(Math.random() * (V_HEIGHT * 0.54)),
            size: Math.random() > 0.85 ? 2 : 1,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            twinkleOffset: Math.random() * Math.PI * 2,
            color: Math.random() > 0.4 ? '#ffffff' : '#ffe082'
        });
    }

    // ==========================================================================
    // 3. PIXEL FLOATING SKY LANTERNS
    // ==========================================================================
    const lanterns = [];
    const LANTERN_COUNT = 45;

    class PixelLantern {
        constructor(initialY = null, startX = null) {
            this.reset(initialY, startX);
        }

        reset(initialY = null, startX = null) {
            this.x = startX !== null ? startX : Math.random() * V_WIDTH;
            this.y = initialY !== null ? initialY : V_HEIGHT * 0.62 + Math.random() * 70;
            
            // Depth variation
            this.depth = Math.random();
            if (this.depth < 0.4) {
                this.w = 3;
                this.h = 4;
                this.speedY = 0.35 + Math.random() * 0.2;
            } else if (this.depth < 0.8) {
                this.w = 5;
                this.h = 7;
                this.speedY = 0.55 + Math.random() * 0.25;
            } else {
                this.w = 7;
                this.h = 10;
                this.speedY = 0.75 + Math.random() * 0.35;
            }

            this.sway = Math.random() * Math.PI * 2;
            this.swaySpeed = 0.02 + Math.random() * 0.02;
            this.flicker = Math.random() * Math.PI;
        }

        update() {
            this.y -= this.speedY;
            this.sway += this.swaySpeed;
            this.x += Math.sin(this.sway) * (this.w * 0.14);
            this.flicker += 0.1;

            if (this.y < -20) {
                this.reset();
            }
        }

        draw(ctx) {
            const px = Math.floor(this.x);
            const py = Math.floor(this.y);
            const flickerBright = Math.sin(this.flicker) > 0;

            if (this.w <= 3) {
                ctx.fillStyle = flickerBright ? '#fff385' : '#ffb300';
                ctx.fillRect(px, py, this.w, this.h);
            } else if (this.w <= 5) {
                ctx.fillStyle = 'rgba(255, 213, 79, 0.26)';
                ctx.fillRect(px - 1, py - 1, this.w + 2, this.h + 2);
                ctx.fillStyle = '#ff8f00';
                ctx.fillRect(px, py, this.w, this.h);
                ctx.fillStyle = flickerBright ? '#fffde7' : '#ffe082';
                ctx.fillRect(px + 1, py + 1, this.w - 2, this.h - 3);
                ctx.fillStyle = '#5c2b00';
                ctx.fillRect(px, py + this.h - 1, this.w, 1);
            } else {
                // Larger lanterns with warm aura & Corona Sun mark
                ctx.fillStyle = 'rgba(255, 234, 121, 0.35)';
                ctx.fillRect(px - 2, py - 2, this.w + 4, this.h + 4);
                ctx.fillStyle = '#ff6f00';
                ctx.fillRect(px, py, this.w, this.h);
                ctx.fillStyle = '#ffd54f';
                ctx.fillRect(px + 1, py + 1, this.w - 2, this.h - 2);
                ctx.fillStyle = flickerBright ? '#ffffff' : '#fff59d';
                ctx.fillRect(px + 2, py + 2, this.w - 4, this.h - 4);
                // Corona Sun symbol
                ctx.fillStyle = '#d97706';
                ctx.fillRect(px + 3, py + 4, 1, 2);
                ctx.fillStyle = '#421a00';
                ctx.fillRect(px + 1, py + this.h - 1, this.w - 2, 1);
            }

            // Mirror reflection in lake water
            if (py > V_HEIGHT * 0.58 && py < V_HEIGHT) {
                const reflectY = V_HEIGHT * 0.58 + (py - V_HEIGHT * 0.58) * 0.7;
                ctx.fillStyle = 'rgba(255, 179, 0, 0.15)';
                ctx.fillRect(px, Math.floor(reflectY), this.w, 1);
            }
        }
    }

    for (let i = 0; i < LANTERN_COUNT; i++) {
        lanterns.push(new PixelLantern(Math.random() * (V_HEIGHT * 0.75)));
    }

    // Click canvas to release a new lantern
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left - offsetX) / scale;
        const clickY = (e.clientY - rect.top - offsetY) / scale;
        
        const newL = new PixelLantern(clickY, clickX);
        newL.w = 7;
        newL.h = 10;
        lanterns.push(newL);

        createSparkleBurst(clickX, clickY);
    });

    // ==========================================================================
    // 4. GOLDEN PIXEL SPARKLES
    // ==========================================================================
    let sparkles = [];
    function createSparkleBurst(x, y) {
        for (let i = 0; i < 9; i++) {
            sparkles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3 - 1,
                life: 32,
                maxLife: 32,
                color: Math.random() > 0.5 ? '#fff385' : '#ffd700'
            });
        }
    }

    // ==========================================================================
    // 5. THE TANGLED SUN-DROP FLOWER (Exact match to Reference Image 1)
    // 6 pointed glowing golden petals, inner flame markings, curved green stem, basal leaves
    // ==========================================================================
    const flower = {
        x: V_WIDTH * 0.49,
        targetY: V_HEIGHT * 0.38,
        currentY: V_HEIGHT + 230, // starts hidden below screen
        velocityY: -7.0,
        bobAngle: 0,
        isSettled: false,
        particlesTimer: 0
    };

    function resetFlowerRise() {
        flower.currentY = V_HEIGHT + 230;
        flower.velocityY = -7.0;
        flower.isSettled = false;
        createSparkleBurst(flower.x, V_HEIGHT * 0.7);
    }

    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
        replayBtn.addEventListener('click', resetFlowerRise);
    }

    function updateFlower() {
        if (!flower.isSettled) {
            const dist = flower.targetY - flower.currentY;
            flower.velocityY += dist * 0.032;
            flower.velocityY *= 0.84; // smooth natural damping
            flower.currentY += flower.velocityY;

            if (Math.abs(dist) < 0.8 && Math.abs(flower.velocityY) < 0.2) {
                flower.isSettled = true;
                flower.currentY = flower.targetY;
                createSparkleBurst(flower.x, flower.currentY);
            }
        } else {
            flower.bobAngle += 0.035;
        }

        flower.particlesTimer++;
        if (flower.particlesTimer % 10 === 0) {
            sparkles.push({
                x: flower.x + (Math.random() - 0.5) * 44,
                y: flower.currentY + (Math.random() - 0.5) * 34,
                vx: (Math.random() - 0.5) * 0.6,
                vy: -(Math.random() * 1.1 + 0.4),
                life: 38,
                maxLife: 38,
                color: Math.random() > 0.3 ? '#ffea79' : '#fff9c4'
            });
        }
    }

    function drawPixelSunDropFlower(ctx) {
        const floatOffset = flower.isSettled ? Math.sin(flower.bobAngle) * 3.5 : 0;
        const fx = Math.floor(flower.x);
        const fy = Math.floor(flower.currentY + floatOffset);
        const time = Date.now();

        ctx.save();
        ctx.translate(fx, fy);

        // --- 1. RADIANT GOLDEN SUNLIGHT BLOOM (Warm Multi-Layer Aura) ---
        const pulse = 0.36 + Math.sin(time * 0.0035) * 0.09;
        const aura = ctx.createRadialGradient(0, -10, 3, 0, -10, 75);
        aura.addColorStop(0, `rgba(255, 255, 255, ${pulse * 2.0})`);
        aura.addColorStop(0.22, `rgba(255, 245, 157, ${pulse * 1.6})`);
        aura.addColorStop(0.50, `rgba(255, 179, 0, ${pulse * 0.9})`);
        aura.addColorStop(0.80, `rgba(230, 81, 0, ${pulse * 0.35})`);
        aura.addColorStop(1, 'rgba(230, 81, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, -10, 75, 0, Math.PI * 2);
        ctx.fill();

        // --- 2. BASAL LEAVES & EARTHY MOUND AT STEM BASE (Reference Image 1) ---
        const baseY = 62;
        // Mossy Earth Knobby Mound
        ctx.fillStyle = '#0a1d0f';
        ctx.beginPath();
        ctx.ellipse(0, baseY + 14, 38, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#143818';
        ctx.beginPath();
        ctx.ellipse(0, baseY + 12, 34, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e5223';
        ctx.fillRect(-24, baseY + 8, 48, 5);

        // Cluster of Broad Dark-Green Lily Leaves spreading out (Layered like Image 1)
        // Leaf 1: Far Left Arching Down
        ctx.fillStyle = '#081d0f';
        ctx.beginPath();
        ctx.moveTo(-2, baseY + 6);
        ctx.quadraticCurveTo(-28, baseY - 2, -38, baseY + 10);
        ctx.quadraticCurveTo(-20, baseY + 18, -2, baseY + 8);
        ctx.fill();
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.moveTo(-2, baseY + 7);
        ctx.quadraticCurveTo(-26, baseY, -35, baseY + 9);
        ctx.quadraticCurveTo(-18, baseY + 15, -2, baseY + 8);
        ctx.fill();
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(-25, baseY + 5, 14, 1);

        // Leaf 2: Mid Left Curved Upward
        ctx.fillStyle = '#081d0f';
        ctx.beginPath();
        ctx.moveTo(-1, baseY + 2);
        ctx.quadraticCurveTo(-20, baseY - 14, -28, baseY - 5);
        ctx.quadraticCurveTo(-14, baseY + 5, -1, baseY + 5);
        ctx.fill();
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.moveTo(-1, baseY + 3);
        ctx.quadraticCurveTo(-18, baseY - 11, -26, baseY - 5);
        ctx.quadraticCurveTo(-12, baseY + 4, -1, baseY + 4);
        ctx.fill();
        ctx.fillStyle = '#81c784';
        ctx.fillRect(-20, baseY - 7, 10, 1);

        // Leaf 3: Far Right Arching Down
        ctx.fillStyle = '#081d0f';
        ctx.beginPath();
        ctx.moveTo(2, baseY + 6);
        ctx.quadraticCurveTo(28, baseY - 2, 38, baseY + 10);
        ctx.quadraticCurveTo(20, baseY + 18, 2, baseY + 8);
        ctx.fill();
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.moveTo(2, baseY + 7);
        ctx.quadraticCurveTo(26, baseY, 35, baseY + 9);
        ctx.quadraticCurveTo(18, baseY + 15, 2, baseY + 8);
        ctx.fill();
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(12, baseY + 5, 14, 1);

        // Leaf 4: Mid Right Curved Upward
        ctx.fillStyle = '#081d0f';
        ctx.beginPath();
        ctx.moveTo(1, baseY + 2);
        ctx.quadraticCurveTo(20, baseY - 14, 28, baseY - 5);
        ctx.quadraticCurveTo(14, baseY + 5, 1, baseY + 5);
        ctx.fill();
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.moveTo(1, baseY + 3);
        ctx.quadraticCurveTo(18, baseY - 11, 26, baseY - 5);
        ctx.quadraticCurveTo(12, baseY + 4, 1, baseY + 4);
        ctx.fill();
        ctx.fillStyle = '#81c784';
        ctx.fillRect(12, baseY - 7, 10, 1);

        // Leaf 5: Front Center Broad Leaf
        ctx.fillStyle = '#143818';
        ctx.beginPath();
        ctx.moveTo(0, baseY + 4);
        ctx.quadraticCurveTo(-10, baseY + 14, 0, baseY + 20);
        ctx.quadraticCurveTo(10, baseY + 14, 0, baseY + 4);
        ctx.fill();
        ctx.fillStyle = '#388e3c';
        ctx.fillRect(-3, baseY + 9, 6, 7);

        // --- 3. SLENDER CURVED DARK-GREEN STEM (Reference Image 1) ---
        ctx.strokeStyle = '#0a2211'; // dark outline
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.moveTo(0, baseY + 5);
        ctx.bezierCurveTo(5, baseY - 16, -7, 22, 0, 6);
        ctx.stroke();

        ctx.strokeStyle = '#1b5e20'; // emerald green
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(0, baseY + 5);
        ctx.bezierCurveTo(5, baseY - 16, -7, 22, 0, 6);
        ctx.stroke();

        ctx.strokeStyle = '#4caf50'; // sunlit highlight stripe
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(1, baseY + 5);
        ctx.bezierCurveTo(6, baseY - 16, -6, 22, 1, 6);
        ctx.stroke();

        // Small stem leaflet along the stalk
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.moveTo(-1, 30);
        ctx.quadraticCurveTo(-10, 24, -13, 31);
        ctx.quadraticCurveTo(-6, 34, -1, 32);
        ctx.fill();
        ctx.fillStyle = '#66bb6a';
        ctx.fillRect(-8, 27, 5, 1);

        // --- 4. CALYX RECEPTACLE UNDER THE BLOSSOM ---
        ctx.fillStyle = '#0a2211';
        ctx.beginPath();
        ctx.moveTo(-8, 5);
        ctx.lineTo(0, 11);
        ctx.lineTo(8, 5);
        ctx.lineTo(4, 1);
        ctx.lineTo(-4, 1);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(-6, 3, 12, 4);

        // --- 5. THE 6 TANGLED SUN-DROP LILY PETALS (Exact Image 1 Geometry) ---
        // Organic curved lily petals with fiery feathered inner streaks and glowing edges
        function drawSundropPetal(tipX, tipY, ctrlX1, ctrlY1, ctrlX2, ctrlY2, isFront = false) {
            ctx.save();

            // 1. Dark glowing base backing
            ctx.fillStyle = isFront ? '#b45309' : '#78350f';
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.quadraticCurveTo(ctrlX1, ctrlY1, tipX, tipY);
            ctx.quadraticCurveTo(ctrlX2, ctrlY2, 0, -6);
            ctx.fill();

            // 2. Radiant Sunny Yellow Petal Body
            ctx.fillStyle = isFront ? '#ffeb3b' : '#fdd835';
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.quadraticCurveTo(ctrlX1 * 0.9, ctrlY1 * 0.9, tipX, tipY);
            ctx.quadraticCurveTo(ctrlX2 * 0.9, ctrlY2 * 0.9, 0, -6);
            ctx.fill();

            // 3. Glowing Golden Edge Tip
            ctx.fillStyle = '#fffde7';
            ctx.fillRect(Math.floor(tipX - 1.5), Math.floor(tipY - 1.5), 3, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(Math.floor(tipX - 0.5), Math.floor(tipY - 0.5), 2, 2);

            // 4. Distinct Inner Fiery Flame Veins (Scarlet / Burnt Orange / Fire)
            const midX = (tipX) * 0.45;
            const midY = (-6 + tipY) * 0.45;
            ctx.strokeStyle = '#d84315'; // deep flame red
            ctx.lineWidth = isFront ? 3.0 : 2.2;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(midX, midY);
            ctx.lineTo(tipX * 0.72, tipY * 0.72);
            ctx.stroke();

            // Bright flame orange core stripe
            ctx.strokeStyle = '#ff5722';
            ctx.lineWidth = isFront ? 1.6 : 1.2;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(midX, midY);
            ctx.lineTo(tipX * 0.65, tipY * 0.65);
            ctx.stroke();

            // Feathered flame side branches
            ctx.fillStyle = '#bf360c';
            ctx.fillRect(Math.floor(midX - 2), Math.floor(midY - 2), 2, 2);
            ctx.fillRect(Math.floor(midX + 2), Math.floor(midY + 1), 2, 2);
            ctx.fillRect(Math.floor(midX * 0.6 - 1), Math.floor(midY * 0.6 + 1), 2, 2);
            ctx.fillRect(Math.floor(midX * 0.6 + 1), Math.floor(midY * 0.6 - 1), 2, 2);

            ctx.restore();
        }

        // --- BACK LAYER: 3 Back Petals ---
        // Petal 1: Top Center Petal (pointing up-center)
        drawSundropPetal(0, -48, -15, -28, 15, -28, false);

        // Petal 2: Top-Left Petal (pointing up-left)
        drawSundropPetal(-36, -32, -34, -12, -12, -34, false);

        // Petal 3: Top-Right Petal (pointing up-right)
        drawSundropPetal(36, -32, 12, -34, 34, -12, false);

        // --- FRONT LAYER: 3 Front Petals (Broader, flaring outward & downward) ---
        // Petal 4: Left-Front Petal (flaring wide left, dipping slightly)
        drawSundropPetal(-44, 2, -40, 16, -18, -20, true);

        // Petal 5: Right-Front Petal (flaring wide right)
        drawSundropPetal(44, 2, 18, -20, 40, 16, true);

        // Petal 6: Bottom-Center Petal (curving down toward stem)
        drawSundropPetal(0, 20, -20, 5, 20, 5, true);

        // --- 6. FLOWER'S WHITE-HOT LUMINESCENT CORE ---
        const coreGlow = ctx.createRadialGradient(0, -6, 1, 0, -6, 20);
        coreGlow.addColorStop(0, '#ffffff');
        coreGlow.addColorStop(0.35, '#fff9c4');
        coreGlow.addColorStop(0.7, '#ffca28');
        coreGlow.addColorStop(1, 'rgba(255, 202, 40, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(0, -6, 20, 0, Math.PI * 2);
        ctx.fill();

        // White-hot center pixel cluster
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -9, 6, 6);
        ctx.fillStyle = '#fffde7';
        ctx.fillRect(-5, -8, 10, 4);

        // --- 7. THE 6 LONG CURVED GOLDEN STAMENS & ANTHERS (Image 1) ---
        const stamens = [
            { endX: -16, endY: -24, cpX: -12, cpY: -15 },
            { endX: -5,  endY: -28, cpX: -3,  cpY: -18 },
            { endX: 7,   endY: -28, cpX: 5,   cpY: -18 },
            { endX: 18,  endY: -22, cpX: 14,  cpY: -14 },
            { endX: -18, endY: -12, cpX: -14, cpY: -7 },
            { endX: 18,  endY: -9,  cpX: 14,  cpY: -5 }
        ];

        stamens.forEach(s => {
            // Filament
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.quadraticCurveTo(s.cpX, s.cpY, s.endX, s.endY);
            ctx.stroke();

            // Bright Golden-Orange Anther (pollen tip)
            ctx.fillStyle = '#ff6f00';
            ctx.fillRect(s.endX - 1, s.endY - 1, 3, 2);
            ctx.fillStyle = '#fff59d';
            ctx.fillRect(s.endX, s.endY, 1, 1);
        });

        // Slender Central Pistil (Tipped with tripartite stigma)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.quadraticCurveTo(-1, -17, 0, -30);
        ctx.stroke();
        ctx.fillStyle = '#fff9c4';
        ctx.fillRect(-2, -32, 4, 2);

        // Periodic Magical Star Glint
        const glint = Math.sin(time * 0.005) > 0.65;
        if (glint) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(15, -30, 3, 3);
            ctx.fillRect(16, -33, 1, 9);
            ctx.fillRect(12, -29, 9, 1);
        }

        ctx.restore();
    }

    // ==========================================================================
    // 6. SCENIC BACKGROUND: NIGHT SKY GRADIENT, WISPY CLOUDS, MOUNTAINS
    // ==========================================================================
    function drawSkyAndStars(ctx) {
        // Deep magical night sky gradient (violet to warm horizon)
        const bands = [
            { y: 0,                  h: V_HEIGHT * 0.14, col: '#060112' },
            { y: V_HEIGHT * 0.14,    h: V_HEIGHT * 0.15, col: '#0d0422' },
            { y: V_HEIGHT * 0.29,    h: V_HEIGHT * 0.15, col: '#18073b' },
            { y: V_HEIGHT * 0.44,    h: V_HEIGHT * 0.14, col: '#290c58' }
        ];

        bands.forEach(b => {
            ctx.fillStyle = b.col;
            ctx.fillRect(0, b.y, V_WIDTH, b.h);
        });

        // Wispy stylized sweeping clouds across the sky (like Reference Image 2!)
        ctx.fillStyle = 'rgba(88, 38, 142, 0.22)';
        ctx.beginPath();
        ctx.moveTo(0, 45);
        ctx.bezierCurveTo(120, 20, 260, 60, 420, 35);
        ctx.bezierCurveTo(320, 75, 140, 50, 0, 75);
        ctx.fill();

        ctx.fillStyle = 'rgba(128, 58, 185, 0.16)';
        ctx.beginPath();
        ctx.moveTo(200, 110);
        ctx.bezierCurveTo(340, 85, 480, 120, V_WIDTH, 90);
        ctx.bezierCurveTo(500, 135, 320, 115, 200, 130);
        ctx.fill();

        // Twinkling Pixel Stars
        const time = Date.now();
        stars.forEach(s => {
            const alpha = 0.4 + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.5;
            ctx.fillStyle = s.color;
            ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });
        ctx.globalAlpha = 1.0;
    }

    function drawMountains(ctx) {
        // Distant Mountain Ridges
        ctx.fillStyle = '#100526';
        ctx.beginPath();
        ctx.moveTo(0, V_HEIGHT * 0.58);
        ctx.lineTo(80, V_HEIGHT * 0.48);
        ctx.lineTo(160, V_HEIGHT * 0.53);
        ctx.lineTo(250, V_HEIGHT * 0.46);
        ctx.lineTo(360, V_HEIGHT * 0.55);
        ctx.lineTo(V_WIDTH, V_HEIGHT * 0.49);
        ctx.lineTo(V_WIDTH, V_HEIGHT * 0.58);
        ctx.lineTo(0, V_HEIGHT * 0.58);
        ctx.fill();
    }

    // ==========================================================================
    // 7. KINGDOM OF CORONA CASTLE (Exact match to Reference Image 2)
    // Mountain island bluff, staggered village houses along hill slope,
    // arched bridge with belltower pavilion, and iconic mint-green onion domes!
    // ==========================================================================
    function drawCoronaCastle(ctx) {
        const cx = V_WIDTH * 0.74; // ~474px
        const cy = V_HEIGHT * 0.42; // ~151px
        const time = Date.now() * 0.002;

        ctx.save();

        // --- 1. LUSH CONICAL ISLAND BLUFF (Natural Sloping Hill like Image 2) ---
        ctx.fillStyle = '#0b1e14';
        ctx.beginPath();
        ctx.moveTo(cx - 100, cy + 58);
        ctx.lineTo(cx - 82, cy + 34);
        ctx.lineTo(cx - 36, cy + 10);
        ctx.lineTo(cx + 38, cy + 8);
        ctx.lineTo(cx + 82, cy + 34);
        ctx.lineTo(cx + 104, cy + 58);
        ctx.closePath();
        ctx.fill();

        // Hillside Tree Foliage & Grass
        ctx.fillStyle = '#143d26';
        ctx.beginPath();
        ctx.moveTo(cx - 90, cy + 56);
        ctx.lineTo(cx - 72, cy + 36);
        ctx.lineTo(cx + 28, cy + 14);
        ctx.lineTo(cx + 76, cy + 36);
        ctx.lineTo(cx + 94, cy + 56);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1d5434';
        ctx.fillRect(cx - 65, cy + 34, 130, 22);

        // Clustered Pine & Deciduous Trees
        ctx.fillStyle = '#092112';
        const pinePositions = [-80, -68, -48, -32, 28, 48, 66, 82, 94];
        pinePositions.forEach(px => {
            ctx.beginPath();
            ctx.moveTo(cx + px, cy + 46);
            ctx.lineTo(cx + px + 4, cy + 30);
            ctx.lineTo(cx + px + 8, cy + 46);
            ctx.fill();
        });

        // --- 2. CLUSTERED FAIRY-TALE VILLAGE HOUSES (Natural Sloping Arrangement) ---
        const villageHouses = [
            // Lower waterfront row
            { x: -74, y: 44, w: 9, h: 9, col: '#f5ebe0', roof: '#c8522c' },
            { x: -60, y: 42, w: 10, h: 10, col: '#dfd7cb', roof: '#e06d44' },
            { x: -46, y: 45, w: 8, h: 8, col: '#f5ebe0', roof: '#b03e1e' },
            { x: -34, y: 41, w: 11, h: 10, col: '#eddcd2', roof: '#ef8354' },
            { x: -20, y: 43, w: 9, h: 9, col: '#f5ebe0', roof: '#c8522c' },
            { x: -8,  y: 40, w: 10, h: 11, col: '#dfd7cb', roof: '#e06d44' },
            { x: 6,   y: 42, w: 9, h: 9, col: '#eddcd2', roof: '#b03e1e' },
            { x: 18,  y: 40, w: 11, h: 11, col: '#f5ebe0', roof: '#ef8354' },
            { x: 32,  y: 43, w: 8, h: 9, col: '#dfd7cb', roof: '#c8522c' },
            { x: 44,  y: 41, w: 10, h: 10, col: '#eddcd2', roof: '#e06d44' },
            { x: 58,  y: 44, w: 9, h: 9, col: '#f5ebe0', roof: '#b03e1e' },
            { x: 70,  y: 46, w: 9, h: 8, col: '#dfd7cb', roof: '#c8522c' },
            // Mid hill slope row
            { x: -52, y: 30, w: 9, h: 9, col: '#f5ebe0', roof: '#c8522c' },
            { x: -38, y: 27, w: 10, h: 11, col: '#eddcd2', roof: '#ef8354' },
            { x: -24, y: 29, w: 8, h: 9, col: '#dfd7cb', roof: '#e06d44' },
            { x: -12, y: 24, w: 11, h: 12, col: '#f5ebe0', roof: '#b03e1e' },
            { x: 2,   y: 26, w: 9, h: 11, col: '#eddcd2', roof: '#c8522c' },
            { x: 14,  y: 24, w: 10, h: 12, col: '#f5ebe0', roof: '#ef8354' },
            { x: 28,  y: 27, w: 9, h: 10, col: '#dfd7cb', roof: '#e06d44' },
            { x: 42,  y: 28, w: 9, h: 10, col: '#eddcd2', roof: '#b03e1e' },
            // Upper hill tier near castle walls
            { x: -30, y: 16, w: 9, h: 9, col: '#f5ebe0', roof: '#c8522c' },
            { x: -16, y: 14, w: 10, h: 10, col: '#eddcd2', roof: '#ef8354' },
            { x: 8,   y: 15, w: 9, h: 10, col: '#dfd7cb', roof: '#e06d44' },
            { x: 22,  y: 17, w: 9, h: 9, col: '#f5ebe0', roof: '#c8522c' }
        ];

        villageHouses.forEach(h => {
            const hx = cx + h.x;
            const hy = cy + h.y;
            // House wall
            ctx.fillStyle = h.col;
            ctx.fillRect(hx, hy, h.w, h.h);
            // Terracotta pitched roof
            ctx.fillStyle = h.roof;
            ctx.beginPath();
            ctx.moveTo(hx - 1, hy);
            ctx.lineTo(hx + h.w / 2, hy - 4);
            ctx.lineTo(hx + h.w + 1, hy);
            ctx.closePath();
            ctx.fill();
            // Cozy glowing candlelit window
            ctx.fillStyle = '#fff59d';
            ctx.fillRect(hx + 2, hy + 3, 2, 2);
        });

        // --- 3. THE STONE ARCHED BRIDGE & GATEHOUSE PAVILION (Reference Image 2, Lower Right) ---
        const bxStart = cx + 60;
        const bridgeY = cy + 44;
        // Stone Bridge Roadway
        ctx.fillStyle = '#e8d8c5';
        ctx.fillRect(bxStart, bridgeY, 80, 4);
        ctx.fillStyle = '#b8a690';
        ctx.fillRect(bxStart, bridgeY + 4, 80, 10);
        // Stone Arches
        for (let ax = bxStart + 6; ax < bxStart + 76; ax += 18) {
            ctx.fillStyle = '#0a0319';
            ctx.beginPath();
            ctx.arc(ax + 5, bridgeY + 14, 5, Math.PI, 0);
            ctx.fill();
        }

        // Grand Gatehouse Belltower Pavilion on Bridge (from Image 2!)
        const gx = bxStart + 22;
        const gy = bridgeY - 28;
        // Stone arch portal base
        ctx.fillStyle = '#eedfcb';
        ctx.fillRect(gx, gy + 14, 15, 16);
        ctx.fillStyle = '#0a0319';
        ctx.fillRect(gx + 3, gy + 18, 9, 12); // arch portal
        // Upper pavilion gallery
        ctx.fillStyle = '#eedfcb';
        ctx.fillRect(gx - 1, gy + 4, 17, 10);
        ctx.fillStyle = '#fff59d';
        ctx.fillRect(gx + 5, gy + 7, 5, 4);
        // Steep Terracotta Spire Roof
        ctx.fillStyle = '#c8522c';
        ctx.beginPath();
        ctx.moveTo(gx - 3, gy + 4);
        ctx.lineTo(gx + 7, gy - 14);
        ctx.lineTo(gx + 18, gy + 4);
        ctx.fill();
        ctx.fillStyle = '#ef8354';
        ctx.fillRect(gx + 6, gy - 16, 2, 3); // finial

        // --- 4. CORONA PALACE FORTRESS WALLS & KEEP ---
        // Lower Ivory Terrace Ramparts
        ctx.fillStyle = '#dfd1bf';
        ctx.fillRect(cx - 58, cy + 6, 100, 16);
        ctx.fillStyle = '#f5eee3';
        ctx.fillRect(cx - 55, cy + 8, 94, 12);
        // Crenellations
        ctx.fillStyle = '#dfd1bf';
        for (let r = -55; r < 38; r += 6) {
            ctx.fillRect(cx + r, cy + 3, 3, 4);
        }

        // --- 5. TANGLED CORONA ONION DOMES & TOWERS (Reference Image 2) ---
        function drawCoronaOnionTower(tx, ty, w, h, domeW, domeH, domeCol = '#26a69a') {
            // Ivory stone tower shaft
            ctx.fillStyle = '#eedfcb';
            ctx.fillRect(tx, ty, w, h);
            ctx.fillStyle = '#f8f2e9';
            ctx.fillRect(tx + 2, ty, w - 4, h);

            // Upper gallery rim / machicolation
            ctx.fillStyle = '#dfd1bf';
            ctx.fillRect(tx - 2, ty, w + 4, 3);

            // The Iconic Mint-Green / Turquoise Onion Dome (Cupola)
            const domeCenterX = tx + w / 2;
            const domeBaseY = ty;
            const domeTopY = ty - domeH;

            // Base neck
            ctx.fillStyle = '#00695c';
            ctx.fillRect(domeCenterX - 3, domeBaseY - 2, 6, 2);

            // Onion dome shape (curves wide then tapers to needle point)
            ctx.fillStyle = domeCol;
            ctx.beginPath();
            ctx.moveTo(domeCenterX - 3, domeBaseY - 2);
            ctx.bezierCurveTo(domeCenterX - domeW / 2, domeBaseY - domeH * 0.4, domeCenterX - domeW / 2, domeBaseY - domeH * 0.7, domeCenterX, domeTopY);
            ctx.bezierCurveTo(domeCenterX + domeW / 2, domeBaseY - domeH * 0.7, domeCenterX + domeW / 2, domeBaseY - domeH * 0.4, domeCenterX + 3, domeBaseY - 2);
            ctx.fill();

            // Mint-Green Sunlit Highlight
            ctx.fillStyle = '#80cbc4';
            ctx.fillRect(Math.floor(domeCenterX - 1), Math.floor(domeBaseY - domeH * 0.6), 2, Math.floor(domeH * 0.4));

            // Needle Spire with Gold Finial Ball
            ctx.fillStyle = '#ffd54f';
            ctx.fillRect(domeCenterX - 0.5, domeTopY - 6, 1, 6);
            ctx.fillRect(domeCenterX - 1.5, domeTopY - 7, 3, 2);

            // Tower arched windows
            ctx.fillStyle = '#fff59d';
            ctx.fillRect(tx + w / 2 - 1, ty + 6, 2, 4);
        }

        // Tower 1: THE TALLEST MAIN CENTRAL TOWER (Soaring high into sky, mint dome)
        drawCoronaOnionTower(cx + 12, cy - 60, 12, 66, 18, 22, '#26a69a');

        // Tower 2: SECOND HIGH TOWER (Left of main, mint dome)
        drawCoronaOnionTower(cx - 16, cy - 40, 11, 48, 16, 18, '#26a69a');

        // Tower 3: MID-LEFT TOWER (Mint dome)
        drawCoronaOnionTower(cx - 38, cy - 16, 10, 26, 14, 15, '#26a69a');

        // Tower 4: FAR LEFT ROUND BASTION TOWER (Mint dome)
        drawCoronaOnionTower(cx - 62, cy - 4, 9, 18, 13, 14, '#26a69a');

        // Tower 5: RIGHT TURRET (Mint dome)
        drawCoronaOnionTower(cx + 30, cy - 18, 9, 26, 13, 14, '#26a69a');

        // --- 6. CENTRAL KEEP WITH CORAL / TERRACOTTA SPIRES (Image 2) ---
        ctx.fillStyle = '#eedfcb';
        ctx.fillRect(cx - 4, cy - 26, 16, 34);
        ctx.fillStyle = '#f8f2e9';
        ctx.fillRect(cx - 2, cy - 24, 12, 30);

        // Terracotta Red Steep Pitched Roof & Spires
        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 26);
        ctx.lineTo(cx + 4, cy - 50);
        ctx.lineTo(cx + 16, cy - 26);
        ctx.fill();
        ctx.fillStyle = '#e57373';
        ctx.fillRect(cx + 3, cy - 54, 2, 5); // spire tip

        // Warm Glowing Arched Palace Windows
        const candleFlicker = Math.sin(time * 3) > 0;
        ctx.fillStyle = candleFlicker ? '#fff59d' : '#ffe082';
        ctx.fillRect(cx, cy - 16, 4, 6);
        ctx.fillRect(cx - 12, cy - 8, 3, 5);
        ctx.fillRect(cx + 16, cy - 10, 3, 5);
        ctx.fillRect(cx - 34, cy + 2, 3, 5);

        // Soft Warm Ambient Glow around Palace
        ctx.fillStyle = 'rgba(255, 224, 130, 0.16)';
        ctx.fillRect(cx - 48, cy - 22, 90, 38);

        ctx.restore();
    }

    // ==========================================================================
    // 8. CALM LAKE WATER & NATURAL REFLECTIONS
    // ==========================================================================
    function drawLakeAndReflections(ctx) {
        const horizon = V_HEIGHT * 0.58;

        // Deep calm lake water gradient
        ctx.fillStyle = '#060114';
        ctx.fillRect(0, horizon, V_WIDTH, V_HEIGHT - horizon);

        ctx.fillStyle = '#0b031f';
        ctx.fillRect(0, horizon + 14, V_WIDTH, 48);
        ctx.fillStyle = '#090218';
        ctx.fillRect(0, horizon + 62, V_WIDTH, V_HEIGHT - horizon - 62);

        // Soft Shimmering Castle Reflection
        const cx = V_WIDTH * 0.74;
        const time = Date.now() * 0.003;
        for (let y = horizon + 2; y < V_HEIGHT; y += 4) {
            const shift = Math.sin(time + y * 0.12) * 5;
            const w = Math.max(8, 52 - (y - horizon) * 0.24);
            ctx.fillStyle = 'rgba(255, 213, 79, 0.10)';
            ctx.fillRect(cx - w / 2 + shift, y, w, 2);
        }

        // Gentle Ambient Water Ripples
        ctx.fillStyle = 'rgba(128, 88, 185, 0.18)';
        for (let i = 0; i < 22; i++) {
            const ry = horizon + 4 + i * 7;
            const rx = (Math.sin(time + i * 0.8) * 50 + i * 36) % V_WIDTH;
            ctx.fillRect(rx, ry, 28, 1);
            ctx.fillRect((rx + 220) % V_WIDTH, ry, 34, 1);
            ctx.fillRect((rx + 440) % V_WIDTH, ry, 22, 1);
        }
    }

    // ==========================================================================
    // 9. THE GONDOLA BOAT: RAPUNZEL & EUGENE (Exact match to Reference Image 3)
    // Curled scroll prow & stern, hanging stern lantern, Eugene in teal vest watching,
    // Rapunzel in lilac dress leaning over boat guiding floating lantern onto lake!
    // High-resolution pixel art rendering placed gracefully to the left of the message card!
    // ==========================================================================
    function drawBoatWithRapunzelAndEugene(ctx) {
        const time = Date.now();
        const floatOffset = Math.sin(time * 0.0022) * 2.0;
        const tiltAngle = Math.cos(time * 0.0022) * 0.014;

        // Positioned gracefully on the lake in the clear left water area (free from message box)
        const bx = V_WIDTH * 0.18; // ~115px
        const by = V_HEIGHT * 0.65 + floatOffset; // ~234px

        ctx.save();
        ctx.translate(Math.floor(bx), Math.floor(by));
        ctx.scale(1.08, 1.08);
        ctx.rotate(tiltAngle);

        // --- 1. GLASSY WATER MIRROR REFLECTION UNDER BOAT (Reference Image 3) ---
        ctx.fillStyle = 'rgba(10, 3, 20, 0.65)';
        ctx.fillRect(-52, 17, 108, 9);
        ctx.fillRect(-42, 26, 88, 6);

        // Reflection of Rapunzel's purple dress & golden hair
        ctx.fillStyle = 'rgba(142, 36, 170, 0.28)';
        ctx.fillRect(10, 19, 32, 7);
        ctx.fillStyle = 'rgba(255, 213, 79, 0.30)';
        ctx.fillRect(22, 22, 28, 10); // golden hair reflection

        // Reflection of Eugene's teal vest
        ctx.fillStyle = 'rgba(25, 118, 210, 0.25)';
        ctx.fillRect(-32, 19, 22, 7);

        // Radiant reflection of the floating lantern in the water
        ctx.fillStyle = 'rgba(255, 193, 7, 0.42)';
        ctx.fillRect(40, 19, 22, 14);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
        ctx.fillRect(45, 21, 10, 8);

        // --- 2. THE TANGLED GONDOLA BOAT (Curved Prow & Stern) ---
        // Dark carved mahogany outer hull
        ctx.fillStyle = '#1c0c04';
        ctx.fillRect(-50, 2, 102, 15);
        ctx.fillRect(-42, 17, 84, 3); // keel

        // Rich warm wooden planking
        ctx.fillStyle = '#3d1d0a';
        ctx.fillRect(-48, 4, 98, 11);
        ctx.fillStyle = '#5c2d12';
        ctx.fillRect(-46, 5, 94, 8);
        ctx.fillStyle = '#7a3e1b';
        ctx.fillRect(-48, 2, 98, 3);
        ctx.fillStyle = '#a05427'; // top gunwale rail
        ctx.fillRect(-52, 0, 106, 2);

        // Curved Scroll PROW (Front Right, arching high like Image 3!)
        ctx.fillStyle = '#1c0c04';
        ctx.fillRect(46, -2, 7, 6);
        ctx.fillRect(49, -8, 7, 8);
        ctx.fillRect(52, -17, 7, 10);
        ctx.fillRect(54, -25, 8, 10);
        // Curled scroll tip
        ctx.fillRect(51, -28, 9, 5);
        ctx.fillRect(48, -26, 4, 4);

        // Curved Scroll STERN (Back Left, arching high)
        ctx.fillRect(-50, -2, 7, 6);
        ctx.fillRect(-53, -8, 7, 8);
        ctx.fillRect(-56, -17, 7, 10);
        ctx.fillRect(-58, -24, 7, 8);
        // Curled scroll tip
        ctx.fillRect(-56, -27, 9, 5);
        ctx.fillRect(-51, -25, 4, 4);

        // Bench seats
        ctx.fillStyle = '#2d1406';
        ctx.fillRect(-35, 4, 16, 3); // Eugene's bench
        ctx.fillRect(16, 4, 18, 3);  // Rapunzel's bench

        // --- 3. HANGING STERN LANTERN ON METAL BRACKET (User explicit request!) ---
        ctx.strokeStyle = '#0a0503';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-54, -13);
        ctx.quadraticCurveTo(-65, -19, -65, -6);
        ctx.stroke();

        // Small hanging lantern
        const hlx = -65;
        const hly = -6;
        // Warm glowing light aura
        const sternGlow = ctx.createRadialGradient(hlx, hly + 3, 1, hlx, hly + 3, 15);
        sternGlow.addColorStop(0, 'rgba(255, 235, 59, 0.85)');
        sternGlow.addColorStop(0.5, 'rgba(255, 152, 0, 0.45)');
        sternGlow.addColorStop(1, 'rgba(255, 152, 0, 0)');
        ctx.fillStyle = sternGlow;
        ctx.beginPath();
        ctx.arc(hlx, hly + 3, 15, 0, Math.PI * 2);
        ctx.fill();

        // Lantern frame & glowing glass
        ctx.fillStyle = '#1c0c04'; // metal cap
        ctx.fillRect(hlx - 3, hly, 6, 2);
        ctx.fillStyle = '#ffb300'; // amber glass
        ctx.fillRect(hlx - 2, hly + 2, 5, 5);
        ctx.fillStyle = '#ffffff'; // flame
        ctx.fillRect(hlx - 1, hly + 3, 2, 3);
        ctx.fillStyle = '#1c0c04'; // metal base
        ctx.fillRect(hlx - 3, hly + 7, 6, 2);

        // --- 4. EUGENE (Flynn Rider) sitting on Left ---
        const ex = -22;
        const ey = -5;

        // Dark trousers & boots
        ctx.fillStyle = '#140e0a';
        ctx.fillRect(ex - 6, ey + 7, 13, 6);
        ctx.fillRect(ex - 8, ey + 10, 6, 5);

        // Belt with brass buckle
        ctx.fillStyle = '#3e200a';
        ctx.fillRect(ex - 6, ey + 5, 13, 2);
        ctx.fillStyle = '#d48b11';
        ctx.fillRect(ex - 1, ey + 5, 2, 2);

        // Signature Teal / Cerulean-Blue Doublet Vest (Reference Image 3)
        ctx.fillStyle = '#0d3745'; // shadow
        ctx.fillRect(ex - 7, ey - 5, 14, 11);
        ctx.fillStyle = '#175d74'; // signature teal
        ctx.fillRect(ex - 6, ey - 4, 12, 9);
        ctx.fillStyle = '#2282a1'; // vest highlight
        ctx.fillRect(ex - 5, ey - 3, 4, 6);

        // White Poet Shirt Sleeves & Collar
        ctx.fillStyle = '#f5f0e6';
        ctx.fillRect(ex - 9, ey - 2, 4, 7);
        ctx.fillRect(ex - 3, ey - 6, 6, 2);

        // Handsome Profile (Facing right toward Rapunzel)
        ctx.fillStyle = '#fed6b2'; // skin
        ctx.fillRect(ex - 2, ey - 15, 8, 9);
        ctx.fillRect(ex + 4, ey - 12, 3, 3); // nose
        ctx.fillStyle = '#3a2012';
        ctx.fillRect(ex, ey - 7, 4, 2);   // goatee
        ctx.fillRect(ex + 2, ey - 9, 2, 1); // soft smile

        // Eyes (Warm, affectionate gaze)
        const eugeneBlink = (Math.floor(time / 2800) % 8 === 0);
        if (!eugeneBlink) {
            ctx.fillStyle = '#3a2012';
            ctx.fillRect(ex + 2, ey - 12, 2, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(ex + 2, ey - 12, 1, 1);
        } else {
            ctx.fillStyle = '#3a2012';
            ctx.fillRect(ex + 2, ey - 11, 2, 1);
        }

        // Flynn's Swept Brown Hair
        ctx.fillStyle = '#2c160a';
        ctx.fillRect(ex - 4, ey - 18, 10, 4);
        ctx.fillRect(ex - 5, ey - 16, 3, 7);
        ctx.fillRect(ex + 3, ey - 16, 3, 4);
        ctx.fillStyle = '#4a2713';
        ctx.fillRect(ex - 3, ey - 17, 8, 2);

        // Hands resting on the boat gunwale (leaning forward watching Rapunzel lovingly)
        ctx.fillStyle = '#fed6b2';
        ctx.fillRect(ex + 5, ey + 1, 7, 3);

        // --- 5. RAPUNZEL LEANING OVER THE BOAT (Exact match to Reference Image 3!) ---
        const rx = 18;
        const ry = -4;

        // Flowing Royal Purple & Lilac Dress
        ctx.fillStyle = '#450f7c'; // skirt shadow
        ctx.fillRect(rx - 7, ry + 6, 20, 7);
        ctx.fillStyle = '#6a1b9a'; // royal purple skirt
        ctx.fillRect(rx - 6, ry + 7, 18, 6);
        ctx.fillStyle = '#8e24aa'; // lilac highlight
        ctx.fillRect(rx - 4, ry + 8, 14, 4);

        // Bodice angled forward (leaning over the side)
        ctx.fillStyle = '#7b1fa2';
        ctx.fillRect(rx - 4, ry - 3, 15, 9);
        ctx.fillStyle = '#9c27b0';
        ctx.fillRect(rx - 2, ry - 2, 13, 7);
        // Pink corset laces & neckline
        ctx.fillStyle = '#f48fb1';
        ctx.fillRect(rx + 2, ry - 1, 4, 1);
        ctx.fillRect(rx + 3, ry + 1, 4, 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rx + 1, ry - 4, 7, 2);

        // Puffed pink sleeves & arms extending down towards the water
        ctx.fillStyle = '#f06292';
        ctx.fillRect(rx + 8, ry - 2, 4, 4);
        // Arms stretching down over the gunwale towards the floating lantern
        ctx.fillStyle = '#ffe0b2'; // skin
        ctx.fillRect(rx + 11, ry + 2, 5, 5);
        ctx.fillRect(rx + 14, ry + 6, 7, 3); // hands gently guiding lantern

        // Head & Face Profile (Tilted down lovingly toward the floating lantern)
        ctx.fillStyle = '#ffe0b2';
        ctx.fillRect(rx + 3, ry - 14, 8, 9);
        ctx.fillRect(rx + 9, ry - 10, 3, 3); // cute nose
        ctx.fillStyle = '#ff80ab';
        ctx.fillRect(rx + 6, ry - 8, 3, 2);  // rosy blush
        ctx.fillStyle = '#c2185b';
        ctx.fillRect(rx + 7, ry - 6, 2, 1);  // blissful smile

        // Large Emerald-Green Eye (Looking down at the lantern)
        const rapunzelBlink = (Math.floor((time + 800) / 2800) % 8 === 0);
        if (!rapunzelBlink) {
            ctx.fillStyle = '#1b5e20';
            ctx.fillRect(rx + 6, ry - 10, 2, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(rx + 6, ry - 10, 1, 1);
        } else {
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(rx + 5, ry - 9, 3, 1);
        }

        // --- RAPUNZEL'S FLOWING GOLDEN HAIR (Cascading along boat) ---
        ctx.fillStyle = '#b45309'; // shadow
        ctx.fillRect(rx - 2, ry - 15, 8, 22);
        ctx.fillRect(rx + 4, ry + 5, 15, 8);
        ctx.fillRect(rx + 15, ry + 9, 12, 4);

        ctx.fillStyle = '#f59e0b'; // golden midtone
        ctx.fillRect(rx - 3, ry - 16, 7, 20);
        ctx.fillRect(rx + 2, ry + 3, 15, 8);
        ctx.fillRect(rx + 13, ry + 7, 12, 4);

        ctx.fillStyle = '#ffd54f'; // radiant yellow
        ctx.fillRect(rx - 4, ry - 17, 6, 18);
        ctx.fillRect(rx + 1, ry + 2, 13, 6);
        ctx.fillRect(rx + 11, ry + 6, 9, 3);

        ctx.fillStyle = '#fffde7'; // highlight glint
        ctx.fillRect(rx - 3, ry - 15, 2, 14);

        // Flowers in her hair
        ctx.fillStyle = '#ff4081'; // pink flower
        ctx.fillRect(rx - 1, ry - 10, 2, 2);
        ctx.fillStyle = '#40c4ff'; // blue flower
        ctx.fillRect(rx + 3, ry - 3, 2, 2);
        ctx.fillStyle = '#ffffff'; // white flower
        ctx.fillRect(rx + 7, ry + 3, 2, 2);

        // --- 6. THE GLOWING PAPER LANTERN ON THE WATER (Reference Image 3) ---
        const lx = rx + 20;
        const ly = ry + 2;

        // Radiant Soft Amber Bloom Lighting Up Rapunzel & Water
        const lanternGlow = 0.42 + Math.sin(time * 0.006) * 0.08;
        const boatLanternGrad = ctx.createRadialGradient(lx + 5, ly + 6, 2, lx + 5, ly + 6, 36);
        boatLanternGrad.addColorStop(0, `rgba(255, 245, 157, ${lanternGlow * 1.8})`);
        boatLanternGrad.addColorStop(0.45, `rgba(255, 179, 0, ${lanternGlow * 1.1})`);
        boatLanternGrad.addColorStop(1, 'rgba(255, 179, 0, 0)');
        ctx.fillStyle = boatLanternGrad;
        ctx.beginPath();
        ctx.arc(lx + 5, ly + 6, 36, 0, Math.PI * 2);
        ctx.fill();

        // Cylindrical Paper Body
        ctx.fillStyle = '#e65100'; // outer rim shadow
        ctx.fillRect(lx - 1, ly, 11, 15);
        ctx.fillStyle = '#ff9800'; // warm orange paper
        ctx.fillRect(lx, ly + 1, 9, 13);
        ctx.fillStyle = '#ffeb3b'; // glowing yellow paper
        ctx.fillRect(lx + 1, ly + 2, 7, 11);

        // Corona Sun Emblem on the Lantern
        ctx.fillStyle = '#d84315';
        ctx.fillRect(lx + 3, ly + 5, 3, 2);
        ctx.fillRect(lx + 2, ly + 6, 5, 2);

        // Burning Flame Core (White-hot candle flame)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(lx + 3, ly + 6, 3, 4);

        // Floating Water Contact Line
        ctx.fillStyle = '#421a00';
        ctx.fillRect(lx - 1, ly + 14, 11, 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(lx - 2, ly + 15, 13, 1);

        ctx.restore();
    }

    // ==========================================================================
    // 10. MAIN 60 FPS RENDER LOOP
    // ==========================================================================
    function render() {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Center and scale virtual pixel canvas
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // 1. Sky Gradient, Wispy Clouds & Twinkling Stars
        drawSkyAndStars(ctx);

        // 2. Distant Mountains
        drawMountains(ctx);

        // 3. Kingdom of Corona Castle (Island bluff, village houses along slope, arched bridge, mint-green onion domes)
        drawCoronaCastle(ctx);

        // 4. Calm Lake Water & Reflections
        drawLakeAndReflections(ctx);

        // 5. Wooden Gondola with Rapunzel & Eugene ("I See the Light" scene)
        drawBoatWithRapunzelAndEugene(ctx);

        // 6. Floating Sky Lanterns
        lanterns.forEach(lantern => {
            lantern.update();
            lantern.draw(ctx);
        });

        // 7. Update & Draw the Tangled Sun-Drop Flower
        updateFlower();
        drawPixelSunDropFlower(ctx);

        // 8. Sparkles update and draw
        sparkles.forEach((s, index) => {
            s.x += s.vx;
            s.y += s.vy;
            s.life--;
            const alpha = s.life / s.maxLife;
            ctx.fillStyle = s.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 2, 2);
            if (s.life <= 0) sparkles.splice(index, 1);
        });
        ctx.globalAlpha = 1.0;

        ctx.restore();

        requestAnimationFrame(render);
    }

    // Start Animation Loop
    requestAnimationFrame(render);

})();
