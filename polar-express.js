/* ============================================================================
   THE POLAR EXPRESS: NORTH POLE EXPEDITION 90°N (HIGH-END CINEMATIC 2D PIXEL ART ENGINE)
   - Zero AI Images • Zero Sound / Audio • Pure Procedural Canvas 2D
   - True Multi-Layer Parallax Scrolling (Alps, Pines, Viaduct, Rails, Snow Valley)
   - Grand Alpine Stone Arch Viaduct over Snowy Pine Valley & Frozen Turquoise Lake
   - Cozy Illuminated Log Cabin with Smoking Chimney nestled in the Valley Snow
   - Berkshire 2-8-4 Locomotive with Volumetric Headlight, Animated Pistons & Snow Spray
   - Cozy Glowing Pullman Passenger Coaches with Passengers, Wreaths & Cocoa Silhouettes
   - Observation Lounge Car with Wrought-Iron Balcony & Ruby Drumhead Glow
   - Multi-Layered Dancing Aurora Borealis (Emerald, Mint, Cyan, Violet, Celestial Gold)
   - Lush Tiered Pine Trees with Marshmallow Snowdrifts & Twinkling Holiday Lights
   - Clean Celestial Stardust Streaming from the Ethereal Top Header Banner
   ============================================================================ */

(function () {
    'use strict';

    // Virtual Internal Pixel Resolution for crisp retro 16/32-bit aesthetics
    const VW = 640;
    const VH = 360;

    class PolarExpressEngine {
        constructor() {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');

            // Internal offscreen buffer canvas for pristine integer-ratio pixel scaling
            this.offCanvas = document.createElement('canvas');
            this.offCanvas.width = VW;
            this.offCanvas.height = VH;
            this.offCtx = this.offCanvas.getContext('2d');
            this.offCtx.imageSmoothingEnabled = false;

            // Engine timing & scale
            this.time = 0;
            this.lastFrameTime = performance.now();
            this.scale = 1;
            this.offsetX = 0;
            this.offsetY = 0;
            this.speedMultiplier = 1.0;

            // World & Train Motion Physics (High-speed scenic cruise!)
            this.trainSpeed = 115; // pixels per second
            this.worldScrollX = 0;

            // Collections
            this.stars = [];
            this.shootingStars = [];
            this.steamPuffs = [];
            this.snowflakes = [];
            this.snowGlints = [];
            this.magicStars = [];
            this.pineTrees = [];
            this.mountainPeaksFar = [];
            this.mountainPeaksMid = [];

            // Timing trackers
            this.lastSteamTime = 0;
            this.lastShootingStarTime = 0;

            this.initWorld();
            this.bindEvents();
            this.resize();

            // Start animation loop
            this.loop = this.loop.bind(this);
            requestAnimationFrame(this.loop);
        }

        // ====================================================================
        // INITIALIZATION
        // ====================================================================
        initWorld() {
            // 1. Twinkling Arctic Cosmos (240 stars)
            this.stars = [];
            for (let i = 0; i < 240; i++) {
                const colorRand = Math.random();
                let color = '#ffffff';
                if (colorRand < 0.28) color = '#bae6fd'; // Ice cyan
                else if (colorRand < 0.50) color = '#fef08a'; // Starlight gold
                else if (colorRand < 0.65) color = '#e9d5ff'; // Aurora violet

                this.stars.push({
                    x: Math.random() * VW,
                    y: Math.random() * (VH * 0.58),
                    size: Math.random() > 0.88 ? 2 : 1,
                    baseAlpha: 0.35 + Math.random() * 0.65,
                    twinkleSpeed: 1.2 + Math.random() * 3.5,
                    phase: Math.random() * Math.PI * 2,
                    color: color
                });
            }

            // 2. Procedural Mountain Peaks (Far & Mid Layers for Parallax)
            this.mountainPeaksFar = [
                {x: 0, y: 168}, {x: 45, y: 142}, {x: 95, y: 158}, {x: 145, y: 134},
                {x: 200, y: 154}, {x: 255, y: 128}, {x: 310, y: 152}, {x: 370, y: 124},
                {x: 425, y: 148}, {x: 485, y: 132}, {x: 540, y: 154}, {x: 600, y: 136},
                {x: 660, y: 158}, {x: 720, y: 130}, {x: 780, y: 155}, {x: 840, y: 126},
                {x: 900, y: 150}, {x: 960, y: 135}, {x: 1024, y: 156}
            ];

            this.mountainPeaksMid = [
                {x: 0, y: 195}, {x: 60, y: 172}, {x: 125, y: 188}, {x: 185, y: 165},
                {x: 250, y: 184}, {x: 315, y: 162}, {x: 380, y: 186}, {x: 445, y: 160},
                {x: 510, y: 182}, {x: 575, y: 166}, {x: 640, y: 188}, {x: 705, y: 164},
                {x: 770, y: 185}, {x: 835, y: 162}, {x: 900, y: 184}, {x: 965, y: 168},
                {x: 1024, y: 190}
            ];

            // 3. Procedural Pine Forest Cluster (repeats infinitely across parallax)
            this.pineTrees = [];
            const pineSpacing = 42;
            const totalPines = 32;
            for (let i = 0; i < totalPines; i++) {
                const px = i * pineSpacing + (Math.random() * 16 - 8);
                const py = 236 + (Math.sin(i * 1.3) * 12);
                const h = 44 + Math.floor(Math.random() * 26);
                const w = 26 + Math.floor(Math.random() * 14);
                const hasLights = (i % 3 === 0);
                this.pineTrees.push({
                    x: px,
                    y: py,
                    h: h,
                    w: w,
                    hasLights: hasLights,
                    lightColor: (i % 4 === 0) ? '#fde047' : ((i % 4 === 1) ? '#ef4444' : ((i % 4 === 2) ? '#38bdf8' : '#34d399')),
                    snowWeight: 0.85 + Math.random() * 0.35
                });
            }

            // 4. Multilayer Blizzard Snowflakes (220 flakes whipping with polar wind)
            this.snowflakes = [];
            for (let i = 0; i < 220; i++) {
                const layer = Math.random() < 0.45 ? 0 : (Math.random() < 0.78 ? 1 : 2);
                this.snowflakes.push({
                    x: Math.random() * VW,
                    y: Math.random() * VH,
                    layer: layer,
                    size: layer === 0 ? 1 : (layer === 1 ? 1.5 : 2.5),
                    vx: layer === 0 ? -1.8 - Math.random() * 1.0 : (layer === 1 ? -3.2 - Math.random() * 1.5 : -5.0 - Math.random() * 2.2),
                    vy: layer === 0 ? 0.7 + Math.random() * 0.5 : (layer === 1 ? 1.4 + Math.random() * 0.7 : 2.2 + Math.random() * 1.2),
                    swayAmp: 0.8 + Math.random() * 1.6,
                    swayPhase: Math.random() * Math.PI * 2,
                    alpha: layer === 0 ? 0.45 : (layer === 1 ? 0.75 : 0.95)
                });
            }

            // 5. Diamond Snow Glints in Snowbanks
            this.snowGlints = [];
            for (let i = 0; i < 70; i++) {
                this.snowGlints.push({
                    x: Math.random() * 800,
                    y: 242 + Math.random() * 105,
                    seed: Math.random() * 100
                });
            }
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());

            // Speed toggle button
            const speedBtn = document.getElementById('camera-speed-btn');
            if (speedBtn) {
                speedBtn.addEventListener('click', () => {
                    if (this.speedMultiplier === 1.0) {
                        this.speedMultiplier = 1.6;
                        speedBtn.innerHTML = '<span>⚡ SPEED: EXPRESS TURBO</span>';
                    } else if (this.speedMultiplier === 1.6) {
                        this.speedMultiplier = 0.65;
                        speedBtn.innerHTML = '<span>❄️ SPEED: SCENIC CRUISE</span>';
                    } else {
                        this.speedMultiplier = 1.0;
                        speedBtn.innerHTML = '<span>⚡ SPEED: NORMAL</span>';
                    }
                });
            }

            // Magic burst button
            const magicBtn = document.getElementById('magic-burst-btn');
            if (magicBtn) {
                magicBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.castMagicBurst(VW / 2, 75, 45);
                });
            }

            // Interactive screen click: spawn healing magic stars at click position
            this.canvas.addEventListener('click', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const clickX = (e.clientX - rect.left - this.offsetX) / this.scale;
                const clickY = (e.clientY - rect.top - this.offsetY) / this.scale;
                this.castMagicBurst(clickX, clickY, 32);
            });
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx.imageSmoothingEnabled = false;

            const scaleX = this.canvas.width / VW;
            const scaleY = this.canvas.height / VH;
            this.scale = Math.min(scaleX, scaleY);

            this.offsetX = Math.floor((this.canvas.width - VW * this.scale) / 2);
            this.offsetY = Math.floor((this.canvas.height - VH * this.scale) / 2);
        }

        castMagicBurst(originX, originY, count = 28) {
            const colors = ['#fde047', '#38bdf8', '#34d399', '#f472b6', '#ffffff', '#a78bfa'];
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.0 + Math.random() * 3.2;
                this.magicStars.push({
                    x: originX + (Math.random() - 0.5) * 16,
                    y: originY + (Math.random() - 0.5) * 16,
                    vx: Math.cos(angle) * speed - 1.2,
                    vy: Math.sin(angle) * speed - 0.9,
                    size: Math.random() > 0.5 ? 3 : 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 65 + Math.random() * 65,
                    maxLife: 110,
                    twinkle: Math.random() * 10
                });
            }
        }

        // ====================================================================
        // MAIN GAME LOOP
        // ====================================================================
        loop(currentTime) {
            const dt = Math.min(0.05, (currentTime - this.lastFrameTime) / 1000);
            this.lastFrameTime = currentTime;
            this.time += dt * this.speedMultiplier;

            // Continuous Parallax World Motion
            const currentSpeed = this.trainSpeed * this.speedMultiplier;
            this.worldScrollX += currentSpeed * dt;

            // Spawn thick volumetric locomotive steam in cadence with chuffing wheels
            if (this.time - this.lastSteamTime > (0.11 / this.speedMultiplier)) {
                this.spawnLocomotiveSteam();
                this.lastSteamTime = this.time;
            }

            // Spawn celestial shooting stars
            if (this.time - this.lastShootingStarTime > 4.2 && Math.random() < 0.05) {
                this.spawnShootingStar();
                this.lastShootingStarTime = this.time;
            }

            // Continuously spawn gentle celestial stardust drifting down from the top banner
            if (Math.random() < 0.35) {
                this.magicStars.push({
                    x: 60 + Math.random() * (VW - 120),
                    y: 18 + Math.random() * 26,
                    vx: -1.0 + (Math.random() - 0.5) * 0.8,
                    vy: 0.4 + Math.random() * 0.6,
                    size: Math.random() > 0.6 ? 3 : 2,
                    color: Math.random() > 0.5 ? '#fde047' : (Math.random() > 0.5 ? '#67e8f9' : '#34d399'),
                    life: 40 + Math.random() * 35,
                    maxLife: 75,
                    twinkle: Math.random() * 5
                });
            }

            // Update entities (steam, snow, stars)
            this.updateEntities(dt);

            // Render 2D pixel scene onto offscreen buffer
            this.renderScene(this.offCtx);

            // Blit crisp offscreen buffer onto display canvas
            this.ctx.fillStyle = '#01030a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.imageSmoothingEnabled = false;
            this.ctx.drawImage(
                this.offCanvas,
                0, 0, VW, VH,
                this.offsetX, this.offsetY,
                VW * this.scale, VH * this.scale
            );

            requestAnimationFrame(this.loop);
        }

        // ====================================================================
        // ENTITY UPDATES
        // ====================================================================
        spawnLocomotiveSteam() {
            const locoScreenX = 465 + Math.sin(this.time * 1.5) * 6;
            const locoScreenY = 205 + Math.sin(this.time * 26) * 1.2;

            for (let i = 0; i < 2; i++) {
                this.steamPuffs.push({
                    x: locoScreenX - 6 + (Math.random() - 0.5) * 5,
                    y: locoScreenY - 18,
                    vx: -3.8 - Math.random() * 2.5 - (this.trainSpeed * 0.015),
                    vy: -0.7 - Math.random() * 0.9,
                    size: 5 + Math.random() * 3,
                    maxSize: 28 + Math.random() * 14,
                    alpha: 0.9,
                    life: 0,
                    maxLife: 60 + Math.random() * 35,
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.08
                });
            }

            if (Math.random() < 0.5) {
                this.steamPuffs.push({
                    x: locoScreenX - 10 + Math.random() * 18,
                    y: locoScreenY + 20,
                    vx: -2.8 - Math.random() * 1.8,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: 4,
                    maxSize: 14,
                    alpha: 0.7,
                    life: 0,
                    maxLife: 38,
                    rot: 0,
                    rotSpeed: 0
                });
            }
        }

        spawnShootingStar() {
            this.shootingStars.push({
                x: 60 + Math.random() * 420,
                y: 8 + Math.random() * 45,
                vx: 6.2 + Math.random() * 2.8,
                vy: 2.4 + Math.random() * 1.6,
                life: 26,
                maxLife: 26
            });
        }

        updateEntities(dt) {
            // 1. Steam Puffs Physics
            for (let i = this.steamPuffs.length - 1; i >= 0; i--) {
                const sp = this.steamPuffs[i];
                sp.life++;
                sp.x += sp.vx * (dt * 60);
                sp.y += sp.vy * (dt * 60);
                sp.rot += sp.rotSpeed;

                const progress = sp.life / sp.maxLife;
                sp.currentSize = sp.size + (sp.maxSize - sp.size) * Math.sin(progress * Math.PI * 0.85);

                if (progress < 0.2) {
                    sp.currentAlpha = sp.alpha * (progress / 0.2);
                } else {
                    sp.currentAlpha = sp.alpha * (1 - (progress - 0.2) / 0.8);
                }

                if (sp.life >= sp.maxLife) {
                    this.steamPuffs.splice(i, 1);
                }
            }

            // 2. Shooting Stars
            for (let i = this.shootingStars.length - 1; i >= 0; i--) {
                const ss = this.shootingStars[i];
                ss.x += ss.vx * (dt * 60);
                ss.y += ss.vy * (dt * 60);
                ss.life--;
                if (ss.life <= 0) {
                    this.shootingStars.splice(i, 1);
                }
            }

            // 3. Interactive Magic Stars
            for (let i = this.magicStars.length - 1; i >= 0; i--) {
                const m = this.magicStars[i];
                m.life--;
                m.x += m.vx * (dt * 60);
                m.y += m.vy * (dt * 60);
                m.vy += 0.012;
                m.twinkle += 0.2;
                if (m.life <= 0) {
                    this.magicStars.splice(i, 1);
                }
            }

            // 4. Blizzard Snowflakes Rushing with Polar Wind
            for (let i = 0; i < this.snowflakes.length; i++) {
                const f = this.snowflakes[i];
                f.x += f.vx * (dt * 60) * this.speedMultiplier;
                f.y += f.vy * (dt * 60);
                f.x += Math.sin(this.time * 2.5 + f.swayPhase) * f.swayAmp;

                if (f.x < -10) f.x = VW + 10;
                if (f.y > VH + 10) {
                    f.y = -6;
                    f.x = Math.random() * (VW + 80);
                }
            }
        }

        // ====================================================================
        // SCENE RENDERING PIPELINE (WITH TRUE MULTI-LAYER PARALLAX)
        // ====================================================================
        renderScene(ctx) {
            const t = this.time;
            const scroll = this.worldScrollX;

            // 1. Polar Night Sky, Full Moon & Twinkling Cosmos
            this.drawSkyAndCosmos(ctx, t);

            // 2. Multi-Layered Dancing Aurora Borealis (High-Luminance Northern Lights)
            this.drawAuroraBorealis(ctx, t);

            // 3. Ethereal Stardust Cascade from Above (Clean, magical stardust drift)
            this.drawCelestialStardustCascade(ctx, t);

            // 4. Parallax Layer 1: Distant Epic Glacial Alps (Slow Parallax 0.12x)
            this.drawFarGlaciersParallax(ctx, scroll * 0.12, t);

            // 5. Parallax Layer 2: Midground Glaciers, North Pole Citadel & Spire (0.28x)
            this.drawMidGlaciersAndCitadel(ctx, scroll * 0.28, t);

            // 6. Parallax Layer 3: Frozen Fjord Basin & Snow Dunes (0.45x)
            this.drawFrozenFjordBasin(ctx, scroll * 0.45, t);

            // 7. Parallax Layer 4: Dense Snowy Pine Forest with Twinkling Holiday Lights (0.75x)
            this.drawPineForestParallax(ctx, scroll * 0.75, t);

            // 8. Parallax Layer 5: Grand Alpine Stone Arch Viaduct & Snowy Pine Valley (1.0x)
            this.drawAlpineStoneViaduct(ctx, scroll * 1.0, t);

            // 9. THE POLAR EXPRESS: Berkshire Locomotive, Tender, Coaches & Volumetric Beam
            this.drawPolarExpressTrain(ctx, t);

            // 10. Billowing Volumetric Steam Puffs & Cylinder Exhaust
            this.drawVolumetricSteam(ctx, t);

            // 11. High-Speed Blizzard Snowflakes & Headlight Illuminations
            this.drawFallingBlizzard(ctx, t);

            // 12. Retro Film Vignette
            this.drawCinematicVignette(ctx);
        }

        // ====================================================================
        // 1. POLAR SKY, FULL MOON & STARFIELD
        // ====================================================================
        drawSkyAndCosmos(ctx, t) {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, 220);
            skyGrad.addColorStop(0.0, '#010309');
            skyGrad.addColorStop(0.35, '#030b20');
            skyGrad.addColorStop(0.70, '#081d42');
            skyGrad.addColorStop(1.0, '#0d2d56');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, VW, 230);

            for (let i = 0; i < this.stars.length; i++) {
                const s = this.stars[i];
                const shimmer = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase);
                const a = Math.max(0.12, s.baseAlpha * shimmer);

                ctx.fillStyle = s.color;
                ctx.globalAlpha = a;

                if (s.size === 2 && shimmer > 0.8) {
                    ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y), 4, 1);
                    ctx.fillRect(Math.round(s.x), Math.round(s.y) - 1, 1, 4);
                } else {
                    ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
                }
            }
            ctx.globalAlpha = 1.0;

            for (let i = 0; i < this.shootingStars.length; i++) {
                const ss = this.shootingStars[i];
                ctx.save();
                ctx.strokeStyle = '#bae6fd';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(ss.x - ss.vx * (ss.life / 8), ss.y - ss.vy * (ss.life / 8));
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(Math.round(ss.x) - 1, Math.round(ss.y) - 1, 3, 3);
                ctx.restore();
            }

            // Arctic Full Moon
            const moonX = 530;
            const moonY = 66;
            const moonR = 24;

            const haloGrad = ctx.createRadialGradient(moonX, moonY, moonR * 0.8, moonX, moonY, moonR * 3.4);
            haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
            haloGrad.addColorStop(0.4, 'rgba(186, 230, 253, 0.18)');
            haloGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR * 3.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fefce8';
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
            ctx.fill();

            // Pixel Crater Shading
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(moonX - 10, moonY - 8, 12, 9);
            ctx.fillRect(moonX - 6, moonY + 3, 10, 7);
            ctx.fillRect(moonX + 4, moonY - 14, 8, 8);
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(moonX - 8, moonY - 6, 7, 5);
            ctx.fillRect(moonX - 4, moonY + 5, 6, 4);
            ctx.fillRect(moonX + 6, moonY - 12, 4, 4);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
            ctx.stroke();
        }

        // ====================================================================
        // 2. MULTI-LAYERED DANCING AURORA BOREALIS
        // ====================================================================
        drawAuroraBorealis(ctx, t) {
            ctx.save();

            // Violet & Magenta Crown
            for (let x = 0; x < VW; x += 3) {
                const waveY = 52 + Math.sin(x * 0.012 + t * 0.38) * 16 + Math.cos(x * 0.024 - t * 0.28) * 9;
                const rayH = 40 + Math.sin(x * 0.07 + t * 0.55) * 16;
                const alpha = 0.24 + 0.18 * Math.sin(x * 0.045 + t * 0.35);

                const gradV = ctx.createLinearGradient(0, waveY, 0, waveY - rayH);
                gradV.addColorStop(0, `rgba(168, 85, 247, ${alpha * 0.9})`);
                gradV.addColorStop(0.5, `rgba(216, 180, 254, ${alpha * 0.7})`);
                gradV.addColorStop(1, `rgba(244, 114, 182, 0)`);
                ctx.fillStyle = gradV;
                ctx.fillRect(x, waveY - rayH, 3, rayH);
            }

            // Emerald & Mint Dancing Curtain
            for (let x = 0; x < VW; x += 2) {
                const waveY = 86 + Math.sin(x * 0.016 + t * 0.65) * 24 + Math.cos(x * 0.031 - t * 0.42) * 16 + Math.sin(x * 0.005 + t * 0.18) * 14;
                const flute = 0.42 + 0.58 * Math.sin(x * 0.10 + Math.sin(t * 0.58 + x * 0.016) * 2.2);
                const rayH = 58 + flute * 38 + Math.sin(x * 0.028 - t * 0.45) * 14;

                const gradE = ctx.createLinearGradient(0, waveY, 0, waveY - rayH);
                gradE.addColorStop(0, `rgba(5, 150, 105, ${flute * 0.95})`);
                gradE.addColorStop(0.25, `rgba(16, 185, 129, ${flute * 0.92})`);
                gradE.addColorStop(0.55, `rgba(52, 211, 153, ${flute * 0.88})`);
                gradE.addColorStop(0.82, `rgba(110, 231, 183, ${flute * 0.70})`);
                gradE.addColorStop(1, `rgba(167, 243, 208, 0)`);

                ctx.fillStyle = gradE;
                ctx.fillRect(x, waveY - rayH, 2, rayH);

                ctx.fillStyle = `rgba(16, 185, 129, ${flute * 0.5})`;
                ctx.fillRect(x, waveY, 2, 4);
            }

            // Electric Arctic Cyan Ribbon
            for (let x = 0; x < VW; x += 3) {
                const waveY = 120 + Math.sin(x * 0.022 + t * 0.82) * 18 + Math.sin(x * 0.010 - t * 0.28) * 12;
                const flute = 0.36 + 0.64 * Math.sin(x * 0.13 - t * 0.75);
                const rayH = 32 + flute * 20;

                const gradC = ctx.createLinearGradient(0, waveY, 0, waveY - rayH);
                gradC.addColorStop(0, `rgba(2, 132, 199, ${flute * 0.88})`);
                gradC.addColorStop(0.4, `rgba(6, 182, 212, ${flute * 0.82})`);
                gradC.addColorStop(0.75, `rgba(34, 211, 238, ${flute * 0.65})`);
                gradC.addColorStop(1, `rgba(186, 230, 253, 0)`);

                ctx.fillStyle = gradC;
                ctx.fillRect(x, waveY - rayH, 3, rayH);
            }

            // Shimmering Golden Magic Ribbon
            for (let x = 0; x < VW; x += 4) {
                const waveY = 98 + Math.sin(x * 0.018 - t * 0.5) * 14;
                const shimmer = 0.3 + 0.7 * Math.sin(x * 0.08 + t * 1.2);
                if (shimmer > 0.6) {
                    ctx.fillStyle = `rgba(251, 191, 36, ${shimmer * 0.35})`;
                    ctx.fillRect(x, waveY - 14, 4, 18);
                }
            }

            const ambGrad = ctx.createLinearGradient(0, 45, 0, 210);
            ambGrad.addColorStop(0, 'rgba(52, 211, 153, 0.08)');
            ambGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.11)');
            ambGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
            ctx.fillStyle = ambGrad;
            ctx.fillRect(0, 45, VW, 165);

            ctx.restore();
        }

        // ====================================================================
        // 3. ETHEREAL CELESTIAL STARDUST CASCADE (FLOWING FROM ABOVE)
        // ====================================================================
        drawCelestialStardustCascade(ctx, t) {
            ctx.save();
            for (let i = 0; i < this.magicStars.length; i++) {
                const m = this.magicStars[i];
                const alpha = Math.min(1.0, m.life / 30);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = m.color;

                const mx = Math.round(m.x);
                const my = Math.round(m.y);

                if (m.size >= 3) {
                    ctx.fillRect(mx - 1, my, 3, 1);
                    ctx.fillRect(mx, my - 1, 1, 3);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(mx, my, 1, 1);
                } else {
                    ctx.fillRect(mx, my, m.size, m.size);
                }
                ctx.restore();
            }
            ctx.restore();
        }

        // ====================================================================
        // 4. PARALLAX LAYER 1: DISTANT EPIC GLACIAL ALPS (0.12x SPEED)
        // ====================================================================
        drawFarGlaciersParallax(ctx, scrollX, t) {
            ctx.save();
            const segW = 1024;
            const offsetX = -(scrollX % segW);

            for (let r = 0; r < 2; r++) {
                const startX = offsetX + r * segW;
                if (startX > VW || startX + segW < 0) continue;

                ctx.fillStyle = '#08172c';
                ctx.beginPath();
                ctx.moveTo(startX, 215);

                for (let i = 0; i < this.mountainPeaksFar.length; i++) {
                    const pt = this.mountainPeaksFar[i];
                    ctx.lineTo(startX + pt.x, pt.y);
                }
                ctx.lineTo(startX + segW, 215);
                ctx.closePath();
                ctx.fill();

                // Snow Crests & Aurora Rim Light on Peaks
                ctx.fillStyle = '#155e75';
                for (let i = 1; i < this.mountainPeaksFar.length - 1; i += 2) {
                    const pk = this.mountainPeaksFar[i];
                    ctx.beginPath();
                    ctx.moveTo(startX + pk.x - 14, pk.y + 16);
                    ctx.lineTo(startX + pk.x, pk.y);
                    ctx.lineTo(startX + pk.x + 14, pk.y + 16);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#34d399';
                    ctx.fillRect(startX + pk.x - 3, pk.y, 6, 2);
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(startX + pk.x - 6, pk.y + 2, 12, 1);
                    ctx.fillStyle = '#155e75';
                }
            }

            const mistGrad = ctx.createLinearGradient(0, 160, 0, 205);
            mistGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
            mistGrad.addColorStop(1, 'rgba(8, 23, 44, 0.45)');
            ctx.fillStyle = mistGrad;
            ctx.fillRect(0, 160, VW, 45);

            ctx.restore();
        }

        // ====================================================================
        // 5. PARALLAX LAYER 2: MIDGROUND GLACIERS, CITADEL & SPIRE (0.28x SPEED)
        // ====================================================================
        drawMidGlaciersAndCitadel(ctx, scrollX, t) {
            ctx.save();
            const segW = 1024;
            const offsetX = -(scrollX % segW);

            for (let r = 0; r < 2; r++) {
                const startX = offsetX + r * segW;
                if (startX > VW || startX + segW < 0) continue;

                ctx.fillStyle = '#0a2240';
                ctx.beginPath();
                ctx.moveTo(startX, 235);
                for (let i = 0; i < this.mountainPeaksMid.length; i++) {
                    const pt = this.mountainPeaksMid[i];
                    ctx.lineTo(startX + pt.x, pt.y);
                }
                ctx.lineTo(startX + segW, 235);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#164e63';
                for (let i = 1; i < this.mountainPeaksMid.length - 1; i += 2) {
                    const pk = this.mountainPeaksMid[i];
                    ctx.beginPath();
                    ctx.moveTo(startX + pk.x - 18, pk.y + 20);
                    ctx.lineTo(startX + pk.x, pk.y);
                    ctx.lineTo(startX + pk.x + 18, pk.y + 20);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#e0f2fe';
                    ctx.fillRect(startX + pk.x - 2, pk.y, 4, 2);
                    ctx.fillStyle = '#164e63';
                }

                // SANTA'S NORTH POLE CITADEL & GREAT SPIRE
                const spireX = startX + 420;
                const spireY = 160;

                ctx.fillStyle = '#061325';
                ctx.fillRect(spireX - 22, spireY - 8, 44, 16);
                ctx.fillRect(spireX - 12, spireY - 18, 24, 12);
                ctx.fillRect(spireX - 4, spireY - 32, 8, 16);

                ctx.fillStyle = '#fef08a';
                ctx.fillRect(spireX - 18, spireY - 4, 4, 4);
                ctx.fillRect(spireX - 10, spireY - 4, 4, 4);
                ctx.fillRect(spireX + 6, spireY - 4, 4, 4);
                ctx.fillRect(spireX + 14, spireY - 4, 4, 4);
                ctx.fillRect(spireX - 2, spireY - 14, 5, 5);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.fillRect(spireX + 12, spireY - 22, 3, 3);
                ctx.fillRect(spireX + 14, spireY - 26, 4, 4);

                ctx.fillStyle = '#fde047';
                ctx.fillRect(spireX - 3, spireY - 36, 6, 6);
                ctx.fillRect(spireX - 6, spireY - 35, 12, 3);
                ctx.fillRect(spireX - 1, spireY - 39, 3, 11);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(spireX - 1, spireY - 35, 3, 3);

                ctx.save();
                const beaconAngle = (t * 0.55) % (Math.PI * 2);
                const beamSpread = 0.28;
                const beamLength = 240;

                const beamGrad = ctx.createRadialGradient(spireX, spireY - 35, 2, spireX, spireY - 35, beamLength);
                beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
                beamGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.25)');
                beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(spireX, spireY - 35);
                ctx.arc(spireX, spireY - 35, beamLength, beaconAngle - beamSpread, beaconAngle + beamSpread);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            ctx.restore();
        }

        // ====================================================================
        // 6. PARALLAX LAYER 3: FROZEN FJORD BASIN & ICEBERGS (0.45x SPEED)
        // ====================================================================
        drawFrozenFjordBasin(ctx, scrollX, t) {
            ctx.save();
            const segW = 640;
            const offsetX = -(scrollX % segW);

            ctx.fillStyle = '#0c264a';
            ctx.beginPath();
            ctx.moveTo(0, 212);
            ctx.bezierCurveTo(180, 202, 420, 224, VW, 210);
            ctx.lineTo(VW, 244);
            ctx.lineTo(0, 244);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#081d38';
            ctx.fillRect(0, 226, VW, 20);

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const fx = offsetX + i * 180;
                ctx.moveTo(fx, 233);
                ctx.lineTo(fx + 60, 237);
                ctx.lineTo(fx + 120, 231);
            }
            ctx.stroke();

            ctx.restore();
        }

        // ====================================================================
        // 7. PARALLAX LAYER 4: DENSE SNOWY PINES WITH FAIRY LIGHTS (0.75x SPEED)
        // ====================================================================
        drawPineForestParallax(ctx, scrollX, t) {
            ctx.save();
            const totalWidth = 32 * 42;
            const offsetX = -(scrollX % totalWidth);

            for (let r = 0; r < 2; r++) {
                const shiftX = offsetX + r * totalWidth;
                if (shiftX > VW || shiftX + totalWidth < -100) continue;

                for (let i = 0; i < this.pineTrees.length; i++) {
                    const p = this.pineTrees[i];
                    const treeX = shiftX + p.x;
                    if (treeX < -40 || treeX > VW + 40) continue;

                    this.drawCozyPineTree(ctx, treeX, p.y, p.w, p.h, p.hasLights, p.lightColor, p.snowWeight, t);
                }
            }

            for (let i = 0; i < this.snowGlints.length; i++) {
                const g = this.snowGlints[i];
                const gx = ((g.x - scrollX) % VW + VW) % VW;
                const shimmer = Math.sin(t * 3.5 + g.seed);
                if (shimmer > 0.78) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(Math.round(gx), Math.round(g.y), 1, 1);
                    if (shimmer > 0.92) {
                        ctx.fillStyle = '#7dd3fc';
                        ctx.fillRect(Math.round(gx) - 1, Math.round(g.y), 3, 1);
                        ctx.fillRect(Math.round(gx), Math.round(g.y) - 1, 1, 3);
                    }
                }
            }

            ctx.restore();
        }

        drawCozyPineTree(ctx, x, y, w, h, hasLights, lightColor, snowWeight, t) {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x - 2, y, 5, 10);

            // 4-Tier Rich Pine Boughs with Drooping Needles
            const tiers = 4;
            for (let i = 0; i < tiers; i++) {
                const tierY = y - (i * (h / tiers));
                const tierW = w * (1 - i * 0.20);
                const tierH = (h / tiers) * 1.4;

                ctx.fillStyle = (i === 0) ? '#022c22' : ((i === 1) ? '#044233' : ((i === 2) ? '#065f46' : '#059669'));
                ctx.beginPath();
                ctx.moveTo(x, tierY - tierH);
                ctx.lineTo(x + tierW * 0.25, tierY - tierH * 0.5);
                ctx.lineTo(x + tierW * 0.5, tierY);
                ctx.lineTo(x + tierW * 0.2, tierY - 2);
                ctx.lineTo(x, tierY - 1);
                ctx.lineTo(x - tierW * 0.2, tierY - 2);
                ctx.lineTo(x - tierW * 0.5, tierY);
                ctx.lineTo(x - tierW * 0.25, tierY - tierH * 0.5);
                ctx.closePath();
                ctx.fill();

                // Heavy Fluffy Marshmallow Snowdrifts
                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.moveTo(x - tierW * 0.45, tierY - 1);
                ctx.quadraticCurveTo(x, tierY - 4 - (snowWeight * 2), x + tierW * 0.45, tierY - 1);
                ctx.lineTo(x + tierW * 0.4, tierY + 2);
                ctx.quadraticCurveTo(x, tierY - 1, x - tierW * 0.4, tierY + 2);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(x - tierW * 0.35, tierY + 2, tierW * 0.7, 1);

                if (hasLights) {
                    const twinkle = Math.sin(t * 3.5 + x * 0.2 + i * 1.5);
                    if (twinkle > 0.0) {
                        ctx.fillStyle = lightColor;
                        ctx.fillRect(x - tierW * 0.3, tierY - 1, 2, 2);
                        ctx.fillRect(x + tierW * 0.3, tierY - 1, 2, 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(x - tierW * 0.3, tierY - 1, 1, 1);
                    }
                }
            }
        }

        // ====================================================================
        // 8. PARALLAX LAYER 5: GRAND ALPINE STONE ARCH VIADUCT & SNOW VALLEY (1.0x)
        // ====================================================================
        drawAlpineStoneViaduct(ctx, scrollX, t) {
            ctx.save();
            const deckY = 246;

            // 1. Deep Snowy Pine Valley Floor & Frozen Lake beneath Viaduct (y: 246 to 360)
            const valleyGrad = ctx.createLinearGradient(0, deckY, 0, VH);
            valleyGrad.addColorStop(0.0, '#06162d');
            valleyGrad.addColorStop(0.4, '#09213f');
            valleyGrad.addColorStop(0.8, '#0d2d54');
            valleyGrad.addColorStop(1.0, '#041021');
            ctx.fillStyle = valleyGrad;
            ctx.fillRect(0, deckY, VW, VH - deckY);

            // Rolling Snowbanks in Valley Below
            ctx.fillStyle = '#0f2c4e';
            ctx.beginPath();
            ctx.moveTo(0, 290);
            ctx.bezierCurveTo(160, 275, 420, 310, VW, 285);
            ctx.lineTo(VW, 360);
            ctx.lineTo(0, 360);
            ctx.closePath();
            ctx.fill();

            // Frozen Turquoise Fjord Lake in Valley Below
            ctx.fillStyle = '#0891b2';
            ctx.fillRect(0, 312, VW, 18);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(0, 316, VW, 4);

            // Distant Cozy Log Cabin nestled in Valley Snow
            const cabinPeriod = 880;
            const cabinX = ((320 - scrollX * 0.5) % cabinPeriod + cabinPeriod) % cabinPeriod;
            if (cabinX > -60 && cabinX < VW + 60) {
                const cabY = 286;
                ctx.fillStyle = '#1e1b18';
                ctx.fillRect(cabinX - 16, cabY, 32, 18);
                ctx.fillStyle = '#334155';
                ctx.fillRect(cabinX + 6, cabY - 12, 5, 12);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.fillRect(cabinX + 7, cabY - 16, 4, 4);
                ctx.fillRect(cabinX + 8, cabY - 21, 5, 5);

                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.moveTo(cabinX - 20, cabY);
                ctx.lineTo(cabinX, cabY - 10);
                ctx.lineTo(cabinX + 20, cabY);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#fde047';
                ctx.fillRect(cabinX - 11, cabY + 4, 6, 6);
                ctx.fillRect(cabinX + 3, cabY + 4, 6, 6);
                ctx.fillStyle = '#f97316';
                ctx.fillRect(cabinX - 11, cabY + 7, 6, 3);

                const cabLight = ctx.createRadialGradient(cabinX, cabY + 10, 2, cabinX, cabY + 10, 28);
                cabLight.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
                cabLight.addColorStop(1, 'rgba(251, 191, 36, 0)');
                ctx.fillStyle = cabLight;
                ctx.fillRect(cabinX - 28, cabY + 2, 56, 22);
            }

            // 2. The Solid Stone Masonry Viaduct & Arches
            const pierSpacing = 124;
            const pierOffset = -(scrollX % pierSpacing);
            const archSpan = 92;
            const pierW = 32;

            // Spandrel Stone Walls (Solid masonry between and above the arches)
            ctx.fillStyle = '#152033';
            ctx.fillRect(0, deckY, VW, 48);

            // Carved Ashlar Stone Block Masonry Texture
            ctx.fillStyle = '#1e2d44';
            for (let bx = -(scrollX % 32); bx < VW + 32; bx += 32) {
                ctx.fillRect(bx, deckY + 4, 15, 6);
                ctx.fillRect(bx + 16, deckY + 14, 15, 6);
                ctx.fillRect(bx, deckY + 24, 15, 6);
            }
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, deckY + 11, VW, 1);
            ctx.fillRect(0, deckY + 21, VW, 1);
            ctx.fillRect(0, deckY + 31, VW, 1);

            // Semicircular Arch Cutouts & Voussoirs
            for (let px = pierOffset - pierSpacing; px < VW + pierSpacing * 2; px += pierSpacing) {
                const archCenterX = px + pierW / 2 + archSpan / 2;
                const archRadius = archSpan / 2;
                const archSpringY = deckY + 44;

                ctx.save();
                ctx.beginPath();
                ctx.arc(archCenterX, archSpringY, archRadius, Math.PI, 0, false);
                ctx.lineTo(archCenterX + archRadius, VH);
                ctx.lineTo(archCenterX - archRadius, VH);
                ctx.closePath();
                ctx.clip();

                // Valley view through arch
                ctx.fillStyle = valleyGrad;
                ctx.fillRect(archCenterX - archRadius - 2, deckY + 10, archSpan + 4, VH - deckY);

                // Distant pines in valley behind the arch opening
                ctx.fillStyle = '#04221c';
                ctx.fillRect(archCenterX - 18, archSpringY + 15, 12, 28);
                ctx.fillRect(archCenterX + 8, archSpringY + 12, 14, 32);
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(archCenterX - 20, archSpringY + 18, 16, 3);
                ctx.fillRect(archCenterX + 6, archSpringY + 15, 18, 3);
                ctx.restore();

                // Stone Arch Ring (Voussoirs & Keystone)
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(archCenterX, archSpringY, archRadius, Math.PI, 0, false);
                ctx.stroke();

                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(archCenterX, archSpringY, archRadius + 2, Math.PI, 0, false);
                ctx.stroke();

                // Keystone at Arch Crown
                ctx.fillStyle = '#475569';
                ctx.fillRect(archCenterX - 4, archSpringY - archRadius - 4, 8, 8);
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(archCenterX - 2, archSpringY - archRadius - 4, 4, 2);

                // Glistening Icicles dripping from Keystone
                ctx.fillStyle = '#bae6fd';
                ctx.fillRect(archCenterX - 2, archSpringY - archRadius + 4, 2, 7);
                ctx.fillRect(archCenterX + 1, archSpringY - archRadius + 4, 1, 5);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(archCenterX - 2, archSpringY - archRadius + 4, 1, 4);
            }

            // Massive Stone Piers & Buttresses
            for (let px = pierOffset - pierSpacing; px < VW + pierSpacing * 2; px += pierSpacing) {
                ctx.fillStyle = '#152033';
                ctx.fillRect(px, deckY + 4, pierW, VH - deckY - 4);

                ctx.fillStyle = '#1e2d44';
                for (let py = deckY + 6; py < VH; py += 12) {
                    ctx.fillRect(px + 2, py, pierW - 4, 5);
                }
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(px + pierW - 2, deckY + 4, 2, VH - deckY - 4);

                // Pier Buttress Stone Cap
                ctx.fillStyle = '#334155';
                ctx.fillRect(px - 3, deckY + 36, pierW + 6, 5);
                ctx.fillStyle = '#475569';
                ctx.fillRect(px - 4, deckY + 35, pierW + 8, 2);

                // Pillowy Snow Cap on Pier Buttress
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(px - 3, deckY + 32, pierW + 6, 3);
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(px - 2, deckY + 35, pierW + 4, 1);

                // Vintage Wrought-Iron Sconce Lantern mounted on pier
                const lx = px + pierW / 2;
                const ly = deckY + 22;

                ctx.fillStyle = '#0f172a';
                ctx.fillRect(lx - 1, ly - 6, 3, 10);
                ctx.fillRect(lx - 3, ly - 7, 7, 2);
                ctx.fillRect(lx - 2, ly + 4, 5, 2);

                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(lx - 3, ly - 5, 7, 8);
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(lx - 2, ly - 4, 5, 6);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(lx - 1, ly - 3, 3, 4);

                // Cozy Amber Light Pool casting across Viaduct Stone & Snow
                const lightGrad = ctx.createRadialGradient(lx, ly, 3, lx, ly, 38);
                lightGrad.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
                lightGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
                lightGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
                ctx.fillStyle = lightGrad;
                ctx.fillRect(lx - 38, ly - 20, 76, 54);
            }

            // 3. Viaduct Heavy Stone Parapet & Pillowy Snowpack Coping
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, deckY + 2, VW, 5);
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, deckY, VW, 3);

            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, deckY - 2, VW, 3);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(0, deckY + 1, VW, 1);

            // Glistening Icicles along the Parapet Coping
            const icicleSpacing = 18;
            const icicleOffset = -(scrollX % icicleSpacing);
            ctx.fillStyle = '#bae6fd';
            for (let ix = icicleOffset - icicleSpacing; ix < VW + icicleSpacing; ix += icicleSpacing) {
                const icicleH = 5 + Math.floor(Math.sin((ix + scrollX) * 0.18) * 3) + 2;
                ctx.fillRect(ix, deckY + 4, 2, icicleH);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ix, deckY + 4, 1, Math.max(1, icicleH - 2));
                ctx.fillStyle = '#bae6fd';
            }

            // 4. Continuous High-Speed Railway Bed & Steel Rails
            const tieSpacing = 8;
            const tieOffset = -(scrollX % tieSpacing);
            ctx.fillStyle = '#1e293b';
            for (let tx = tieOffset - tieSpacing; tx < VW + tieSpacing; tx += tieSpacing) {
                ctx.fillRect(tx, deckY - 2, 5, 3);
            }

            ctx.fillStyle = '#e2e8f0';
            for (let tx = tieOffset - tieSpacing; tx < VW + tieSpacing; tx += tieSpacing) {
                ctx.fillRect(tx + 1, deckY - 3, 3, 1);
            }

            ctx.fillStyle = '#64748b';
            ctx.fillRect(0, deckY - 4, VW, 2);
            ctx.fillRect(0, deckY - 7, VW, 2);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, deckY - 5, VW, 1);
            ctx.fillRect(0, deckY - 8, VW, 1);

            // Candy-Striped North Pole 90°N Marker
            const markerPeriod = 760;
            const markerX = ((220 - scrollX) % markerPeriod + markerPeriod) % markerPeriod;
            if (markerX > -30 && markerX < VW + 30) {
                const markerY = deckY - 32;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(markerX - 2, markerY, 5, 28);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(markerX - 2, markerY + 4, 5, 4);
                ctx.fillRect(markerX - 2, markerY + 12, 5, 4);
                ctx.fillRect(markerX - 2, markerY + 20, 5, 4);
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(markerX - 3, markerY - 4, 7, 4);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(markerX - 1, markerY - 3, 2, 2);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(markerX - 18, markerY + 6, 16, 10);
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 1;
                ctx.strokeRect(markerX - 18, markerY + 6, 16, 10);
                ctx.font = '5px "Press Start 2P", monospace';
                ctx.fillStyle = '#fde047';
                ctx.fillText('90°N', markerX - 10, markerY + 13);
            }

            ctx.restore();
        }

        // ====================================================================
        // 9. THE POLAR EXPRESS (LOCOMOTIVE, TENDER, COACHES, VOLUMETRIC LIGHT)
        // ====================================================================
        drawPolarExpressTrain(ctx, t) {
            const trainSurge = Math.sin(t * 1.5) * 6 + Math.cos(t * 3.1) * 2;
            const locoX = 475 + trainSurge;
            const railsY = 240;

            const chuffBounce = Math.sin(t * 26.0) * 1.1;
            const trainY = railsY + chuffBounce;

            // VOLUMETRIC HEADLIGHT BEAM CASTING FORWARD INTO THE ARCTIC BLIZZARD
            ctx.save();
            const beamStartX = locoX + 16;
            const beamStartY = trainY - 26;
            const beamLength = 225;
            const beamSpreadY = 48;

            const headBeamGrad = ctx.createRadialGradient(
                beamStartX, beamStartY, 4,
                beamStartX + 130, beamStartY + 10, beamLength
            );
            headBeamGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
            headBeamGrad.addColorStop(0.18, 'rgba(254, 240, 138, 0.82)');
            headBeamGrad.addColorStop(0.55, 'rgba(253, 224, 71, 0.40)');
            headBeamGrad.addColorStop(1.0, 'rgba(251, 191, 36, 0.0)');

            ctx.fillStyle = headBeamGrad;
            ctx.beginPath();
            ctx.moveTo(beamStartX, beamStartY - 3);
            ctx.lineTo(beamStartX + beamLength, beamStartY - beamSpreadY);
            ctx.lineTo(beamStartX + beamLength, beamStartY + beamSpreadY + 20);
            ctx.lineTo(beamStartX, beamStartY + 3);
            ctx.closePath();
            ctx.fill();

            const railReflectGrad = ctx.createLinearGradient(beamStartX, 0, beamStartX + 160, 0);
            railReflectGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
            railReflectGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = railReflectGrad;
            ctx.fillRect(beamStartX, railsY - 8, 160, 3);
            ctx.restore();

            // 1. Observation Lounge Car (End Car at rear, ~x: 35)
            this.drawObservationCar(ctx, locoX - 396, trainY);

            // 2. Passenger Pullman Coach 2 (~x: 130)
            this.drawPassengerCoach(ctx, locoX - 300, trainY, 2);

            // 3. Passenger Pullman Coach 1 (~x: 225)
            this.drawPassengerCoach(ctx, locoX - 204, trainY, 1);

            // 4. Coal Tender Car (~x: 320)
            this.drawCoalTender(ctx, locoX - 108, trainY);

            // 5. Berkshire 2-8-4 Steam Locomotive Engine (~x: 415 to 475)
            this.drawLocomotiveEngine(ctx, locoX, trainY, t);

            // High-speed blizzard snow spray kicked up by cowcatcher
            this.drawSnowSpray(ctx, locoX + 18, trainY + 2, t);
        }

        // ====================================================================
        // LOCOMOTIVE ENGINE DETAILS
        // ====================================================================
        drawLocomotiveEngine(ctx, x, y, t) {
            const engX = x - 78;
            const engY = y - 36;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(engX + 16, engY + 8, 64, 18);

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(engX + 16, engY + 9, 64, 3);
            ctx.fillStyle = '#334155';
            ctx.fillRect(engX + 16, engY + 11, 64, 2);
            ctx.fillStyle = '#475569';
            ctx.fillRect(engX + 16, engY + 12, 64, 1);

            ctx.fillStyle = '#eab308';
            ctx.fillRect(engX + 28, engY + 8, 2, 18);
            ctx.fillRect(engX + 44, engY + 8, 2, 18);
            ctx.fillRect(engX + 60, engY + 8, 2, 18);

            ctx.fillStyle = '#090d16';
            ctx.fillRect(engX + 80, engY + 8, 8, 18);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(engX + 86, engY + 10, 2, 14);

            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(engX + 85, engY + 15, 3, 5);

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(engX + 70, engY - 2, 7, 10);
            ctx.fillStyle = '#334155';
            ctx.fillRect(engX + 69, engY - 3, 9, 2);

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(engX + 34, engY + 3, 8, 5);
            ctx.fillRect(engX + 52, engY + 4, 7, 4);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(engX + 36, engY + 2, 4, 2);

            const bellSwing = Math.sin(t * 14.0) * 1.5;
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(engX + 45 + bellSwing, engY + 4, 3, 4);

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(engX + 86, engY + 3, 7, 7);
            ctx.fillStyle = '#eab308';
            ctx.fillRect(engX + 87, engY + 2, 5, 2);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(engX + 91, engY + 4, 3, 5);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(engX + 92, engY + 5, 2, 3);

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(engX - 2, engY, 20, 26);
            ctx.fillStyle = '#334155';
            ctx.fillRect(engX - 4, engY - 1, 24, 2);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(engX - 3, engY - 3, 22, 2);

            const fireFlicker = Math.sin(t * 12) * 2;
            ctx.fillStyle = '#fde047';
            ctx.fillRect(engX + 4, engY + 5, 9, 9);
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(engX + 4, engY + 11 + fireFlicker * 0.3, 9, 3);

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(engX + 6, engY + 7, 5, 6);
            ctx.fillRect(engX + 9, engY + 6, 3, 2);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(engX + 11, engY + 8 + Math.sin(t * 5) * 1, 2, 2);

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.moveTo(engX + 82, engY + 26);
            ctx.lineTo(engX + 98, engY + 36);
            ctx.lineTo(engX + 82, engY + 36);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(engX + 86, engY + 28); ctx.lineTo(engX + 88, engY + 36);
            ctx.moveTo(engX + 90, engY + 30); ctx.lineTo(engX + 93, engY + 36);
            ctx.moveTo(engX + 94, engY + 33); ctx.lineTo(engX + 97, engY + 36);
            ctx.stroke();

            this.drawLocomotiveDriveAssembly(ctx, engX, engY + 26, t);
        }

        drawLocomotiveDriveAssembly(ctx, x, y, t) {
            const wheelRadius = 7.5;
            const wheelSpacing = 15;
            const startWheelX = x + 24;
            const wheelY = y + 5;

            const theta = (this.worldScrollX * 0.42) % (Math.PI * 2);
            const crankR = 4.2;
            const crankX = Math.cos(theta) * crankR;
            const crankY = Math.sin(theta) * crankR;

            for (let i = 0; i < 4; i++) {
                const wx = startWheelX + i * wheelSpacing;

                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(wx, wheelY, wheelRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(wx, wheelY, wheelRadius, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.arc(wx, wheelY, wheelRadius * 0.7, theta, theta + Math.PI);
                ctx.fill();

                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(wx - 1, wheelY - 1, 3, 3);
            }

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(startWheelX + 64, wheelY + 3, 4, 0, Math.PI * 2);
            ctx.arc(startWheelX + 72, wheelY + 3, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(startWheelX - 14, wheelY + 3, 4.5, 0, Math.PI * 2);
            ctx.arc(startWheelX - 22, wheelY + 3, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startWheelX + crankX, wheelY + crankY);
            ctx.lineTo(startWheelX + 3 * wheelSpacing + crankX, wheelY + crankY);
            ctx.stroke();

            const pistonSliderX = startWheelX + 54 + (crankX * 0.85);
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(pistonSliderX - 3, wheelY - 2, 7, 4);

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(startWheelX + wheelSpacing + crankX, wheelY + crankY);
            ctx.lineTo(pistonSliderX, wheelY);
            ctx.stroke();

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(startWheelX + 50, wheelY - 4, 14, 8);
            ctx.fillStyle = '#475569';
            ctx.fillRect(startWheelX + 63, wheelY - 3, 2, 6);
        }

        // ====================================================================
        // COAL TENDER CAR
        // ====================================================================
        drawCoalTender(ctx, x, y) {
            const tenX = x - 10;
            const tenY = y - 30;
            const tenW = 60;
            const tenH = 22;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(tenX, tenY + 4, tenW, tenH - 4);

            ctx.fillStyle = '#eab308';
            ctx.fillRect(tenX + 2, tenY + 8, tenW - 4, 1);
            ctx.fillRect(tenX + 2, tenY + 18, tenW - 4, 1);

            ctx.font = '5px "Press Start 2P", monospace';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText('POLAR', tenX + 10, tenY + 15);
            ctx.fillText('EXPRESS', tenX + 28, tenY + 15);

            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.moveTo(tenX + 4, tenY + 4);
            ctx.lineTo(tenX + 12, tenY - 4);
            ctx.lineTo(tenX + 26, tenY - 2);
            ctx.lineTo(tenX + 38, tenY - 6);
            ctx.lineTo(tenX + 50, tenY - 1);
            ctx.lineTo(tenX + 56, tenY + 4);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(tenX + 11, tenY - 4, 3, 1);
            ctx.fillRect(tenX + 36, tenY - 6, 4, 1);
            ctx.fillRect(tenX + 48, tenY - 2, 4, 1);

            this.drawCarBogies(ctx, tenX + 8, y - 2);
            this.drawCarBogies(ctx, tenX + tenW - 16, y - 2);
        }

        // ====================================================================
        // PULLMAN PASSENGER COACHES
        // ====================================================================
        drawPassengerCoach(ctx, x, y, coachNum) {
            const carX = x - 20;
            const carY = y - 32;
            const carW = 90;
            const carH = 24;

            ctx.fillStyle = '#064e3b';
            ctx.fillRect(carX, carY + 3, carW, carH - 3);

            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(carX, carY + 4, carW, 1);
            ctx.fillRect(carX, carY + 16, carW, 1);

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(carX - 2, carY + 1, carW + 4, 3);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(carX - 1, carY - 2, carW + 2, 3);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(carX, carY + 1, carW, 1);

            const numWindows = 5;
            const winSpacing = 16;
            const startWinX = carX + 8;

            for (let i = 0; i < numWindows; i++) {
                const wx = startWinX + i * winSpacing;
                const wy = carY + 6;

                ctx.fillStyle = '#fde047';
                ctx.fillRect(wx, wy, 11, 8);
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(wx, wy + 5, 11, 3);

                ctx.fillStyle = '#064e3b';
                ctx.fillRect(wx + 5, wy, 1, 8);
                ctx.fillRect(wx, wy + 4, 11, 1);

                ctx.fillStyle = '#062920';
                if ((coachNum + i) % 2 === 0) {
                    ctx.fillRect(wx + 1, wy + 3, 3, 4);
                    ctx.fillStyle = '#f97316';
                    ctx.fillRect(wx + 3, wy + 5, 2, 2);
                } else {
                    ctx.fillRect(wx + 6, wy + 3, 4, 4);
                    ctx.fillRect(wx + 2, wy + 4, 3, 3);
                }

                if (i === 2) {
                    ctx.fillStyle = '#15803d';
                    ctx.fillRect(wx + 3, wy + 1, 6, 2);
                    ctx.fillStyle = '#ef4444';
                    ctx.fillRect(wx + 5, wy + 1, 2, 2);
                }
            }

            const lightPoolGrad = ctx.createLinearGradient(0, y - 6, 0, y + 4);
            lightPoolGrad.addColorStop(0, 'rgba(253, 224, 71, 0.40)');
            lightPoolGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
            ctx.fillStyle = lightPoolGrad;
            ctx.fillRect(carX + 4, y - 6, carW - 8, 10);

            ctx.fillStyle = '#090d16';
            ctx.fillRect(carX + carW, carY + 4, 4, carH - 6);

            this.drawCarBogies(ctx, carX + 12, y - 2);
            this.drawCarBogies(ctx, carX + carW - 18, y - 2);
        }

        // ====================================================================
        // OBSERVATION LOUNGE CAR (END CAR)
        // ====================================================================
        drawObservationCar(ctx, x, y) {
            const carX = x - 18;
            const carY = y - 32;
            const carW = 90;
            const carH = 24;

            ctx.fillStyle = '#064e3b';
            ctx.fillRect(carX + 8, carY + 3, carW - 8, carH - 3);

            ctx.beginPath();
            ctx.arc(carX + 8, carY + 15, 11, Math.PI * 0.5, Math.PI * 1.5);
            ctx.fill();

            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(carX + 6, carY + 4, carW - 6, 1);
            ctx.fillRect(carX + 4, carY + 16, carW - 4, 1);

            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(carX + 4, carY - 2, carW - 2, 3);

            for (let i = 0; i < 4; i++) {
                const wx = carX + 20 + i * 16;
                const wy = carY + 6;
                ctx.fillStyle = '#fde047';
                ctx.fillRect(wx, wy, 11, 8);
                ctx.fillStyle = '#064e3b';
                ctx.fillRect(wx + 5, wy, 1, 8);
            }

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.strokeRect(carX - 2, carY + 12, 10, 8);
            ctx.beginPath();
            ctx.moveTo(carX + 1, carY + 12); ctx.lineTo(carX + 1, carY + 20);
            ctx.moveTo(carX + 5, carY + 12); ctx.lineTo(carX + 5, carY + 20);
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.fillRect(carX - 1, carY + 14, 4, 4);
            ctx.fillStyle = '#fca5a5';
            ctx.fillRect(carX, carY + 15, 2, 2);

            const redGlow = ctx.createRadialGradient(carX, carY + 16, 2, carX, carY + 16, 24);
            redGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
            redGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = redGlow;
            ctx.fillRect(carX - 24, carY + 4, 32, 24);

            this.drawCarBogies(ctx, carX + 22, y - 2);
            this.drawCarBogies(ctx, carX + carW - 16, y - 2);
        }

        drawCarBogies(ctx, bx, by) {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
            ctx.arc(bx + 8, by, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#334155';
            ctx.fillRect(bx - 2, by - 4, 12, 3);
        }

        drawSnowSpray(ctx, x, y, t) {
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 18; i++) {
                const px = x + 4 + Math.random() * 22;
                const py = y - Math.random() * 9;
                const size = Math.random() > 0.5 ? 2 : 1;
                ctx.globalAlpha = 0.5 + Math.random() * 0.5;
                ctx.fillRect(Math.round(px), Math.round(py), size, size);
            }
            ctx.globalAlpha = 1.0;
        }

        // ====================================================================
        // 10. BILLOWING VOLUMETRIC STEAM & SMOKE
        // ====================================================================
        drawVolumetricSteam(ctx, t) {
            ctx.save();

            for (let i = 0; i < this.steamPuffs.length; i++) {
                const sp = this.steamPuffs[i];
                if (sp.currentAlpha <= 0.01) continue;

                ctx.save();
                ctx.translate(sp.x, sp.y);
                ctx.rotate(sp.rot);

                const r = Math.max(2, sp.currentSize);

                const steamGrad = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
                steamGrad.addColorStop(0.0, `rgba(255, 255, 255, ${sp.currentAlpha * 0.95})`);
                steamGrad.addColorStop(0.4, `rgba(241, 245, 249, ${sp.currentAlpha * 0.75})`);
                steamGrad.addColorStop(0.7, `rgba(254, 240, 138, ${sp.currentAlpha * 0.35})`);
                steamGrad.addColorStop(0.9, `rgba(110, 231, 183, ${sp.currentAlpha * 0.25})`);
                steamGrad.addColorStop(1.0, 'rgba(15, 23, 42, 0)');

                ctx.fillStyle = steamGrad;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            ctx.restore();
        }

        // ====================================================================
        // 11. HIGH-SPEED BLIZZARD SNOWFLAKES & HEADLIGHT REFLECTIONS
        // ====================================================================
        drawFallingBlizzard(ctx, t) {
            const beamX1 = 470;
            const beamX2 = 640;
            const beamY1 = 195;
            const beamY2 = 255;

            for (let i = 0; i < this.snowflakes.length; i++) {
                const f = this.snowflakes[i];
                const sx = Math.round(f.x);
                const sy = Math.round(f.y);

                const inHeadlight = (sx >= beamX1 && sx <= beamX2 && sy >= beamY1 && sy <= beamY2);

                if (inHeadlight) {
                    ctx.fillStyle = '#ffffff';
                    ctx.globalAlpha = 1.0;
                    ctx.fillRect(sx, sy, Math.max(2, f.size), Math.max(2, f.size));
                    ctx.fillStyle = '#fde047';
                    ctx.fillRect(sx - 1, sy, 3, 1);
                } else {
                    ctx.fillStyle = f.layer === 0 ? '#94a3b8' : (f.layer === 1 ? '#e2e8f0' : '#ffffff');
                    ctx.globalAlpha = f.alpha;
                    ctx.fillRect(sx, sy, f.size, f.size);
                }
            }
            ctx.globalAlpha = 1.0;
        }

        // ====================================================================
        // 12. RETRO PIXEL ART CINEMATIC VIGNETTE
        // ====================================================================
        drawCinematicVignette(ctx) {
            ctx.fillStyle = 'rgba(1, 3, 10, 0.45)';
            ctx.fillRect(0, 0, VW, 2);
            ctx.fillRect(0, VH - 2, VW, 2);
            ctx.fillRect(0, 0, 2, VH);
            ctx.fillRect(VW - 2, 0, 2, VH);
        }
    }

    // Initialize when DOM ready
    window.addEventListener('DOMContentLoaded', () => {
        window.polarEngine = new PolarExpressEngine();
    });
})();
