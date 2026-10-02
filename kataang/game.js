/* ============================================================================
   KATARA & AANG: HIGH-FIDELITY 2D PIXEL ART ENGINE (AVATAR SERIES AESTHETIC)
   - Handcrafted 16-bit / 32-bit Series-Accurate Pixel Sprites & Environments
   - Katara: Authentic Hair Loopies, Southern Water Tribe Coat & Fur Trims, Betrothal Necklace
   - Aang: Air Nomad Monk Robes, Crisp Cyan Arrow Tattoos, Glider Staff, Avatar State
   - Fire Nation: Skull Mask, Conical Iron Helmet, Crimson Topknot Plume, Spiked Armor
   - Scenic Earth Kingdom Forest, Mountain Mist, Reeds & Sparkling Lake
   - 5 Dynamic Dual-Bending Combos (Water + Air Synergies)
   - Romantic Lakeside Bonfire Night: Spirit Moon, Moonlight Lake Trail, Glowing Campfire,
     Aang's 2-Month Confession Dialogue, Tender Interactive Moments
   - Built-in Web Audio API Synthesizer (Zero External Dependencies)
   ============================================================================ */

(function () {
    'use strict';

    // Virtual Internal Pixel Resolution for crisp retro rendering
    const VW = 480;
    const VH = 270;

    // ========================================================================
    // 1. PROCEDURAL SOUND & MUSIC ENGINE (Web Audio API)
    // ========================================================================
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.enabled = true;
            this.currentTrack = null;
            this.musicTimer = null;
            this.musicStep = 0;
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        playTone(freq, type = 'square', duration = 0.15, vol = 0.12, glideFreq = null) {
            if (!this.enabled || !this.ctx) return;
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                if (glideFreq) {
                    osc.frequency.exponentialRampToValueAtTime(glideFreq, this.ctx.currentTime + duration);
                }
                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {}
        }

        createNoise(duration = 0.3, vol = 0.2, filterFreq = 1000, isBandpass = false) {
            if (!this.enabled || !this.ctx) return;
            try {
                const bufferSize = this.ctx.sampleRate * duration;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = isBandpass ? 'bandpass' : 'lowpass';
                filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
                if (isBandpass) filter.Q.setValueAtTime(3, this.ctx.currentTime);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                noise.start();
            } catch (e) {}
        }

        sfxWaterSplash() {
            this.createNoise(0.4, 0.25, 1200);
            this.playTone(420, 'sine', 0.3, 0.1, 160);
        }

        sfxAirWhoosh() {
            this.createNoise(0.45, 0.22, 1800, true);
            this.playTone(600, 'sine', 0.35, 0.12, 300);
        }

        sfxFireBlast() {
            this.createNoise(0.5, 0.3, 500);
            this.playTone(180, 'sawtooth', 0.4, 0.18, 50);
        }

        sfxEnemyHit() {
            this.createNoise(0.2, 0.35, 800);
            this.playTone(150, 'triangle', 0.2, 0.3, 60);
        }

        sfxDialogueBlip() {
            this.playTone(520 + Math.random() * 80, 'sine', 0.04, 0.08);
        }

        sfxVictory() {
            const notes = [440, 554, 659, 880];
            notes.forEach((f, i) => {
                setTimeout(() => this.playTone(f, 'square', 0.25, 0.15), i * 140);
            });
        }

        sfxHeartChime() {
            const notes = [659, 830, 987, 1318];
            notes.forEach((f, i) => {
                setTimeout(() => this.playTone(f, 'sine', 0.3, 0.12), i * 100);
            });
        }

        playTrack(trackName) {
            this.init();
            if (this.currentTrack === trackName) return;
            this.currentTrack = trackName;
            if (this.musicTimer) clearInterval(this.musicTimer);

            if (trackName === 'battle') {
                this.startBattleMusic();
            } else if (trackName === 'night') {
                this.startNightMusic();
            }
        }

        startBattleMusic() {
            this.musicStep = 0;
            const bass = [110, 110, 130, 110, 146, 130, 110, 164];
            const lead = [220, 0, 261, 293, 329, 293, 261, 329, 392, 329, 293, 261, 220, 261, 293, 0];

            this.musicTimer = setInterval(() => {
                if (!this.enabled || !this.ctx) return;
                const b = bass[this.musicStep % bass.length];
                const l = lead[this.musicStep % lead.length];
                if (b > 0) this.playTone(b, 'sawtooth', 0.12, 0.08);
                if (l > 0 && Math.random() > 0.1) this.playTone(l, 'square', 0.18, 0.07);
                this.musicStep++;
            }, 180);
        }

        startNightMusic() {
            this.musicStep = 0;
            // Peaceful Avatar "The Avatar's Love" Kalimba & Flute Pentatonic Chimes
            const kalimbaNotes = [
                523.25, 659.25, 783.99, 1046.50,
                587.33, 659.25, 880.00, 783.99,
                523.25, 783.99, 659.25, 587.33,
                440.00, 523.25, 659.25, 523.25
            ];

            const flutePad = [
                261.63, 0, 329.63, 0, 392.00, 0, 440.00, 0,
                329.63, 0, 261.63, 0, 220.00, 0, 261.63, 0
            ];

            this.musicTimer = setInterval(() => {
                if (!this.enabled || !this.ctx) return;
                const k = kalimbaNotes[this.musicStep % kalimbaNotes.length];
                const f = flutePad[this.musicStep % flutePad.length];

                if (k > 0) this.playTone(k, 'sine', 0.45, 0.09);
                if (f > 0 && this.musicStep % 2 === 0) {
                    this.playTone(f, 'triangle', 0.7, 0.07);
                }

                this.musicStep++;
            }, 320);
        }

        stopMusic() {
            if (this.musicTimer) {
                clearInterval(this.musicTimer);
                this.musicTimer = null;
            }
            this.currentTrack = null;
        }

        toggle() {
            this.enabled = !this.enabled;
            if (!this.enabled) {
                this.stopMusic();
            } else if (this.currentTrack) {
                this.playTrack(this.currentTrack);
            }
            return this.enabled;
        }
    }

    // ========================================================================
    // 2. MAIN CONTROLLER & STATE
    // ========================================================================
    class KataangGame {
        constructor() {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');

            this.offCanvas = document.createElement('canvas');
            this.offCanvas.width = VW;
            this.offCanvas.height = VH;
            this.oc = this.offCanvas.getContext('2d');

            this.sound = new SoundEngine();

            this.scale = 1;
            this.offsetX = 0;
            this.offsetY = 0;

            this.state = 'INTRO';
            this.battlePhase = 1;
            this.maxPhases = 5;

            this.nightProgress = 0; 
            this.time = 0;

            // Character positions & states
            this.katara = {
                x: 140,
                y: 200,
                state: 'idle', // 'idle', 'bending', 'night_sit', 'cuddle'
                animTimer: 0,
                blush: 0
            };

            this.aang = {
                x: 80,
                y: 200,
                state: 'idle', // 'idle', 'airblast', 'scooter', 'avatar_state', 'night_sit'
                animTimer: 0,
                avatarGlow: 0,
                blush: 0
            };

            this.enemy = {
                x: 360,
                y: 200,
                type: 'Scout',
                name: 'FIRE NATION SCOUT',
                hp: 100,
                maxHp: 100,
                state: 'idle', // 'idle', 'hit'
                vx: 0,
                vy: 0,
                visible: true
            };

            this.bonfire = {
                x: 235,
                y: 205,
                active: false,
                flames: []
            };

            this.particles = [];
            this.waterRibbons = [];
            this.airRibbons = [];
            this.floatingHearts = [];
            this.stars = [];
            this.clouds = [];
            this.shootingStars = [];
            this.lotusFlowers = [
                { x: 375, y: 195, petalColor: '#f472b6' },
                { x: 420, y: 175, petalColor: '#fb7185' },
                { x: 445, y: 215, petalColor: '#f43f5e' }
            ];

            // DOM Elements
            this.topBar = document.getElementById('top-bar');
            this.battleHud = document.getElementById('battle-hud');
            this.attackMenu = document.getElementById('attack-menu');
            this.attackButtonsGrid = document.getElementById('attack-buttons');
            this.phaseCounter = document.getElementById('phase-counter');
            this.enemyNameEl = document.getElementById('enemy-name');
            this.enemyHpFill = document.getElementById('enemy-hp-fill');
            this.enemyHpText = document.getElementById('enemy-hp-text');
            this.comboBanner = document.getElementById('combo-banner');
            this.comboText = document.getElementById('combo-text');
            this.dialogueBox = document.getElementById('dialogue-box');
            this.speakerTag = document.getElementById('speaker-tag');
            this.dialogueTextEl = document.getElementById('dialogue-text');
            this.portraitAvatar = document.getElementById('portrait-avatar');
            this.nightActions = document.getElementById('night-actions');
            this.introScreen = document.getElementById('intro-screen');
            this.fadeCurtain = document.getElementById('fade-curtain');
            this.sceneIndicator = document.getElementById('scene-indicator');

            this.dialogueQueue = [];
            this.currentDialogue = null;
            this.typingTimer = null;
            this.isTyping = false;
            this.currentTextFull = '';

            this.battleScenes = [
                {
                    phase: 1,
                    enemyName: 'FIRE NATION SCOUT',
                    enemyType: 'Scout',
                    moves: [
                        {
                            id: 'water_whip',
                            name: 'WATER WHIP',
                            icon: '🌊',
                            desc: 'Katara lashes a crisp, cutting stream of water!',
                            synergy: 'AANG: Air Blast Gust accelerates whip to hydro-speed!',
                            damage: 100
                        },
                        {
                            id: 'water_slice',
                            name: 'HYDRO CRESCENT',
                            icon: '💧',
                            desc: 'Curving twin water blades slicing forward!',
                            synergy: 'AANG: Gale vortex swirls and shatters the enemy shields!',
                            damage: 100
                        }
                    ]
                },
                {
                    phase: 2,
                    enemyName: 'FIRE NATION VANGUARD',
                    enemyType: 'Vanguard',
                    moves: [
                        {
                            id: 'ice_spikes',
                            name: 'ICE SPIKE BARRAGE',
                            icon: '❄️',
                            desc: 'Katara flash-freezes water droplets into gleaming darts!',
                            synergy: 'AANG: Air Scooter Blizzard spins shards in a spiral cyclone!',
                            damage: 100
                        },
                        {
                            id: 'glacial_lance',
                            name: 'GLACIAL LANCE',
                            icon: '🧊',
                            desc: 'Solid piercing icicle forged from the lake moisture!',
                            synergy: 'AANG: Hurricane gust catapults lance directly into armor!',
                            damage: 100
                        }
                    ]
                },
                {
                    phase: 3,
                    enemyName: 'FIRE NATION FLAME DUO',
                    enemyType: 'Duo',
                    moves: [
                        {
                            id: 'octopus_form',
                            name: 'OCTOPUS WATER FORM',
                            icon: '🐙',
                            desc: 'Katara manifests eight swirling water tentacles encircling her!',
                            synergy: 'AANG: Air Twister Cyclone lifts the tentacles into a maelstrom!',
                            damage: 100
                        },
                        {
                            id: 'water_dome',
                            name: 'TIDAL RING DEFENSE',
                            icon: '🛡️',
                            desc: 'A rushing torrent ring extinguishing incoming fire!',
                            synergy: 'AANG: Aerial blast converts ring into an outward concussive shockwave!',
                            damage: 100
                        }
                    ]
                },
                {
                    phase: 4,
                    enemyName: 'IMPERIAL FIREBENDER CAPTAIN',
                    enemyType: 'Captain',
                    moves: [
                        {
                            id: 'lake_tidal_wave',
                            name: 'LAKE TIDAL WAVE',
                            icon: '🌊',
                            desc: 'Katara draws a colossal cresting surge from the lake!',
                            synergy: 'AANG: Glider Gale Hurricane drives the wave over the entire squad!',
                            damage: 100
                        },
                        {
                            id: 'torrent_geyser',
                            name: 'TORRENTIAL GEYSER',
                            icon: '💦',
                            desc: 'Erupts an enormous geyser directly beneath the enemies!',
                            synergy: 'AANG: High-altitude air compression slams them into the water!',
                            damage: 100
                        }
                    ]
                },
                {
                    phase: 5,
                    enemyName: 'FIRE SUPREME COMMANDER',
                    enemyType: 'Commander',
                    moves: [
                        {
                            id: 'twin_water_dragons',
                            name: 'TWIN WATER DRAGONS',
                            icon: '🐉',
                            desc: 'Katara bends two roaring, serpentine water dragons across the sky!',
                            synergy: 'AANG: AVATAR STATE! Radiant glowing arrows unleash an ultimate Air Vortex!',
                            damage: 100
                        },
                        {
                            id: 'oceanic_maelstrom',
                            name: 'OCEANIC MAELSTROM',
                            icon: '🌀',
                            desc: 'Bends the entire lake basin into a shimmering liquid cyclone!',
                            synergy: 'AANG: AVATAR STATE! Four-element resonance blasts the Commander into the stars!',
                            damage: 100
                        }
                    ]
                }
            ];

            this.initWorld();
            this.bindEvents();
            this.resize();
            this.loop = this.loop.bind(this);
            requestAnimationFrame(this.loop);
        }

        initWorld() {
            this.stars = [];
            for (let i = 0; i < 110; i++) {
                this.stars.push({
                    x: Math.random() * VW,
                    y: Math.random() * (VH * 0.58),
                    size: Math.random() > 0.85 ? 2 : 1,
                    baseAlpha: 0.35 + Math.random() * 0.65,
                    twinkleSpeed: 1 + Math.random() * 3,
                    phase: Math.random() * Math.PI * 2
                });
            }

            this.clouds = [
                { x: 30, y: 20, w: 75, h: 22, speed: 0.14 },
                { x: 190, y: 35, w: 95, h: 26, speed: 0.11 },
                { x: 350, y: 18, w: 80, h: 24, speed: 0.16 },
                { x: 490, y: 40, w: 100, h: 28, speed: 0.09 }
            ];

            this.bonfire.flames = [];
            for (let i = 0; i < 28; i++) {
                this.bonfire.flames.push({
                    x: (Math.random() - 0.5) * 16,
                    y: Math.random() * 18,
                    vy: 0.6 + Math.random() * 1.4,
                    size: 3 + Math.random() * 4,
                    life: Math.random() * 30,
                    maxLife: 20 + Math.random() * 22
                });
            }
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx.imageSmoothingEnabled = false;

            const scaleX = this.canvas.width / VW;
            const scaleY = this.canvas.height / VH;
            this.scale = Math.max(scaleX, scaleY);

            this.offsetX = (this.canvas.width - VW * this.scale) / 2;
            this.offsetY = (this.canvas.height - VH * this.scale) / 2;
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());

            const soundBtn = document.getElementById('sound-btn');
            const soundIcon = document.getElementById('sound-icon');
            const soundText = document.getElementById('sound-text');
            soundBtn.addEventListener('click', () => {
                const on = this.sound.toggle();
                soundIcon.textContent = on ? '🔊' : '🔇';
                soundText.textContent = on ? 'SOUND: ON' : 'SOUND: OFF';
            });

            const startBtn = document.getElementById('start-btn');
            startBtn.addEventListener('click', () => this.startAdventure());

            const restartBtn = document.getElementById('restart-btn');
            restartBtn.addEventListener('click', () => this.restartGame());

            window.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    if (this.dialogueBox && !this.dialogueBox.classList.contains('hidden')) {
                        this.advanceDialogue();
                    }
                }
            });

            this.dialogueBox.addEventListener('click', () => {
                this.advanceDialogue();
            });
        }

        // ====================================================================
        // STORY FLOW & STATES
        // ====================================================================
        startAdventure() {
            this.sound.init();
            this.introScreen.classList.remove('active');
            this.introScreen.classList.add('hidden');

            this.state = 'AMBUSH_DIALOGUE';
            this.sceneIndicator.textContent = 'FOREST AMBUSH!';
            this.sound.playTrack('battle');

            this.queueDialogue([
                {
                    speaker: 'FIRE NATION SCOUT',
                    style: 'fire',
                    avatar: 'fire',
                    text: 'HALT! It’s the Water Tribe peasant and the Avatar! ATTACK THEM!!'
                },
                {
                    speaker: 'KATARA',
                    style: 'katara',
                    avatar: 'katara',
                    text: 'AANG!! They’re trying to burn down the forest! Let’s attack them!'
                },
                {
                    speaker: 'AANG',
                    style: 'aang',
                    avatar: 'aang',
                    text: 'I’ve got your back, Katara! Pick your waterbending move, and I’ll back you up with air!'
                }
            ], () => {
                this.startBattlePhase(1);
            });
        }

        queueDialogue(dialogues, onComplete) {
            this.dialogueQueue = [...dialogues];
            this.onDialogueComplete = onComplete;
            this.dialogueBox.classList.remove('hidden');
            this.showNextDialogue();
        }

        showNextDialogue() {
            if (this.dialogueQueue.length === 0) {
                this.dialogueBox.classList.add('hidden');
                if (this.onDialogueComplete) {
                    const cb = this.onDialogueComplete;
                    this.onDialogueComplete = null;
                    cb();
                }
                return;
            }

            const d = this.dialogueQueue.shift();
            this.currentDialogue = d;
            this.speakerTag.textContent = d.speaker;
            this.speakerTag.className = `speaker-tag ${d.style || ''}`;

            this.drawPortrait(d.avatar);
            this.typeText(d.text);
        }

        advanceDialogue() {
            if (this.isTyping) {
                if (this.typingTimer) clearInterval(this.typingTimer);
                this.isTyping = false;
                this.dialogueTextEl.textContent = this.currentTextFull;
                return;
            }
            this.showNextDialogue();
        }

        typeText(fullText) {
            this.currentTextFull = fullText;
            this.dialogueTextEl.textContent = '';
            this.isTyping = true;
            let charIndex = 0;

            if (this.typingTimer) clearInterval(this.typingTimer);
            this.typingTimer = setInterval(() => {
                if (charIndex < fullText.length) {
                    this.dialogueTextEl.textContent += fullText.charAt(charIndex);
                    if (charIndex % 3 === 0) this.sound.sfxDialogueBlip();
                    charIndex++;
                } else {
                    clearInterval(this.typingTimer);
                    this.isTyping = false;
                }
            }, 24);
        }

        // ====================================================================
        // 5 BATTLE PHASES
        // ====================================================================
        startBattlePhase(phaseNum) {
            this.state = 'BATTLE';
            this.battlePhase = phaseNum;
            const sceneData = this.battleScenes[phaseNum - 1];

            this.sceneIndicator.textContent = `BATTLE: SCENE ${phaseNum} OF 5`;
            this.phaseCounter.textContent = `${phaseNum} / 5`;
            this.enemyNameEl.textContent = sceneData.enemyName;
            this.enemy.name = sceneData.enemyName;
            this.enemy.type = sceneData.enemyType;
            this.enemy.hp = 100;
            this.enemy.x = 360;
            this.enemy.y = 200;
            this.enemy.vx = 0;
            this.enemy.vy = 0;
            this.enemy.state = 'idle';
            this.enemy.visible = true;
            this.updateHpBar(100);

            this.battleHud.classList.remove('hidden');
            this.attackMenu.classList.remove('hidden');
            this.comboBanner.classList.add('hidden');

            this.renderAttackOptions(sceneData.moves);
        }

        renderAttackOptions(moves) {
            this.attackButtonsGrid.innerHTML = '';
            moves.forEach((m, idx) => {
                const card = document.createElement('div');
                card.className = 'attack-card';
                card.innerHTML = `
                    <div class="attack-card-header">
                        <span class="attack-name">${m.icon} [${idx + 1}] ${m.name}</span>
                        <span class="attack-combo-tag">DUAL COMBO</span>
                    </div>
                    <p class="attack-desc">${m.desc}</p>
                    <p class="attack-synergy">${m.synergy}</p>
                `;
                card.addEventListener('click', () => {
                    this.executeDualAttack(m);
                });
                this.attackButtonsGrid.appendChild(card);
            });
        }

        executeDualAttack(move) {
            this.attackMenu.classList.add('hidden');

            this.katara.state = 'bending';
            this.sound.sfxWaterSplash();
            this.triggerWaterAttack(move.id);

            setTimeout(() => {
                this.aang.state = (this.battlePhase === 5) ? 'avatar_state' : 'airblast';
                if (this.battlePhase === 5) {
                    this.aang.avatarGlow = 1;
                }
                this.sound.sfxAirWhoosh();
                this.triggerAirSynergy(move.id);

                this.comboBanner.classList.remove('hidden');
                this.comboText.textContent = `COMBO: ${move.name} + AIR SYNERGY!`;

                setTimeout(() => {
                    this.sound.sfxEnemyHit();
                    this.enemy.state = 'hit';
                    this.enemy.hp = 0;
                    this.updateHpBar(0);

                    for (let i = 0; i < 35; i++) {
                        this.particles.push({
                            x: this.enemy.x,
                            y: this.enemy.y - 20,
                            vx: (Math.random() - 0.5) * 7,
                            vy: -Math.random() * 6 - 2,
                            color: Math.random() > 0.4 ? '#38bdf8' : '#ffffff',
                            size: 2 + Math.random() * 4,
                            life: 25 + Math.random() * 20
                        });
                    }

                    this.particles.push({
                        isText: true,
                        text: 'CRITICAL COMBO! 💥',
                        x: this.enemy.x,
                        y: this.enemy.y - 45,
                        vx: 0,
                        vy: -0.8,
                        color: '#fef08a',
                        life: 45
                    });

                    this.enemy.vx = 4.5 + Math.random() * 3;
                    this.enemy.vy = -7.5 - Math.random() * 3;

                    setTimeout(() => {
                        this.finishPhase();
                    }, 1400);

                }, 400);

            }, 300);
        }

        triggerWaterAttack(moveId) {
            const kx = this.katara.x + 20;
            const ky = this.katara.y - 22;
            const ex = this.enemy.x;
            const ey = this.enemy.y - 20;

            if (moveId === 'water_whip' || moveId === 'water_slice') {
                this.waterRibbons.push({
                    type: 'whip',
                    sx: kx, sy: ky,
                    ex: ex, ey: ey,
                    color: '#38bdf8',
                    width: 6,
                    life: 30
                });
            } else if (moveId === 'ice_spikes' || moveId === 'glacial_lance') {
                for (let i = 0; i < 8; i++) {
                    this.waterRibbons.push({
                        type: 'ice_spike',
                        sx: kx, sy: ky + (i - 3.5) * 6,
                        ex: ex, ey: ey + (i - 3.5) * 8,
                        speed: 0.08 + i * 0.02,
                        color: '#bae6fd',
                        life: 35
                    });
                }
            } else if (moveId === 'octopus_form' || moveId === 'water_dome') {
                for (let i = 0; i < 8; i++) {
                    this.waterRibbons.push({
                        type: 'octopus_arm',
                        angle: (i / 8) * Math.PI * 2,
                        length: 44,
                        sx: kx, sy: ky,
                        life: 45
                    });
                }
            } else if (moveId === 'lake_tidal_wave' || moveId === 'torrent_geyser') {
                this.waterRibbons.push({
                    type: 'tidal_wave',
                    x: 430,
                    height: 100,
                    life: 45
                });
            } else {
                this.waterRibbons.push({
                    type: 'dragon',
                    sx: kx, sy: ky,
                    ex: ex, ey: ey,
                    t: 0,
                    color: '#0284c7',
                    life: 60
                });
                this.waterRibbons.push({
                    type: 'dragon',
                    sx: kx, sy: ky - 12,
                    ex: ex, ey: ey - 12,
                    t: Math.PI,
                    color: '#38bdf8',
                    life: 60
                });
            }
        }

        triggerAirSynergy(moveId) {
            const ax = this.aang.x + 16;
            const ay = this.aang.y - 20;
            const ex = this.enemy.x;
            const ey = this.enemy.y - 20;

            for (let i = 0; i < 5; i++) {
                this.airRibbons.push({
                    sx: ax, sy: ay + (i - 2) * 8,
                    ex: ex + 20, ey: ey,
                    radius: 14 + i * 4,
                    life: 35
                });
            }

            if (this.battlePhase === 5) {
                for (let i = 0; i < 45; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = 2 + Math.random() * 5;
                    this.particles.push({
                        x: ax,
                        y: ay,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        color: Math.random() > 0.5 ? '#ffffff' : '#38bdf8',
                        size: 3,
                        life: 40
                    });
                }
            }
        }

        updateHpBar(percent) {
            this.enemyHpFill.style.width = `${Math.max(0, percent)}%`;
            this.enemyHpText.textContent = `${Math.max(0, Math.round(percent))}%`;
        }

        finishPhase() {
            this.katara.state = 'idle';
            this.aang.state = 'idle';

            if (this.battlePhase < this.maxPhases) {
                const nextPhase = this.battlePhase + 1;
                this.queueDialogue([
                    {
                        speaker: 'KATARA',
                        style: 'katara',
                        avatar: 'katara',
                        text: `Great teamwork, Aang! But look out, here comes wave ${nextPhase}!`
                    },
                    {
                        speaker: 'AANG',
                        style: 'aang',
                        avatar: 'aang',
                        text: 'Together they can’t touch us! Let’s show them what Water and Air can do!'
                    }
                ], () => {
                    this.startBattlePhase(nextPhase);
                });
            } else {
                this.sound.sfxVictory();
                this.battleHud.classList.add('hidden');
                this.queueDialogue([
                    {
                        speaker: 'KATARA',
                        style: 'katara',
                        avatar: 'katara',
                        text: 'We did it, Aang!! The Fire Nation has retreated, and the forest is safe!'
                    },
                    {
                        speaker: 'AANG',
                        style: 'aang',
                        avatar: 'aang',
                        text: 'Woohoo! What a battle! The sun is setting over the lake... let’s make a campfire and rest together.'
                    }
                ], () => {
                    this.transitionToNight();
                });
            }
        }

        // ====================================================================
        // SHIFT TO NIGHT & BONFIRE ROMANTIC SCENE
        // ====================================================================
        transitionToNight() {
            this.state = 'NIGHT_TRANSITION';
            this.fadeCurtain.classList.add('active');

            this.sound.playTrack('night');

            setTimeout(() => {
                this.nightProgress = 1;
                this.sceneIndicator.textContent = 'LAKESIDE BONFIRE (NIGHT)';
                this.bonfire.active = true;

                this.katara.x = 285;
                this.katara.y = 205;
                this.katara.state = 'night_sit';
                this.katara.blush = 1;

                this.aang.x = 185;
                this.aang.y = 205;
                this.aang.state = 'night_sit';
                this.aang.blush = 1;

                this.fadeCurtain.classList.remove('active');
                this.state = 'NIGHT_BONFIRE';

                setTimeout(() => {
                    this.queueDialogue([
                        {
                            speaker: 'AANG',
                            style: 'aang',
                            avatar: 'aang_blush',
                            text: 'Hiiii Katara, its 2 month since confession and it was the best decision ever . i love youuuuuuuuuuu and i love every moment we sharee '
                        }
                    ], () => {
                        this.nightActions.classList.remove('hidden');
                    });
                }, 800);

            }, 900);
        }

        triggerRomanticAction(actionType) {
            this.sound.sfxHeartChime();

            if (actionType === 'love') {
                this.katara.state = 'night_sit';
                this.spawnFloatingHearts(this.katara.x, this.katara.y - 25, 12);
                this.queueDialogue([
                    {
                        speaker: 'KATARA',
                        style: 'katara',
                        avatar: 'katara_blush',
                        text: 'Hii Aang! 💕 These 2 months have been the happiest months of my life. I love you too, with all of my heart!'
                    },
                    {
                        speaker: 'AANG',
                        style: 'aang',
                        avatar: 'aang_blush',
                        text: 'You make every day an adventure, Katara. I’m the luckiest guy in all four nations! 🥰'
                    }
                ]);
            } else if (actionType === 'shoulder') {
                this.katara.state = 'cuddle';
                this.katara.x = 215;
                this.spawnFloatingHearts(this.katara.x, this.katara.y - 20, 10);
                this.queueDialogue([
                    {
                        speaker: 'KATARA',
                        style: 'katara',
                        avatar: 'katara_blush',
                        text: '*leans gently against your shoulder* Your shoulder is so warm and comforting, Aang. Stay right here with me.'
                    },
                    {
                        speaker: 'AANG',
                        style: 'aang',
                        avatar: 'aang_blush',
                        text: '*smiles warmly and wraps an arm gently around you* Forever and always, Katara. Right beside you.'
                    }
                ]);
            } else if (actionType === 'waterheart') {
                this.spawnWaterHeart();
                this.sound.sfxWaterSplash();
                this.queueDialogue([
                    {
                        speaker: 'KATARA',
                        style: 'katara',
                        avatar: 'katara',
                        text: 'Look Aang! I drew water from the lake and shaped it into a heart glowing in the moonlight, just for you! 🌊💖'
                    },
                    {
                        speaker: 'AANG',
                        style: 'aang',
                        avatar: 'aang_blush',
                        text: 'Whoa... it’s beautiful! You’re the most incredible waterbender in the entire world, Katara! ✨'
                    }
                ]);
            } else if (actionType === 'hands') {
                this.spawnFloatingHearts(235, 195, 8);
                this.queueDialogue([
                    {
                        speaker: 'AANG',
                        style: 'aang',
                        avatar: 'aang_blush',
                        text: '*takes your hand gently by the glowing fire* Two months down, and a whole lifetime of love ahead of us.'
                    },
                    {
                        speaker: 'KATARA',
                        style: 'katara',
                        avatar: 'katara_blush',
                        text: '*squeezes your hand softly* Hand in hand, always. 💕'
                    }
                ]);
            } else if (actionType === 'star') {
                this.spawnShootingStar();
                this.queueDialogue([
                    {
                        speaker: 'AANG',
                        style: 'aang',
                        avatar: 'aang',
                        text: 'Look Katara, a shooting star over the hill! Quick, make a wish!'
                    },
                    {
                        speaker: 'KATARA',
                        style: 'katara',
                        avatar: 'katara_blush',
                        text: 'I already have everything I could ever wish for right here beside me. 🌟'
                    }
                ]);
            }
        }

        spawnFloatingHearts(x, y, count = 6) {
            for (let i = 0; i < count; i++) {
                this.floatingHearts.push({
                    x: x + (Math.random() - 0.5) * 22,
                    y: y + (Math.random() - 0.5) * 12,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -0.6 - Math.random() * 0.8,
                    size: 4 + Math.random() * 3,
                    life: 45 + Math.random() * 25
                });
            }
        }

        spawnWaterHeart() {
            const centerX = 235;
            const centerY = 135;
            for (let t = 0; t < Math.PI * 2; t += 0.18) {
                const hx = 1.3 * (16 * Math.pow(Math.sin(t), 3));
                const hy = -1.3 * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                this.particles.push({
                    x: centerX + hx,
                    y: centerY + hy,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: -0.2,
                    color: Math.random() > 0.3 ? '#38bdf8' : '#e0f2fe',
                    size: 3,
                    life: 95
                });
            }
        }

        spawnShootingStar() {
            this.shootingStars.push({
                x: 70 + Math.random() * 160,
                y: 10 + Math.random() * 25,
                vx: 4.8,
                vy: 2.2,
                length: 34,
                life: 32
            });
        }

        restartGame() {
            this.state = 'INTRO';
            this.nightProgress = 0;
            this.bonfire.active = false;
            this.katara.x = 140;
            this.katara.y = 200;
            this.katara.state = 'idle';
            this.katara.blush = 0;
            this.aang.x = 80;
            this.aang.y = 200;
            this.aang.state = 'idle';
            this.aang.blush = 0;
            this.battleHud.classList.add('hidden');
            this.dialogueBox.classList.add('hidden');
            this.nightActions.classList.add('hidden');
            this.introScreen.classList.remove('hidden');
            this.introScreen.classList.add('active');
            this.sceneIndicator.textContent = 'FOREST CLEARING';
            this.sound.stopMusic();
        }

        // ====================================================================
        // 3. HIGH-FIDELITY SERIES-ACCURATE PIXEL RENDERING (100% PROCEDURAL)
        // ====================================================================
        render() {
            const ctx = this.oc;

            // 1. Sky & Mountains
            this.drawSkyAndMountains(ctx);

            // 2. Lake & Reflections
            this.drawLake(ctx);

            // 3. Forest, Hills, & Foliage
            this.drawForestMeadow(ctx);

            // 4. Bonfire (at Night)
            if (this.bonfire.active || this.nightProgress > 0.5) {
                this.drawBonfire(ctx);
            }

            // 5. High-Definition Character Sprites
            this.drawAang(ctx);
            this.drawKatara(ctx);
            if (this.state === 'BATTLE' && this.enemy.visible) {
                this.drawEnemy(ctx);
            }

            // 6. Dynamic Water/Air/Fire FX
            this.drawVisualEffects(ctx);

            // Scale to screen
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(
                this.offCanvas,
                0, 0, VW, VH,
                this.offsetX, this.offsetY, VW * this.scale, VH * this.scale
            );
        }

        // SKY, MOUNTAINS & SPIRIT MOON
        drawSkyAndMountains(ctx) {
            const t = this.nightProgress;

            // Day Sky: Crisp cerulean blue to pastel cyan
            // Night Sky: Deep mystical twilight indigo to midnight violet
            const daySky = ['#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];
            const nightSky = ['#090d16', '#171b30', '#251a4a', '#3b1d5c'];

            const grad = ctx.createLinearGradient(0, 0, 0, VH * 0.72);
            for (let i = 0; i < 4; i++) {
                const stop = i / 3;
                grad.addColorStop(stop, this.lerpColor(daySky[i], nightSky[i], t));
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, VW, VH * 0.72);

            // Night Stars & Nebula Dust
            if (t > 0.2) {
                // Nebula cloud wash
                ctx.fillStyle = `rgba(168, 85, 247, ${0.12 * t})`;
                ctx.beginPath();
                ctx.arc(200, 50, 90, 0, Math.PI * 2);
                ctx.fill();

                this.stars.forEach(st => {
                    const alpha = st.baseAlpha * Math.sin(this.time * st.twinkleSpeed + st.phase) * t;
                    if (alpha > 0.05) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, Math.max(0, alpha))})`;
                        ctx.fillRect(Math.floor(st.x), Math.floor(st.y), st.size, st.size);
                        if (st.size === 2) {
                            // Subtle cross gleam for bright stars
                            ctx.fillStyle = `rgba(199, 210, 254, ${alpha * 0.6})`;
                            ctx.fillRect(Math.floor(st.x - 1), Math.floor(st.y), 4, 1);
                            ctx.fillRect(Math.floor(st.x), Math.floor(st.y - 1), 1, 4);
                        }
                    }
                });

                // Spirit Moon (Full, glowing crescent with craters)
                const moonX = 390;
                const moonY = 46;
                const moonAlpha = t;

                // Moon outer celestial aura
                const moonGlow = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 40);
                moonGlow.addColorStop(0, `rgba(254, 240, 138, ${0.35 * moonAlpha})`);
                moonGlow.addColorStop(0.5, `rgba(224, 242, 254, ${0.15 * moonAlpha})`);
                moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = moonGlow;
                ctx.beginPath();
                ctx.arc(moonX, moonY, 40, 0, Math.PI * 2);
                ctx.fill();

                // Moon Body
                ctx.fillStyle = `rgba(254, 249, 195, ${moonAlpha})`;
                ctx.beginPath();
                ctx.arc(moonX, moonY, 16, 0, Math.PI * 2);
                ctx.fill();

                // Lunar surface craters (Series aesthetic)
                ctx.fillStyle = `rgba(229, 231, 235, ${0.7 * moonAlpha})`;
                ctx.fillRect(moonX - 6, moonY - 4, 5, 4);
                ctx.fillRect(moonX + 2, moonY + 2, 4, 3);
                ctx.fillRect(moonX - 2, moonY + 6, 3, 2);
            }

            // Day Sun & Fluffy Painterly Clouds
            if (t < 0.8) {
                const sunA = 1 - t;
                // Golden sun
                const sunGlow = ctx.createRadialGradient(70, 42, 10, 70, 42, 50);
                sunGlow.addColorStop(0, `rgba(253, 224, 71, ${0.8 * sunA})`);
                sunGlow.addColorStop(0.5, `rgba(254, 240, 138, ${0.3 * sunA})`);
                sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = sunGlow;
                ctx.beginPath();
                ctx.arc(70, 42, 50, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(254, 240, 138, ${sunA})`;
                ctx.beginPath();
                ctx.arc(70, 42, 15, 0, Math.PI * 2);
                ctx.fill();

                // Animated Cel-Shaded Clouds
                this.clouds.forEach(cl => {
                    cl.x += cl.speed;
                    if (cl.x > VW + 50) cl.x = -110;
                    this.drawCelCloud(ctx, cl.x, cl.y, cl.w, cl.h, sunA);
                });
            }

            // Distant Earth Kingdom Mountain Peaks (Layered with Atmospheric Depth)
            const mtnFar = this.lerpColor('#64748b', '#1e1b4b', t);
            const mtnMid = this.lerpColor('#475569', '#17153b', t);

            // Far Mountains
            ctx.fillStyle = mtnFar;
            ctx.beginPath();
            ctx.moveTo(0, 140);
            ctx.lineTo(60, 90);
            ctx.lineTo(130, 135);
            ctx.lineTo(210, 85);
            ctx.lineTo(290, 130);
            ctx.lineTo(380, 80);
            ctx.lineTo(450, 125);
            ctx.lineTo(VW, 95);
            ctx.lineTo(VW, 160);
            ctx.lineTo(0, 160);
            ctx.closePath();
            ctx.fill();

            // Mid Mountains with mist
            ctx.fillStyle = mtnMid;
            ctx.beginPath();
            ctx.moveTo(0, 150);
            ctx.lineTo(90, 105);
            ctx.lineTo(170, 145);
            ctx.lineTo(260, 100);
            ctx.lineTo(340, 140);
            ctx.lineTo(420, 105);
            ctx.lineTo(VW, 145);
            ctx.lineTo(VW, 175);
            ctx.lineTo(0, 175);
            ctx.closePath();
            ctx.fill();

            // Mountain Mist Band
            const mistGrad = ctx.createLinearGradient(0, 135, 0, 155);
            mistGrad.addColorStop(0, 'rgba(255,255,255,0)');
            mistGrad.addColorStop(0.5, t > 0.5 ? 'rgba(76, 29, 149, 0.25)' : 'rgba(224, 242, 254, 0.45)');
            mistGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = mistGrad;
            ctx.fillRect(0, 135, VW, 20);

            // Shooting Stars
            this.shootingStars.forEach((ss, idx) => {
                ctx.strokeStyle = `rgba(255, 255, 255, ${ss.life / 32})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(ss.x - ss.vx * 3.5, ss.y - ss.vy * 3.5);
                ctx.stroke();

                ss.x += ss.vx;
                ss.y += ss.vy;
                ss.life--;
                if (ss.life <= 0) this.shootingStars.splice(idx, 1);
            });
        }

        drawCelCloud(ctx, x, y, w, h, alpha) {
            const bx = Math.floor(x);
            const by = Math.floor(y);

            // Cloud Under-shadow
            ctx.fillStyle = `rgba(203, 213, 225, ${alpha * 0.8})`;
            ctx.fillRect(bx + 6, by + h - 8, w - 12, 8);

            // Cloud Main White Puff
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
            ctx.beginPath();
            ctx.arc(bx + 18, by + h / 2, 12, 0, Math.PI * 2);
            ctx.arc(bx + w * 0.45, by + h * 0.35, 16, 0, Math.PI * 2);
            ctx.arc(bx + w * 0.75, by + h * 0.45, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(bx + 8, by + h / 2 - 4, w - 16, 10);
        }

        // LAKE WITH WATER REFLECTION & LILY PADS
        drawLake(ctx) {
            const t = this.nightProgress;
            const lakeX = 300;
            const lakeY = 152;
            const lakeW = VW - lakeX;
            const lakeH = 88;

            // Deep lake water gradient
            const lakeGrad = ctx.createLinearGradient(lakeX, lakeY, lakeX, lakeY + lakeH);
            if (t > 0.5) {
                lakeGrad.addColorStop(0, '#0c1b33');
                lakeGrad.addColorStop(0.5, '#071224');
                lakeGrad.addColorStop(1, '#040914');
            } else {
                lakeGrad.addColorStop(0, '#1d4ed8');
                lakeGrad.addColorStop(0.4, '#2563eb');
                lakeGrad.addColorStop(1, '#0284c7');
            }
            ctx.fillStyle = lakeGrad;

            // Natural organic shoreline curve
            ctx.beginPath();
            ctx.moveTo(lakeX + 25, lakeY);
            ctx.bezierCurveTo(lakeX + 45, lakeY + 30, lakeX - 10, lakeY + 55, lakeX + 15, lakeY + lakeH);
            ctx.lineTo(VW, lakeY + lakeH);
            ctx.lineTo(VW, lakeY);
            ctx.closePath();
            ctx.fill();

            // Moonlight Shimmer Trail on Lake at Night (Series Aesthetic)
            if (t > 0.3) {
                const trailX = 390;
                for (let i = 0; i < 11; i++) {
                    const ty = lakeY + 8 + i * 7;
                    const tw = 8 + i * 6 + Math.sin(this.time * 3 + i) * 6;
                    const op = (0.55 - i * 0.03) * t;
                    ctx.fillStyle = `rgba(254, 240, 138, ${op})`;
                    ctx.fillRect(Math.floor(trailX - tw / 2), Math.floor(ty), Math.floor(tw), 2);
                }
            }

            // Animated Horizontal Water Shimmer Lines
            const rippleColor = t > 0.5 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(186, 230, 253, 0.6)';
            ctx.fillStyle = rippleColor;
            for (let r = 0; r < 9; r++) {
                const rx = lakeX + 35 + ((r * 28 + this.time * 18) % (lakeW - 45));
                const ry = lakeY + 12 + r * 8;
                const rw = 16 + (r % 3) * 8;
                ctx.fillRect(Math.floor(rx), Math.floor(ry), rw, 2);
            }

            // Water Reeds & Cattails on Shore
            const reedColor = t > 0.5 ? '#064e3b' : '#15803d';
            for (let i = 0; i < 6; i++) {
                const rdx = lakeX + 12 + i * 7;
                const rdy = lakeY + 45 + Math.sin(i * 1.5) * 15;
                ctx.fillStyle = reedColor;
                ctx.fillRect(rdx, rdy - 16, 2, 18);
                // Cattail head
                ctx.fillStyle = '#78350f';
                ctx.fillRect(rdx - 1, rdy - 16, 4, 6);
            }

            // Floating Lily Pads & Pink Lotus Flowers
            this.lotusFlowers.forEach((lf, idx) => {
                const bob = Math.sin(this.time * 2 + idx) * 1.5;
                const lx = lf.x;
                const ly = lf.y + bob;

                // Green pad
                ctx.fillStyle = '#166534';
                ctx.beginPath();
                ctx.arc(lx, ly, 7, 0, Math.PI * 2);
                ctx.fill();
                // Cutout wedge
                ctx.fillStyle = t > 0.5 ? '#071224' : '#2563eb';
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.arc(lx, ly, 8, 0, 0.6);
                ctx.closePath();
                ctx.fill();

                // Pink Lotus Petals
                ctx.fillStyle = lf.petalColor;
                ctx.fillRect(lx - 2, ly - 4, 4, 4);
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(lx - 1, ly - 2, 2, 2);
            });
        }

        // FOREST MEADOW, TREES & FOLIAGE
        drawForestMeadow(ctx) {
            const t = this.nightProgress;

            // Rolling Hills in midground
            const hillColor1 = this.lerpColor('#22c55e', '#092b17', t);
            const hillColor2 = this.lerpColor('#16a34a', '#061d0f', t);

            ctx.fillStyle = hillColor1;
            ctx.beginPath();
            ctx.arc(90, 210, 140, Math.PI, 0);
            ctx.fill();

            ctx.fillStyle = hillColor2;
            ctx.beginPath();
            ctx.arc(240, 220, 160, Math.PI, 0);
            ctx.fill();

            // Ground base meadow
            const meadowColor = this.lerpColor('#15803d', '#05180c', t);
            ctx.fillStyle = meadowColor;
            ctx.fillRect(0, 192, VW, VH - 192);

            // Textured Grass Tuft Dithering
            const grassHighlight = this.lerpColor('#4ade80', '#0f381c', t);
            ctx.fillStyle = grassHighlight;
            for (let x = 0; x < VW; x += 10) {
                ctx.fillRect(x, 192, 7, 3);
                ctx.fillRect(x + 3, 195, 4, 3);

                // Small wildflowers (blue Water Tribe blossoms & white daisies)
                if (x % 32 === 0) {
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(x + 1, 199, 3, 3);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x + 2, 200, 1, 1);
                    ctx.fillStyle = grassHighlight;
                }
            }

            // Beautiful Large Earth Kingdom Trees (Conifer & Broadleaf with layered canopy)
            const trunkColor = this.lerpColor('#543219', '#1d1209', t);
            const foliageDark = this.lerpColor('#14532d', '#041c0e', t);
            const foliageLight = this.lerpColor('#22c55e', '#0a361b', t);

            this.drawDetailedTree(ctx, 30, 110, 48, 85, trunkColor, foliageDark, foliageLight);
            this.drawDetailedTree(ctx, -15, 95, 52, 100, trunkColor, foliageDark, foliageLight);
            this.drawDetailedTree(ctx, 85, 125, 38, 75, trunkColor, foliageDark, foliageLight);

            // Mossy Boulder
            const rockBase = this.lerpColor('#64748b', '#1e293b', t);
            ctx.fillStyle = rockBase;
            ctx.beginPath();
            ctx.arc(175, 202, 12, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = foliageLight;
            ctx.fillRect(166, 192, 14, 3);
        }

        drawDetailedTree(ctx, x, y, w, h, trunkCol, darkLeaf, lightLeaf) {
            const bx = Math.floor(x);
            const by = Math.floor(y);

            // Trunk with bark shading
            ctx.fillStyle = trunkCol;
            ctx.fillRect(bx + w / 2 - 4, by + h - 22, 8, 26);
            ctx.fillStyle = '#2b1810';
            ctx.fillRect(bx + w / 2 - 2, by + h - 22, 3, 26);

            // Layered Canopy Puffs
            ctx.fillStyle = darkLeaf;
            ctx.beginPath();
            ctx.arc(bx + w / 2, by + 25, 24, 0, Math.PI * 2);
            ctx.arc(bx + w / 2 - 14, by + 40, 18, 0, Math.PI * 2);
            ctx.arc(bx + w / 2 + 14, by + 40, 18, 0, Math.PI * 2);
            ctx.arc(bx + w / 2, by + 55, 22, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = lightLeaf;
            ctx.beginPath();
            ctx.arc(bx + w / 2 - 4, by + 22, 18, 0, Math.PI * 2);
            ctx.arc(bx + w / 2 - 16, by + 36, 14, 0, Math.PI * 2);
            ctx.arc(bx + w / 2 + 10, by + 36, 14, 0, Math.PI * 2);
            ctx.fill();
        }

        // COZY LAKESIDE BONFIRE
        drawBonfire(ctx) {
            const bx = this.bonfire.x;
            const by = this.bonfire.y;

            // Warm Amber Firelight Radius (Glows dynamically)
            const flicker = Math.sin(this.time * 12) * 4;
            const glowGrad = ctx.createRadialGradient(bx, by - 6, 6, bx, by - 6, 75 + flicker);
            glowGrad.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
            glowGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.18)');
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(bx, by - 6, 75 + flicker, 0, Math.PI * 2);
            ctx.fill();

            // Campfire Stone Circle (Detailed cobbles)
            const stones = [
                { dx: -16, dy: 4 }, { dx: -12, dy: -2 }, { dx: -4, dy: -5 },
                { dx: 6, dy: -5 }, { dx: 14, dy: -1 }, { dx: 16, dy: 4 },
                { dx: 10, dy: 8 }, { dx: -2, dy: 9 }, { dx: -12, dy: 7 }
            ];
            ctx.fillStyle = '#475569';
            stones.forEach(s => {
                ctx.fillRect(bx + s.dx - 2, by + s.dy - 2, 5, 4);
                ctx.fillStyle = '#64748b';
                ctx.fillRect(bx + s.dx - 1, by + s.dy - 2, 3, 2);
                ctx.fillStyle = '#475569';
            });

            // Glowing Charcoal Bed
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(bx - 10, by - 2, 20, 6);
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(bx - 6, by - 1, 12, 4);

            // Crossed Heavy Oak Fire Logs
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(bx - 12, by - 1, 24, 4);
            ctx.fillStyle = '#271711';
            ctx.fillRect(bx - 10, by - 3, 20, 3);

            // Multi-Layered Animated Leaping Flames
            this.bonfire.flames.forEach(f => {
                f.y -= f.vy;
                f.life++;
                if (f.life >= f.maxLife) {
                    f.life = 0;
                    f.y = Math.random() * 4;
                    f.x = (Math.random() - 0.5) * 14;
                }

                const progress = f.life / f.maxLife;
                const fx = bx + f.x + Math.sin(this.time * 8 + f.x) * 2.5;
                const fy = by - f.y - 6;
                const fSize = Math.max(1, Math.floor(f.size * (1 - progress)));

                let fCol = '#ffffff';
                if (progress > 0.12) fCol = '#fef08a';
                if (progress > 0.35) fCol = '#f97316';
                if (progress > 0.65) fCol = '#ef4444';
                if (progress > 0.85) fCol = '#7f1d1d';

                ctx.fillStyle = fCol;
                ctx.fillRect(Math.floor(fx), Math.floor(fy), fSize, fSize);
            });

            // Rising Embers
            if (Math.random() > 0.4) {
                this.particles.push({
                    x: bx + (Math.random() - 0.5) * 12,
                    y: by - 16,
                    vx: (Math.random() - 0.5) * 0.9,
                    vy: -1.2 - Math.random() * 1.8,
                    color: Math.random() > 0.5 ? '#fde047' : '#f97316',
                    size: 1.5,
                    life: 30
                });
            }

            // Drifting Bioluminescent Fireflies
            for (let i = 0; i < 9; i++) {
                const ffx = bx + Math.cos(this.time * 0.9 + i) * (55 + i * 16);
                const ffy = by - 35 + Math.sin(this.time * 1.4 + i * 2) * 26;
                const fAlpha = 0.4 + Math.sin(this.time * 4 + i) * 0.4;
                if (fAlpha > 0.1) {
                    ctx.fillStyle = `rgba(190, 242, 100, ${fAlpha})`;
                    ctx.fillRect(Math.floor(ffx), Math.floor(ffy), 2, 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${fAlpha * 0.7})`;
                    ctx.fillRect(Math.floor(ffx), Math.floor(ffy), 1, 1);
                }
            }
        }

        // ====================================================================
        // SERIES-ACCURATE KATARA SPRITE (16-BIT DETAILED ANIME PIXEL ART)
        // ====================================================================
        drawKatara(ctx) {
            const k = this.katara;
            const x = Math.floor(k.x);
            const y = Math.floor(k.y);

            // Palette (Official Avatar Series Colors)
            const skinBase = '#bd8257';
            const skinLight = '#d89c70';
            const skinShadow = '#9c653f';
            const hairDark = '#1f130b';
            const hairMid = '#382315';
            const hairLight = '#573822';
            const coatBlue = '#1d6fa5';
            const coatDark = '#114b73';
            const coatLight = '#3ba1e0';
            const fleeceWhite = '#f8fafc';
            const fleeceShadow = '#cbd5e1';
            const pantsDark = '#0c2b47';
            const bootsBrown = '#4a3020';
            const necklaceNavy = '#1e3a8a';
            const pendantCyan = '#38bdf8';
            const eyeNavy = '#0284c7';

            if (k.state === 'night_sit' || k.state === 'cuddle') {
                // SITTING BESIDE AANG BY THE BONFIRE
                const sy = y + 4;

                // Folded legs on grass
                ctx.fillStyle = pantsDark;
                ctx.fillRect(x - 12, sy + 6, 24, 9);
                ctx.fillStyle = bootsBrown;
                ctx.fillRect(x - 14, sy + 10, 8, 5);

                // Water Tribe Coat Lower Trim
                ctx.fillStyle = fleeceWhite;
                ctx.fillRect(x - 12, sy + 4, 24, 3);
                ctx.fillStyle = fleeceShadow;
                ctx.fillRect(x - 12, sy + 7, 24, 1);

                // Coat Torso (Southern wrap coat)
                ctx.fillStyle = coatBlue;
                ctx.fillRect(x - 10, sy - 14, 20, 18);
                ctx.fillStyle = coatDark;
                ctx.fillRect(x - 10, sy - 6, 8, 10);
                ctx.fillStyle = coatLight;
                ctx.fillRect(x - 2, sy - 14, 12, 4);

                // White Fleece Collar & Lapel
                ctx.fillStyle = fleeceWhite;
                ctx.fillRect(x - 8, sy - 15, 16, 4);
                ctx.fillRect(x - 2, sy - 12, 4, 12); // Front lapel cross

                // Hands folded or holding warm tea
                ctx.fillStyle = skinBase;
                ctx.fillRect(x - 5, sy - 2, 10, 4);
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(x - 4, sy - 4, 8, 3); // Tea cup

                // Head
                ctx.fillStyle = skinBase;
                ctx.fillRect(x - 8, sy - 30, 16, 15);
                ctx.fillStyle = skinLight;
                ctx.fillRect(x - 6, sy - 28, 12, 10);

                // Katara's Beautiful Ponytail & Hair Back
                ctx.fillStyle = hairDark;
                ctx.fillRect(x - 9, sy - 34, 18, 7);
                ctx.fillRect(x + 7, sy - 32, 5, 20); // Ponytail cascading right
                ctx.fillStyle = hairMid;
                ctx.fillRect(x - 8, sy - 33, 14, 3);
                ctx.fillRect(x + 8, sy - 28, 3, 14);

                // ICONIC KATARA HAIR LOOPIES (Curling braids framing cheeks)
                ctx.fillStyle = hairDark;
                ctx.fillRect(x - 9, sy - 24, 3, 13);
                ctx.fillRect(x - 8, sy - 12, 3, 3);
                ctx.fillRect(x + 6, sy - 24, 3, 13);
                ctx.fillRect(x + 5, sy - 12, 3, 3);
                // Cyan hair beads clamping loops
                ctx.fillStyle = pendantCyan;
                ctx.fillRect(x - 8, sy - 11, 3, 2);
                ctx.fillRect(x + 5, sy - 11, 3, 2);

                // Expressive Anime Eyes looking at Aang (left)
                ctx.fillStyle = '#0f172a'; // Lash line
                ctx.fillRect(x - 6, sy - 23, 4, 1);
                ctx.fillRect(x, sy - 23, 4, 1);
                ctx.fillStyle = eyeNavy;
                ctx.fillRect(x - 5, sy - 22, 3, 3);
                ctx.fillRect(x + 1, sy - 22, 3, 3);
                ctx.fillStyle = '#ffffff'; // Gleam
                ctx.fillRect(x - 5, sy - 22, 1, 1);
                ctx.fillRect(x + 1, sy - 22, 1, 1);

                // Sweet Smile
                ctx.fillStyle = '#7c2d12';
                ctx.fillRect(x - 2, sy - 17, 4, 1);

                // Blushing Cheeks
                ctx.fillStyle = '#f43f5e';
                ctx.fillRect(x - 7, sy - 19, 4, 2);
                ctx.fillRect(x + 3, sy - 19, 4, 2);

                // Betrothal Necklace Choker
                ctx.fillStyle = necklaceNavy;
                ctx.fillRect(x - 5, sy - 15, 10, 2);
                ctx.fillStyle = pendantCyan;
                ctx.fillRect(x - 1, sy - 14, 3, 3);

            } else {
                // COMBAT & WATERBENDING MARTIAL ARTS STANCE
                const bob = Math.sin(this.time * 4) * 1.5;

                // Boots
                ctx.fillStyle = bootsBrown;
                ctx.fillRect(x - 9, y + 15, 6, 8);
                ctx.fillRect(x + 3, y + 15, 6, 8);
                ctx.fillStyle = fleeceWhite; // Fur boot cuffs
                ctx.fillRect(x - 9, y + 14, 6, 2);
                ctx.fillRect(x + 3, y + 14, 6, 2);

                // Dark Navy Trousers
                ctx.fillStyle = pantsDark;
                ctx.fillRect(x - 8, y + 6, 16, 9);

                // Water Tribe Tunic Coat Body
                ctx.fillStyle = coatBlue;
                ctx.fillRect(x - 10, y - 16 + bob, 20, 22);
                ctx.fillStyle = coatDark;
                ctx.fillRect(x - 10, y - 6 + bob, 9, 12);
                ctx.fillStyle = coatLight;
                ctx.fillRect(x - 2, y - 16 + bob, 12, 6);

                // Thick White Fleece Fur Trim on Hem & Neck
                ctx.fillStyle = fleeceWhite;
                ctx.fillRect(x - 10, y + 4 + bob, 20, 3);
                ctx.fillStyle = fleeceWhite;
                ctx.fillRect(x - 8, y - 17 + bob, 16, 4);

                // Brown Leather Waist Belt & Water Canteen Pouch
                ctx.fillStyle = '#543219';
                ctx.fillRect(x - 10, y - 2 + bob, 20, 3);
                ctx.fillStyle = '#78350f'; // Water Pouch
                ctx.fillRect(x + 10, y - 4 + bob, 5, 7);
                ctx.fillStyle = pendantCyan; // Droplet glint
                ctx.fillRect(x + 11, y - 2 + bob, 3, 3);

                // Arms (Outstretched Waterbending Tai Chi Poses)
                if (k.state === 'bending') {
                    ctx.fillStyle = coatBlue;
                    ctx.fillRect(x + 10, y - 12 + bob, 16, 5);
                    ctx.fillStyle = fleeceWhite;
                    ctx.fillRect(x + 24, y - 13 + bob, 3, 7);
                    ctx.fillStyle = skinBase;
                    ctx.fillRect(x + 27, y - 11 + bob, 4, 4);

                    // Fluid Water Ribbon around wrists
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(x + 22, y - 17 + bob, 8, 4);
                    ctx.fillRect(x + 28, y - 13 + bob, 5, 8);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x + 24, y - 16 + bob, 4, 2);
                } else {
                    ctx.fillStyle = coatBlue;
                    ctx.fillRect(x - 13, y - 12 + bob, 4, 14);
                    ctx.fillRect(x + 9, y - 12 + bob, 4, 14);
                    ctx.fillStyle = fleeceWhite;
                    ctx.fillRect(x - 13, y + 1 + bob, 4, 2);
                    ctx.fillRect(x + 9, y + 1 + bob, 4, 2);
                    ctx.fillStyle = skinBase;
                    ctx.fillRect(x - 13, y + 3 + bob, 4, 3);
                    ctx.fillRect(x + 9, y + 3 + bob, 4, 3);
                }

                // Head
                ctx.fillStyle = skinBase;
                ctx.fillRect(x - 8, y - 32 + bob, 16, 15);
                ctx.fillStyle = skinLight;
                ctx.fillRect(x - 6, y - 30 + bob, 12, 10);

                // Hair & Ponytail
                ctx.fillStyle = hairDark;
                ctx.fillRect(x - 9, y - 36 + bob, 18, 7);
                ctx.fillRect(x - 13, y - 34 + bob, 5, 18); // Ponytail swinging
                ctx.fillStyle = hairMid;
                ctx.fillRect(x - 8, y - 35 + bob, 14, 3);

                // Iconic Hair Loopies
                ctx.fillStyle = hairDark;
                ctx.fillRect(x - 9, y - 26 + bob, 3, 14);
                ctx.fillRect(x - 8, y - 13 + bob, 3, 3);
                ctx.fillRect(x + 6, y - 26 + bob, 3, 14);
                ctx.fillRect(x + 5, y - 13 + bob, 3, 3);
                ctx.fillStyle = pendantCyan; // Loop beads
                ctx.fillRect(x - 8, y - 12 + bob, 3, 2);
                ctx.fillRect(x + 5, y - 12 + bob, 3, 2);

                // Fierce Determined Anime Eyes
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(x - 5, y - 25 + bob, 4, 2);
                ctx.fillRect(x + 1, y - 25 + bob, 4, 2);
                ctx.fillStyle = eyeNavy;
                ctx.fillRect(x - 4, y - 24 + bob, 3, 3);
                ctx.fillRect(x + 2, y - 24 + bob, 3, 3);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 4, y - 24 + bob, 1, 1);
                ctx.fillRect(x + 2, y - 24 + bob, 1, 1);

                // Betrothal Necklace
                ctx.fillStyle = necklaceNavy;
                ctx.fillRect(x - 5, y - 17 + bob, 10, 2);
                ctx.fillStyle = pendantCyan;
                ctx.fillRect(x - 1, y - 16 + bob, 3, 3);
            }
        }

        // ====================================================================
        // SERIES-ACCURATE AANG SPRITE (16-BIT DETAILED ANIME PIXEL ART)
        // ====================================================================
        drawAang(ctx) {
            const a = this.aang;
            const x = Math.floor(a.x);
            const y = Math.floor(a.y);

            // Palette (Official Avatar Series Colors)
            const skinBase = '#f5c798';
            const skinLight = '#ffdfbe';
            const skinShadow = '#cb9969';
            const arrowCyan = (a.avatarGlow > 0) ? '#ffffff' : '#00d8f6';
            const arrowOutline = (a.avatarGlow > 0) ? '#38bdf8' : '#0284c7';
            const robeYellow = '#fad02c';
            const robeYellowShadow = '#d49b13';
            const shawlOrange = '#f9690e';
            const shawlDark = '#c2410c';
            const beltBrown = '#452712';
            const bootsBrown = '#52361b';

            if (a.state === 'night_sit') {
                // SITTING BESIDE KATARA BY BONFIRE
                const sy = y + 4;

                // Legs crossed on grass
                ctx.fillStyle = robeYellowShadow;
                ctx.fillRect(x - 11, sy + 6, 22, 9);
                ctx.fillStyle = bootsBrown;
                ctx.fillRect(x + 7, sy + 9, 7, 5);

                // Yellow Monk Under-tunic
                ctx.fillStyle = robeYellow;
                ctx.fillRect(x - 9, sy - 14, 18, 18);
                // Orange Air Nomad Shawl draped over shoulder
                ctx.fillStyle = shawlOrange;
                ctx.fillRect(x - 9, sy - 14, 10, 18);
                ctx.fillStyle = shawlDark;
                ctx.fillRect(x - 9, sy - 4, 10, 8);

                // Brown sash knot
                ctx.fillStyle = beltBrown;
                ctx.fillRect(x - 8, sy + 3, 16, 3);

                // Hands resting near Katara
                ctx.fillStyle = skinBase;
                ctx.fillRect(x + 5, sy - 1, 6, 4);
                // Cyan arrow tattoo on back of hand!
                ctx.fillStyle = arrowCyan;
                ctx.fillRect(x + 7, sy, 2, 2);

                // Smooth Bald Head
                ctx.fillStyle = skinBase;
                ctx.fillRect(x - 7, sy - 29, 14, 15);
                ctx.fillStyle = skinLight;
                ctx.fillRect(x - 5, sy - 27, 10, 11);

                // Iconic Blue Arrow Tattoo pointing down forehead!
                ctx.fillStyle = arrowOutline;
                ctx.fillRect(x - 2, sy - 33, 4, 9);
                ctx.fillRect(x - 3, sy - 26, 6, 3);
                ctx.fillStyle = arrowCyan;
                ctx.fillRect(x - 1, sy - 33, 2, 8);
                ctx.fillRect(x - 2, sy - 25, 4, 2);

                // Loving Anime Eyes looking at Katara (right)
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(x - 3, sy - 22, 4, 1);
                ctx.fillRect(x + 2, sy - 22, 4, 1);
                ctx.fillStyle = '#452b19'; // Warm brown irises
                ctx.fillRect(x - 2, sy - 21, 3, 3);
                ctx.fillRect(x + 3, sy - 21, 3, 3);
                ctx.fillStyle = '#ffffff'; // Gleam
                ctx.fillRect(x - 1, sy - 21, 1, 1);
                ctx.fillRect(x + 4, sy - 21, 1, 1);

                // Cheerful Loving Smile
                ctx.fillStyle = '#9a3412';
                ctx.fillRect(x, sy - 16, 5, 2);

                // Deep Pink Blushing Cheeks (2-Month Confession!)
                ctx.fillStyle = '#f43f5e';
                ctx.fillRect(x - 4, sy - 18, 4, 2);
                ctx.fillRect(x + 4, sy - 18, 4, 2);

                // Wooden Glider Staff resting beside him
                ctx.fillStyle = '#824513';
                ctx.fillRect(x - 15, sy - 16, 3, 30);
                ctx.fillStyle = '#dc2626'; // Red glider wings
                ctx.fillRect(x - 16, sy - 19, 5, 5);

            } else {
                // COMBAT & AIRBENDING STANCE
                const bob = Math.sin(this.time * 4 + 1) * 1.5;

                // Avatar State Radiant Aura Bloom
                if (a.state === 'avatar_state' || a.avatarGlow > 0) {
                    const glowGrad = ctx.createRadialGradient(x, y - 14, 10, x, y - 14, 38);
                    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
                    glowGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.45)');
                    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = glowGrad;
                    ctx.beginPath();
                    ctx.arc(x, y - 14, 38, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Boots
                ctx.fillStyle = bootsBrown;
                ctx.fillRect(x - 8, y + 15, 6, 8);
                ctx.fillRect(x + 2, y + 15, 6, 8);

                // Yellow Monk Trousers
                ctx.fillStyle = robeYellowShadow;
                ctx.fillRect(x - 7, y + 6, 14, 9);

                // Tunic & Orange Shawl
                ctx.fillStyle = robeYellow;
                ctx.fillRect(x - 9, y - 16 + bob, 18, 22);
                ctx.fillStyle = shawlOrange;
                ctx.fillRect(x - 9, y - 16 + bob, 10, 22);
                ctx.fillStyle = shawlDark;
                ctx.fillRect(x - 9, y - 6 + bob, 10, 12);

                // Brown Sash Belt
                ctx.fillStyle = beltBrown;
                ctx.fillRect(x - 9, y - 2 + bob, 18, 3);

                // Head
                ctx.fillStyle = skinBase;
                ctx.fillRect(x - 7, y - 31 + bob, 14, 15);
                ctx.fillStyle = skinLight;
                ctx.fillRect(x - 5, y - 29 + bob, 10, 11);

                // Iconic Arrow Tattoo
                ctx.fillStyle = arrowOutline;
                ctx.fillRect(x - 2, y - 35 + bob, 4, 9);
                ctx.fillRect(x - 3, y - 28 + bob, 6, 3);
                ctx.fillStyle = arrowCyan;
                ctx.fillRect(x - 1, y - 35 + bob, 2, 8);
                ctx.fillRect(x - 2, y - 27 + bob, 4, 2);

                // Eyes (Glowing white-cyan in Avatar State!)
                if (a.state === 'avatar_state') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x - 4, y - 24 + bob, 4, 4);
                    ctx.fillRect(x + 1, y - 24 + bob, 4, 4);
                    ctx.fillStyle = '#00ffff';
                    ctx.fillRect(x - 5, y - 25 + bob, 6, 1);
                    ctx.fillRect(x, y - 25 + bob, 6, 1);
                } else {
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(x - 4, y - 24 + bob, 4, 1);
                    ctx.fillRect(x + 1, y - 24 + bob, 4, 1);
                    ctx.fillStyle = '#452b19';
                    ctx.fillRect(x - 3, y - 23 + bob, 3, 3);
                    ctx.fillRect(x + 2, y - 23 + bob, 3, 3);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x - 3, y - 23 + bob, 1, 1);
                    ctx.fillRect(x + 2, y - 23 + bob, 1, 1);
                }

                // Glider Staff in hand
                ctx.fillStyle = '#824513';
                ctx.fillRect(x + 10, y - 28 + bob, 3, 42);
                ctx.fillStyle = '#dc2626'; // Red glider wing
                ctx.fillRect(x + 8, y - 32 + bob, 7, 6);

                // Air Scooter Underneath when casting
                if (a.state === 'scooter' || a.state === 'airblast') {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.beginPath();
                    ctx.arc(x, y + 20, 15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fde047';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }

        // ====================================================================
        // SERIES-ACCURATE FIRE NATION SOLDIERS
        // ====================================================================
        drawEnemy(ctx) {
            const e = this.enemy;
            const x = Math.floor(e.x);
            const y = Math.floor(e.y);

            ctx.save();
            ctx.translate(x, y);
            if (e.state === 'hit') {
                ctx.rotate(this.time * 9);
            }

            // Fire Nation Armor Colors
            const armorRed = '#991b1b';
            const armorDarkRed = '#5b0a0a';
            const armorBlack = '#18181b';
            const goldTrim = '#f59e0b';
            const ironCharcoal = '#27272a';

            // Boots & Greaves
            ctx.fillStyle = armorBlack;
            ctx.fillRect(-8, 14, 6, 8);
            ctx.fillRect(2, 14, 6, 8);
            ctx.fillStyle = goldTrim;
            ctx.fillRect(-8, 14, 6, 2);
            ctx.fillRect(2, 14, 6, 2);

            // Layered Crimson Armored Tunic
            ctx.fillStyle = armorRed;
            ctx.fillRect(-10, -14, 20, 26);
            ctx.fillStyle = armorDarkRed;
            ctx.fillRect(-10, 0, 20, 12);
            ctx.fillStyle = goldTrim;
            ctx.fillRect(-10, -2, 20, 3); // Gold sash band

            // Spiked Black Pauldrons (Shoulders)
            ctx.fillStyle = armorBlack;
            ctx.fillRect(-15, -14, 6, 10);
            ctx.fillRect(9, -14, 6, 10);
            ctx.fillStyle = goldTrim;
            ctx.fillRect(-15, -14, 2, 8);
            ctx.fillRect(13, -14, 2, 8);

            // Conical Pointed Helmet & Iron Skull Faceplate
            ctx.fillStyle = ironCharcoal;
            ctx.fillRect(-8, -30, 16, 16);
            ctx.fillRect(-10, -32, 20, 4); // Helmet rim
            // Horned peak
            ctx.fillRect(-3, -37, 6, 6);

            // Streaming Crimson Topknot Plume (Animated in wind)
            const plumeWave = Math.sin(this.time * 12) * 4;
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-2, -43, 4, 7);
            ctx.fillRect(1 + plumeWave, -45, 5, 5);

            // Menacing Glowing Eye Slits
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(-5, -24, 3, 2);
            ctx.fillRect(2, -24, 3, 2);

            // Dual Fire Daggers when in combat
            if (e.state === 'idle') {
                const fBob = Math.sin(this.time * 10) * 2;
                ctx.fillStyle = '#f97316';
                ctx.fillRect(-18, -8 + fBob, 8, 8);
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(-16, -6 + fBob, 4, 4);
            }

            ctx.restore();
        }

        // ====================================================================
        // DUAL-BENDING VISUAL EFFECTS & COMBO RENDERING
        // ====================================================================
        drawVisualEffects(ctx) {
            // Water Ribbons & Attacks
            this.waterRibbons.forEach((wr, idx) => {
                wr.life--;
                if (wr.type === 'whip') {
                    ctx.strokeStyle = wr.color;
                    ctx.lineWidth = wr.width;
                    ctx.beginPath();
                    ctx.moveTo(wr.sx, wr.sy);
                    const cx = (wr.sx + wr.ex) / 2;
                    const cy = Math.min(wr.sy, wr.ey) - 40 + Math.sin(this.time * 14) * 18;
                    ctx.quadraticCurveTo(cx, cy, wr.ex, wr.ey);
                    ctx.stroke();

                    // White splash crest
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                } else if (wr.type === 'ice_spike') {
                    ctx.fillStyle = wr.color;
                    wr.sx += (wr.ex - wr.sx) * wr.speed;
                    wr.sy += (wr.ey - wr.sy) * wr.speed;
                    ctx.beginPath();
                    ctx.moveTo(wr.sx + 10, wr.sy);
                    ctx.lineTo(wr.sx, wr.sy - 4);
                    ctx.lineTo(wr.sx - 10, wr.sy);
                    ctx.lineTo(wr.sx, wr.sy + 4);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(wr.sx - 2, wr.sy - 1, 4, 2);

                } else if (wr.type === 'octopus_arm') {
                    const wave = Math.sin(this.time * 8 + wr.angle) * 14;
                    const ex = wr.sx + Math.cos(wr.angle) * wr.length + wave;
                    const ey = wr.sy + Math.sin(wr.angle) * (wr.length * 0.7) + wave;

                    ctx.strokeStyle = '#38bdf8';
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(wr.sx, wr.sy);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                } else if (wr.type === 'tidal_wave') {
                    ctx.fillStyle = 'rgba(2, 132, 199, 0.9)';
                    ctx.fillRect(wr.x, 130, 70, 75);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(wr.x, 128, 70, 5);
                    wr.x -= 4;

                } else if (wr.type === 'dragon') {
                    wr.t += 0.16;
                    const dx = wr.sx + (wr.ex - wr.sx) * Math.min(1, wr.t / 2.8);
                    const dy = wr.sy - 24 + Math.sin(wr.t * 3.5) * 28;
                    ctx.fillStyle = wr.color;
                    ctx.beginPath();
                    ctx.arc(dx, dy, 12, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(dx + 3, dy - 3, 4, 4); // Glowing eyes
                }

                if (wr.life <= 0) this.waterRibbons.splice(idx, 1);
            });

            // Air Ribbons & Spirals
            this.airRibbons.forEach((ar, idx) => {
                ar.life--;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                const midX = (ar.sx + ar.ex) / 2;
                const midY = (ar.sy + ar.ey) / 2 + Math.sin(this.time * 12) * ar.radius;
                ctx.moveTo(ar.sx, ar.sy);
                ctx.quadraticCurveTo(midX, midY, ar.ex, ar.ey);
                ctx.stroke();
                if (ar.life <= 0) this.airRibbons.splice(idx, 1);
            });

            // Particles (Steam, Splashes, Hit Damage)
            this.particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                if (p.isText) {
                    ctx.fillStyle = p.color;
                    ctx.font = '9px "Press Start 2P", monospace';
                    ctx.fillText(p.text, Math.floor(p.x - 40), Math.floor(p.y));
                } else {
                    ctx.fillStyle = p.color;
                    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
                }

                if (p.life <= 0) this.particles.splice(idx, 1);
            });

            // Floating Hearts (Romantic Moments)
            this.floatingHearts.forEach((h, idx) => {
                h.x += h.vx;
                h.y += h.vy;
                h.life--;

                ctx.fillStyle = `rgba(244, 63, 94, ${Math.min(1, h.life / 20)})`;
                const hx = Math.floor(h.x);
                const hy = Math.floor(h.y);
                ctx.fillRect(hx - 2, hy - 2, 2, 2);
                ctx.fillRect(hx + 1, hy - 2, 2, 2);
                ctx.fillRect(hx - 3, hy - 1, 7, 2);
                ctx.fillRect(hx - 2, hy + 1, 5, 2);
                ctx.fillRect(hx - 1, hy + 3, 3, 1);

                if (h.life <= 0) this.floatingHearts.splice(idx, 1);
            });
        }

        // ====================================================================
        // SERIES-ACCURATE DIALOGUE PORTRAIT AVATARS
        // ====================================================================
        drawPortrait(avatarType) {
            const pCtx = this.portraitAvatar;
            pCtx.innerHTML = '';

            const pc = document.createElement('canvas');
            pc.width = 64;
            pc.height = 64;
            const c = pc.getContext('2d');
            c.imageSmoothingEnabled = false;

            if (avatarType === 'aang' || avatarType === 'aang_blush') {
                // Saffron background
                c.fillStyle = '#fad02c';
                c.fillRect(0, 0, 64, 64);

                // Monk cowl / Shawl
                c.fillStyle = '#f9690e';
                c.fillRect(10, 44, 44, 20);

                // Head
                c.fillStyle = '#f5c798';
                c.fillRect(16, 12, 32, 34);
                c.fillStyle = '#ffdfbe';
                c.fillRect(20, 16, 24, 26);

                // Iconic Arrow Tattoo
                c.fillStyle = '#0284c7';
                c.fillRect(28, 8, 8, 20);
                c.fillRect(24, 24, 16, 6);
                c.fillStyle = '#00d8f6';
                c.fillRect(30, 8, 4, 18);
                c.fillRect(26, 26, 12, 3);

                // Expressive Anime Eyes
                c.fillStyle = '#0f172a';
                c.fillRect(22, 28, 6, 2);
                c.fillRect(36, 28, 6, 2);
                c.fillStyle = '#452b19';
                c.fillRect(23, 30, 5, 5);
                c.fillRect(36, 30, 5, 5);
                c.fillStyle = '#ffffff';
                c.fillRect(24, 30, 2, 2);
                c.fillRect(37, 30, 2, 2);

                // Cheerful Smile
                c.fillStyle = '#9a3412';
                c.fillRect(28, 40, 8, 2);

                // Deep Blushing Cheeks
                if (avatarType === 'aang_blush') {
                    c.fillStyle = '#f43f5e';
                    c.fillRect(18, 35, 7, 4);
                    c.fillRect(39, 35, 7, 4);
                }

            } else if (avatarType === 'katara' || avatarType === 'katara_blush') {
                // Ocean blue background
                c.fillStyle = '#1d6fa5';
                c.fillRect(0, 0, 64, 64);

                // Water Tribe Coat & Fur Collar
                c.fillStyle = '#f8fafc';
                c.fillRect(14, 46, 36, 18);

                // Head
                c.fillStyle = '#bd8257';
                c.fillRect(18, 14, 28, 32);
                c.fillStyle = '#d89c70';
                c.fillRect(22, 18, 20, 24);

                // Dark Brunette Ponytail & Hairline
                c.fillStyle = '#1f130b';
                c.fillRect(16, 8, 32, 10);
                c.fillRect(14, 14, 8, 32);
                c.fillRect(42, 14, 8, 32);

                // THE FAMOUS HAIR LOOPIES
                c.fillStyle = '#1f130b';
                c.fillRect(12, 20, 4, 24);
                c.fillRect(48, 20, 4, 24);
                c.fillStyle = '#38bdf8'; // Cyan beads
                c.fillRect(12, 42, 4, 4);
                c.fillRect(48, 42, 4, 4);

                // Anime Eyes
                c.fillStyle = '#0f172a';
                c.fillRect(24, 27, 6, 2);
                c.fillRect(34, 27, 6, 2);
                c.fillStyle = '#0284c7';
                c.fillRect(25, 29, 5, 5);
                c.fillRect(34, 29, 5, 5);
                c.fillStyle = '#ffffff';
                c.fillRect(26, 29, 2, 2);
                c.fillRect(35, 29, 2, 2);

                // Betrothal Necklace
                c.fillStyle = '#1e3a8a';
                c.fillRect(24, 44, 16, 3);
                c.fillStyle = '#38bdf8';
                c.fillRect(29, 45, 6, 5);

                // Smile
                c.fillStyle = '#7c2d12';
                c.fillRect(29, 39, 6, 2);

                // Blush
                if (avatarType === 'katara_blush') {
                    c.fillStyle = '#f43f5e';
                    c.fillRect(20, 34, 6, 3);
                    c.fillRect(38, 34, 6, 3);
                }

            } else {
                // Fire Nation Soldier Mask Portrait
                c.fillStyle = '#991b1b';
                c.fillRect(0, 0, 64, 64);
                c.fillStyle = '#27272a';
                c.fillRect(16, 14, 32, 36);
                c.fillStyle = '#dc2626'; // Topknot plume
                c.fillRect(28, 2, 8, 12);
                c.fillStyle = '#fef08a'; // Visor slit
                c.fillRect(22, 28, 6, 4);
                c.fillRect(36, 28, 6, 4);
            }

            pCtx.appendChild(pc);
        }

        // Color Lerp Helper
        lerpColor(a, b, amount) {
            const ah = parseInt(a.replace(/#/g, ''), 16);
            const ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
            const bh = parseInt(b.replace(/#/g, ''), 16);
            const br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
            const rr = Math.round(ar + amount * (br - ar));
            const rg = Math.round(ag + amount * (bg - ag));
            const rb = Math.round(ab + amount * (bb - ab));
            return `rgb(${rr},${rg},${rb})`;
        }

        // ====================================================================
        // ANIMATION LOOP
        // ====================================================================
        loop() {
            this.time += 0.03;

            if (this.enemy.state === 'hit') {
                this.enemy.x += this.enemy.vx;
                this.enemy.y += this.enemy.vy;
                this.enemy.vy += 0.35;
                if (this.enemy.x > VW + 60 || this.enemy.y > VH + 60) {
                    this.enemy.visible = false;
                }
            }

            this.render();
            requestAnimationFrame(this.loop);
        }
    }

    window.game = new KataangGame();

})();
