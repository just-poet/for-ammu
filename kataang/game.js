/* ============================================================================
   KATARA & AANG: 2D PIXEL ART ENGINE & INTERACTIVE STORY
   - 100% Pure Procedural 2D Pixel Art Canvas Rendering (Zero External Images)
   - Day Forest, Hills & Sparkling Lake Scene
   - Fire Nation Ambush & 5 Dynamic Dual-Bending Attack Scenes
   - Shift to Starlit Night with Lakeside Bonfire
   - Aang's 2-Month Confession Dialogue & Interactive Romantic Moments
   - Built-in Procedural Web Audio API Sound Effects & Avatar Chiptune Music
   ============================================================================ */

(function () {
    'use strict';

    // Virtual Internal Pixel Resolution for crisp retro rendering
    const VW = 480;
    const VH = 270;

    // ========================================================================
    // 1. PROCEDURAL SOUND & MUSIC ENGINE (Web Audio API - No External Files)
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

        playTone(freq, type = 'square', duration = 0.15, vol = 0.15, glideFreq = null) {
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
            } catch (e) {
                // Ignore audio autoplay restrictions
            }
        }

        // Noise buffer generator for water, wind & explosions
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

        // Sound Effects
        sfxWaterSplash() {
            this.createNoise(0.4, 0.25, 1200);
            this.playTone(400, 'sine', 0.3, 0.1, 150);
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

        // Background Music: Avatar Peaceful Kalimba Theme (Night) / Battle Chiptune
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
            // Taiko / high tension bassline & pentatonic melody
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
            // Avatar "The Avatar's Love" Kalimba & Flute Pentatonic Chimes
            // Key of C: C - D - E - G - A (Peaceful Kalimba melody)
            const kalimbaNotes = [
                523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
                587.33, 659.25, 880.00, 783.99,  // D5, E5, A5, G5
                523.25, 783.99, 659.25, 587.33,  // C5, G5, E5, D5
                440.00, 523.25, 659.25, 523.25   // A4, C5, E5, C5
            ];

            const flutePad = [
                261.63, 0, 329.63, 0, 392.00, 0, 440.00, 0,
                329.63, 0, 261.63, 0, 220.00, 0, 261.63, 0
            ];

            this.musicTimer = setInterval(() => {
                if (!this.enabled || !this.ctx) return;
                const k = kalimbaNotes[this.musicStep % kalimbaNotes.length];
                const f = flutePad[this.musicStep % flutePad.length];

                // Soft bell-like sine chime
                if (k > 0) this.playTone(k, 'sine', 0.45, 0.09);
                // Warm ambient base
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
    // 2. MAIN GAME & PIXEL ART CONTROLLER
    // ========================================================================
    class KataangGame {
        constructor() {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');

            // Offscreen canvas for virtual pixel resolution
            this.offCanvas = document.createElement('canvas');
            this.offCanvas.width = VW;
            this.offCanvas.height = VH;
            this.oc = this.offCanvas.getContext('2d');

            this.sound = new SoundEngine();

            // Screen & World Dimensions
            this.scale = 1;
            this.offsetX = 0;
            this.offsetY = 0;

            // Global State: 'INTRO', 'AMBUSH_DIALOGUE', 'BATTLE', 'NIGHT_TRANSITION', 'NIGHT_BONFIRE'
            this.state = 'INTRO';
            this.battlePhase = 1; // 1 to 5
            this.maxPhases = 5;

            // Day / Night Atmosphere (0 = Day, 1 = Deep Night)
            this.nightProgress = 0; 
            this.time = 0;

            // Characters
            this.katara = {
                x: 130,
                y: 195,
                state: 'idle', // 'idle', 'bending', 'night_sit', 'cuddle'
                animTimer: 0,
                blush: 0,
                hp: 100
            };

            this.aang = {
                x: 85,
                y: 195,
                state: 'idle', // 'idle', 'airblast', 'scooter', 'avatar_state', 'night_sit'
                animTimer: 0,
                avatarGlow: 0,
                blush: 0,
                hp: 100
            };

            this.enemy = {
                x: 360,
                y: 195,
                type: 'Scout',
                name: 'FIRE NATION SCOUT',
                hp: 100,
                maxHp: 100,
                state: 'idle', // 'idle', 'attack', 'hit', 'blast_off'
                vx: 0,
                vy: 0,
                rot: 0,
                visible: true
            };

            // Bonfire object for night scene
            this.bonfire = {
                x: 235,
                y: 200,
                active: false,
                flames: []
            };

            // Particle Systems
            this.particles = [];
            this.waterRibbons = [];
            this.airRibbons = [];
            this.fireBalls = [];
            this.floatingHearts = [];
            this.stars = [];
            this.clouds = [];
            this.shootingStars = [];

            // UI Elements
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

            // Dialogue State
            this.dialogueQueue = [];
            this.currentDialogue = null;
            this.typingTimer = null;
            this.isTyping = false;
            this.currentTextFull = '';

            // Attack Definitions for all 5 Scenes
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

        // ====================================================================
        // INITIALIZATION & ENVIRONMENT SETUP
        // ====================================================================
        initWorld() {
            // Generate Stars for night
            this.stars = [];
            for (let i = 0; i < 90; i++) {
                this.stars.push({
                    x: Math.random() * VW,
                    y: Math.random() * (VH * 0.55),
                    size: Math.random() > 0.8 ? 2 : 1,
                    baseAlpha: 0.3 + Math.random() * 0.7,
                    twinkleSpeed: 1 + Math.random() * 3,
                    phase: Math.random() * Math.PI * 2
                });
            }

            // Generate Day Clouds
            this.clouds = [
                { x: 20, y: 25, w: 60, h: 18, speed: 0.15 },
                { x: 180, y: 40, w: 85, h: 22, speed: 0.12 },
                { x: 340, y: 20, w: 70, h: 20, speed: 0.18 },
                { x: 480, y: 45, w: 90, h: 24, speed: 0.1 }
            ];

            // Setup Bonfire
            this.bonfire.flames = [];
            for (let i = 0; i < 24; i++) {
                this.bonfire.flames.push({
                    x: (Math.random() - 0.5) * 14,
                    y: Math.random() * 16,
                    vy: 0.5 + Math.random() * 1.2,
                    size: 3 + Math.random() * 4,
                    life: Math.random() * 30,
                    maxLife: 20 + Math.random() * 20
                });
            }
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx.imageSmoothingEnabled = false;

            const scaleX = this.canvas.width / VW;
            const scaleY = this.canvas.height / VH;
            this.scale = Math.max(scaleX, scaleY); // Cover container

            this.offsetX = (this.canvas.width - VW * this.scale) / 2;
            this.offsetY = (this.canvas.height - VH * this.scale) / 2;
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());

            // Sound Toggle
            const soundBtn = document.getElementById('sound-btn');
            const soundIcon = document.getElementById('sound-icon');
            const soundText = document.getElementById('sound-text');
            soundBtn.addEventListener('click', () => {
                const on = this.sound.toggle();
                soundIcon.textContent = on ? '🔊' : '🔇';
                soundText.textContent = on ? 'SOUND: ON' : 'SOUND: OFF';
            });

            // Start Adventure Button
            const startBtn = document.getElementById('start-btn');
            startBtn.addEventListener('click', () => this.startAdventure());

            // Restart Button
            const restartBtn = document.getElementById('restart-btn');
            restartBtn.addEventListener('click', () => this.restartGame());

            // Advance dialogue on click or Space
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

            // Begin Ambush Scene
            this.state = 'AMBUSH_DIALOGUE';
            this.sceneIndicator.textContent = 'FOREST AMBUSH!';
            this.sound.playTrack('battle');

            // Ambush Dialogues requested by user:
            // 1. Fire Nation: "ATTACK THEM"
            // 2. Katara: "AANG" lets attack them
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

            // Draw pixel portrait preview
            this.drawPortrait(d.avatar);

            // Typewriter effect
            this.typeText(d.text);
        }

        advanceDialogue() {
            if (this.isTyping) {
                // Instantly complete typing
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
        // 5 ATTACK SCENES BATTLE ENGINE
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
            this.enemy.y = 195;
            this.enemy.vx = 0;
            this.enemy.vy = 0;
            this.enemy.rot = 0;
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
            // Hide attack menu during attack animation
            this.attackMenu.classList.add('hidden');

            // 1. Katara Waterbending Action
            this.katara.state = 'bending';
            this.sound.sfxWaterSplash();

            // Spawn Water bending VFX
            this.triggerWaterAttack(move.id);

            // 2. Aang Airbending Synergy Action (Immediate follow-up)
            setTimeout(() => {
                this.aang.state = (this.battlePhase === 5) ? 'avatar_state' : 'airblast';
                if (this.battlePhase === 5) {
                    this.aang.avatarGlow = 1;
                }
                this.sound.sfxAirWhoosh();
                this.triggerAirSynergy(move.id);

                // Show Combo Banner
                this.comboBanner.classList.remove('hidden');
                this.comboText.textContent = `COMBO: ${move.name} + AIR SYNERGY!`;

                // 3. Enemy Hit & Knockback
                setTimeout(() => {
                    this.sound.sfxEnemyHit();
                    this.enemy.state = 'hit';
                    this.enemy.hp = 0;
                    this.updateHpBar(0);

                    // Add massive splash & steam particles
                    for (let i = 0; i < 30; i++) {
                        this.particles.push({
                            x: this.enemy.x,
                            y: this.enemy.y - 15,
                            vx: (Math.random() - 0.5) * 6,
                            vy: -Math.random() * 5 - 2,
                            color: Math.random() > 0.4 ? '#38bdf8' : '#ffffff',
                            size: 2 + Math.random() * 4,
                            life: 25 + Math.random() * 20
                        });
                    }

                    // Floating Damage Number
                    this.particles.push({
                        isText: true,
                        text: 'CRITICAL COMBO! 💥',
                        x: this.enemy.x,
                        y: this.enemy.y - 40,
                        vx: 0,
                        vy: -0.8,
                        color: '#fef08a',
                        life: 45
                    });

                    // Knock enemy off screen / into lake
                    this.enemy.vx = 4 + Math.random() * 3;
                    this.enemy.vy = -7 - Math.random() * 3;

                    // Transition to Next Phase or Night Scene
                    setTimeout(() => {
                        this.finishPhase();
                    }, 1400);

                }, 400);

            }, 300);
        }

        triggerWaterAttack(moveId) {
            // Create fluid water ribbons from Katara (x: 130, y: 195) to Enemy (x: 360, y: 195)
            const kx = this.katara.x + 15;
            const ky = this.katara.y - 15;
            const ex = this.enemy.x;
            const ey = this.enemy.y - 15;

            if (moveId === 'water_whip' || moveId === 'water_slice') {
                this.waterRibbons.push({
                    type: 'whip',
                    sx: kx, sy: ky,
                    ex: ex, ey: ey,
                    progress: 0,
                    color: '#38bdf8',
                    width: 5,
                    life: 30
                });
            } else if (moveId === 'ice_spikes' || moveId === 'glacial_lance') {
                for (let i = 0; i < 7; i++) {
                    this.waterRibbons.push({
                        type: 'ice_spike',
                        sx: kx, sy: ky + (i - 3) * 6,
                        ex: ex, ey: ey + (i - 3) * 8,
                        progress: 0,
                        speed: 0.08 + i * 0.02,
                        color: '#bae6fd',
                        life: 35
                    });
                }
            } else if (moveId === 'octopus_form' || moveId === 'water_dome') {
                // 8 water tentacles swirling around Katara
                for (let i = 0; i < 8; i++) {
                    this.waterRibbons.push({
                        type: 'octopus_arm',
                        angle: (i / 8) * Math.PI * 2,
                        length: 38,
                        sx: kx, sy: ky,
                        life: 45
                    });
                }
            } else if (moveId === 'lake_tidal_wave' || moveId === 'torrent_geyser') {
                // Massive cresting wave from the right lake
                this.waterRibbons.push({
                    type: 'tidal_wave',
                    x: 420,
                    targetX: 280,
                    height: 90,
                    life: 45
                });
            } else {
                // Twin Water Dragons (Scene 5 finale)
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
                    sx: kx, sy: ky - 10,
                    ex: ex, ey: ey - 10,
                    t: Math.PI,
                    color: '#38bdf8',
                    life: 60
                });
            }
        }

        triggerAirSynergy(moveId) {
            const ax = this.aang.x + 12;
            const ay = this.aang.y - 15;
            const ex = this.enemy.x;
            const ey = this.enemy.y - 15;

            // Spiral Air Gusts
            for (let i = 0; i < 4; i++) {
                this.airRibbons.push({
                    sx: ax, sy: ay + (i - 1.5) * 8,
                    ex: ex + 20, ey: ey,
                    progress: 0,
                    radius: 12 + i * 4,
                    life: 35
                });
            }

            if (this.battlePhase === 5) {
                // Avatar State energy ring
                for (let i = 0; i < 40; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = 2 + Math.random() * 4;
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
            // Reset character states
            this.katara.state = 'idle';
            this.aang.state = 'idle';

            if (this.battlePhase < this.maxPhases) {
                // Advance to next wave
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
                // Battle Won! Shift to Night Bonfire Scene
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

            // Switch to peaceful Avatar night music
            this.sound.playTrack('night');

            setTimeout(() => {
                // Shift world state to night
                this.nightProgress = 1;
                this.sceneIndicator.textContent = 'LAKESIDE BONFIRE (NIGHT)';
                this.bonfire.active = true;

                // Move Katara and Aang beside the campfire
                this.katara.x = 280;
                this.katara.y = 205;
                this.katara.state = 'night_sit';
                this.katara.blush = 1;

                this.aang.x = 190;
                this.aang.y = 205;
                this.aang.state = 'night_sit';
                this.aang.blush = 1;

                // Remove curtain smoothly
                this.fadeCurtain.classList.remove('active');
                this.state = 'NIGHT_BONFIRE';

                // Display Aang's exact dialogue from prompt!
                setTimeout(() => {
                    this.queueDialogue([
                        {
                            speaker: 'AANG',
                            style: 'aang',
                            avatar: 'aang_blush',
                            text: 'Hiiii Katara, its 2 month since confession and it was the best decision ever . i love youuuuuuuuuuu and i love every moment we sharee '
                        }
                    ], () => {
                        // Open interactive romantic panel
                        this.nightActions.classList.remove('hidden');
                    });
                }, 800);

            }, 900);
        }

        triggerRomanticAction(actionType) {
            this.sound.sfxHeartChime();

            if (actionType === 'love') {
                this.katara.state = 'night_sit';
                this.spawnFloatingHearts(this.katara.x, this.katara.y - 20, 12);
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
                this.katara.x = 220; // Lean right on Aang
                this.spawnFloatingHearts(this.katara.x, this.katara.y - 15, 10);
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
                // Waterbend glowing heart from the lake
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
                    x: x + (Math.random() - 0.5) * 20,
                    y: y + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -0.6 - Math.random() * 0.8,
                    size: 4 + Math.random() * 3,
                    alpha: 1,
                    life: 40 + Math.random() * 25
                });
            }
        }

        spawnWaterHeart() {
            // Heart-shaped floating water particle constellation
            const centerX = 235;
            const centerY = 140;
            for (let t = 0; t < Math.PI * 2; t += 0.2) {
                // Heart curve: x = 16 sin^3(t), y = -(13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t))
                const hx = 1.2 * (16 * Math.pow(Math.sin(t), 3));
                const hy = -1.2 * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                this.particles.push({
                    x: centerX + hx,
                    y: centerY + hy,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: -0.2,
                    color: Math.random() > 0.3 ? '#38bdf8' : '#e0f2fe',
                    size: 3,
                    life: 90
                });
            }
        }

        spawnShootingStar() {
            this.shootingStars.push({
                x: 80 + Math.random() * 150,
                y: 10 + Math.random() * 30,
                vx: 4.5,
                vy: 2.2,
                length: 30,
                life: 30
            });
        }

        restartGame() {
            this.state = 'INTRO';
            this.nightProgress = 0;
            this.bonfire.active = false;
            this.katara.x = 130;
            this.katara.y = 195;
            this.katara.state = 'idle';
            this.katara.blush = 0;
            this.aang.x = 85;
            this.aang.y = 195;
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
        // 3. PURE 2D PROCEDURAL PIXEL ART RENDERING (ZERO IMAGES)
        // ====================================================================
        render() {
            const ctx = this.oc;

            // 1. Sky & Atmosphere (Day to Sunset to Night)
            this.drawSky(ctx);

            // 2. Distant Hills & Mountain Ridges
            this.drawHillsAndMountains(ctx);

            // 3. Lake (Water surface, reflections & ripples)
            this.drawLake(ctx);

            // 4. Forest Trees & Grassy Meadow
            this.drawForestMeadow(ctx);

            // 5. Bonfire (at Night)
            if (this.bonfire.active || this.nightProgress > 0.5) {
                this.drawBonfire(ctx);
            }

            // 6. Characters
            this.drawAang(ctx);
            this.drawKatara(ctx);
            if (this.state === 'BATTLE' && this.enemy.visible) {
                this.drawEnemy(ctx);
            }

            // 7. Visual Bending Effects & Particles
            this.drawVisualEffects(ctx);

            // Copy offscreen canvas to main canvas with crisp pixel scaling
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(
                this.offCanvas,
                0, 0, VW, VH,
                this.offsetX, this.offsetY, VW * this.scale, VH * this.scale
            );
        }

        // DRAW SKY & STARS
        drawSky(ctx) {
            const t = this.nightProgress; // 0 = day, 1 = night

            // Day Sky Colors
            const dayTop = [112, 164, 219];
            const dayBottom = [203, 227, 251];

            // Night Sky Colors (Deep indigo / midnight blue)
            const nightTop = [10, 14, 26];
            const nightBottom = [30, 27, 75];

            // Lerp sky colors
            const r1 = Math.round(dayTop[0] + (nightTop[0] - dayTop[0]) * t);
            const g1 = Math.round(dayTop[1] + (nightTop[1] - dayTop[1]) * t);
            const b1 = Math.round(dayTop[2] + (nightTop[2] - dayTop[2]) * t);

            const r2 = Math.round(dayBottom[0] + (nightBottom[0] - dayBottom[0]) * t);
            const g2 = Math.round(dayBottom[1] + (nightBottom[1] - dayBottom[1]) * t);
            const b2 = Math.round(dayBottom[2] + (nightBottom[2] - dayBottom[2]) * t);

            const grad = ctx.createLinearGradient(0, 0, 0, VH * 0.7);
            grad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
            grad.addColorStop(1, `rgb(${r2},${g2},${b2})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, VW, VH * 0.7);

            // Draw Stars at night
            if (t > 0.2) {
                this.stars.forEach(st => {
                    const alpha = st.baseAlpha * Math.sin(this.time * st.twinkleSpeed + st.phase) * t;
                    if (alpha > 0.05) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, Math.max(0, alpha))})`;
                        ctx.fillRect(Math.floor(st.x), Math.floor(st.y), st.size, st.size);
                    }
                });

                // Crescent Moon
                const moonX = 390;
                const moonY = 40;
                const moonAlpha = t;
                ctx.fillStyle = `rgba(254, 240, 138, ${moonAlpha})`;
                // Outer circle
                ctx.beginPath();
                ctx.arc(moonX, moonY, 14, 0, Math.PI * 2);
                ctx.fill();
                // Inner cutout for crescent
                ctx.fillStyle = `rgba(${r1}, ${g1}, ${b1}, ${moonAlpha})`;
                ctx.beginPath();
                ctx.arc(moonX - 5, moonY - 3, 12, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw Sun and Clouds in day
            if (t < 0.8) {
                const sunAlpha = 1 - t;
                // Soft pixel sun
                ctx.fillStyle = `rgba(253, 224, 71, ${sunAlpha * 0.9})`;
                ctx.fillRect(60, 35, 22, 22);
                ctx.fillStyle = `rgba(254, 240, 138, ${sunAlpha * 0.5})`;
                ctx.fillRect(57, 32, 28, 28);

                // Pixel Clouds
                this.clouds.forEach(cl => {
                    cl.x += cl.speed;
                    if (cl.x > VW + 40) cl.x = -100;
                    this.drawPixelCloud(ctx, cl.x, cl.y, cl.w, cl.h, sunAlpha);
                });
            }

            // Shooting Stars
            this.shootingStars.forEach((ss, idx) => {
                ctx.strokeStyle = `rgba(255, 255, 255, ${ss.life / 30})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(ss.x - ss.vx * 3, ss.y - ss.vy * 3);
                ctx.stroke();

                ss.x += ss.vx;
                ss.y += ss.vy;
                ss.life--;
                if (ss.life <= 0) this.shootingStars.splice(idx, 1);
            });
        }

        drawPixelCloud(ctx, x, y, w, h, alpha) {
            ctx.fillStyle = `rgba(248, 250, 252, ${alpha * 0.85})`;
            // Stepped cloud puffs
            const bx = Math.floor(x);
            const by = Math.floor(y);
            ctx.fillRect(bx + 10, by, w - 20, h);
            ctx.fillRect(bx, by + 4, w, h - 8);
            ctx.fillRect(bx + 18, by - 4, w - 36, h);
        }

        // DISTANT HILLS & MOUNTAINS
        drawHillsAndMountains(ctx) {
            const t = this.nightProgress;

            // Distant purple/blue mountain peaks
            const mtnColor = t > 0.5 ? '#1e1b4b' : '#64748b';
            ctx.fillStyle = mtnColor;
            ctx.beginPath();
            ctx.moveTo(0, 130);
            ctx.lineTo(80, 85);
            ctx.lineTo(160, 135);
            ctx.lineTo(240, 95);
            ctx.lineTo(330, 140);
            ctx.lineTo(420, 90);
            ctx.lineTo(VW, 135);
            ctx.lineTo(VW, 160);
            ctx.lineTo(0, 160);
            ctx.closePath();
            ctx.fill();

            // Rolling Green Hills
            const hillFarColor = t > 0.5 ? '#143120' : '#2d6a3f';
            ctx.fillStyle = hillFarColor;
            ctx.beginPath();
            ctx.arc(100, 190, 130, Math.PI, 0);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(360, 195, 140, Math.PI, 0);
            ctx.fill();

            // Near rolling hill ridge
            const hillNearColor = t > 0.5 ? '#0f2918' : '#3e844e';
            ctx.fillStyle = hillNearColor;
            ctx.beginPath();
            ctx.arc(220, 210, 150, Math.PI, 0);
            ctx.fill();

            // Silhouette Pine trees along hill ridges
            const pineRidgeColor = t > 0.5 ? '#091c10' : '#1e4828';
            for (let i = 0; i < 18; i++) {
                const px = 20 + i * 26;
                const py = 120 + Math.sin(i * 0.8) * 12;
                this.drawMiniPine(ctx, px, py, pineRidgeColor);
            }
        }

        drawMiniPine(ctx, x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x + 2, y, 2, 10);
            ctx.fillRect(x, y + 2, 6, 3);
            ctx.fillRect(x - 2, y + 5, 10, 4);
            ctx.fillRect(x - 4, y + 9, 14, 4);
        }

        // LAKE (Water surface with reflections & ripples)
        drawLake(ctx) {
            const t = this.nightProgress;
            const lakeX = 310;
            const lakeY = 150;
            const lakeW = VW - lakeX;
            const lakeH = 75;

            // Water Gradient
            const lakeGrad = ctx.createLinearGradient(lakeX, lakeY, lakeX, lakeY + lakeH);
            if (t > 0.5) {
                lakeGrad.addColorStop(0, '#0c1a30');
                lakeGrad.addColorStop(1, '#081224');
            } else {
                lakeGrad.addColorStop(0, '#2563eb');
                lakeGrad.addColorStop(1, '#1d4ed8');
            }
            ctx.fillStyle = lakeGrad;

            // Shore curve
            ctx.beginPath();
            ctx.moveTo(lakeX, lakeY + 20);
            ctx.bezierCurveTo(lakeX + 20, lakeY + 45, lakeX - 15, lakeY + 65, lakeX + 15, lakeY + lakeH);
            ctx.lineTo(VW, lakeY + lakeH);
            ctx.lineTo(VW, lakeY);
            ctx.lineTo(lakeX + 40, lakeY);
            ctx.closePath();
            ctx.fill();

            // Animated Water Ripples & Light Reflection
            const rippleColor = t > 0.5 ? '#38bdf844' : '#93c5fd77';
            ctx.fillStyle = rippleColor;
            for (let r = 0; r < 7; r++) {
                const rx = lakeX + 30 + ((r * 25 + this.time * 15) % (lakeW - 40));
                const ry = lakeY + 10 + r * 9;
                const rw = 14 + (r % 3) * 6;
                ctx.fillRect(Math.floor(rx), Math.floor(ry), rw, 2);
            }

            // Moon Reflection Trail on Lake at Night
            if (t > 0.4) {
                ctx.fillStyle = `rgba(254, 240, 138, ${0.4 * t})`;
                const trailX = 390;
                for (let i = 0; i < 8; i++) {
                    const ty = lakeY + 6 + i * 8;
                    const tw = 6 + i * 4 + Math.sin(this.time * 3 + i) * 4;
                    ctx.fillRect(Math.floor(trailX - tw / 2), Math.floor(ty), Math.floor(tw), 2);
                }
            }

            // Shoreline stones and reeds
            const stoneColor = t > 0.5 ? '#1f2937' : '#475569';
            ctx.fillStyle = stoneColor;
            ctx.fillRect(lakeX + 10, lakeY + 30, 8, 4);
            ctx.fillRect(lakeX + 2, lakeY + 52, 10, 5);
            ctx.fillRect(lakeX + 12, lakeY + 68, 7, 3);
        }

        // FOREST CLEARING & TREES
        drawForestMeadow(ctx) {
            const t = this.nightProgress;

            // Ground meadow base
            const meadowColor = t > 0.5 ? '#06180b' : '#15803d';
            ctx.fillStyle = meadowColor;
            ctx.fillRect(0, 190, VW, VH - 190);

            // Grassy Dithering & Wildflowers
            ctx.fillStyle = t > 0.5 ? '#0d2814' : '#22c55e';
            for (let x = 0; x < VW; x += 12) {
                ctx.fillRect(x, 190, 8, 3);
                ctx.fillRect(x + 4, 193, 4, 3);
                if (x % 36 === 0) {
                    // Small pixel wildflowers (Water tribe blue and white)
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(x + 2, 197, 2, 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x + 3, 198, 1, 1);
                    ctx.fillStyle = t > 0.5 ? '#0d2814' : '#22c55e';
                }
            }

            // Large Left Forest Pine Trees
            const treeTrunk = t > 0.5 ? '#1c130d' : '#451a03';
            const pineDark = t > 0.5 ? '#05180c' : '#14532d';
            const pineLight = t > 0.5 ? '#0c2e17' : '#16a34a';

            this.drawDetailedPine(ctx, 35, 125, treeTrunk, pineDark, pineLight);
            this.drawDetailedPine(ctx, -10, 110, treeTrunk, pineDark, pineLight);
            this.drawDetailedPine(ctx, 80, 135, treeTrunk, pineDark, pineLight, 0.85);

            // Leaf particles drifting in the wind
            for (let i = 0; i < 4; i++) {
                const lx = (this.time * 20 + i * 110) % VW;
                const ly = 130 + Math.sin(this.time * 2 + i) * 30;
                ctx.fillStyle = t > 0.5 ? '#0f381a' : '#86efac';
                ctx.fillRect(Math.floor(lx), Math.floor(ly), 2, 2);
            }
        }

        drawDetailedPine(ctx, x, y, trunkCol, darkNeedles, lightNeedles, scale = 1) {
            const bx = Math.floor(x);
            const by = Math.floor(y);
            const w = Math.floor(40 * scale);
            const h = Math.floor(75 * scale);

            // Trunk
            ctx.fillStyle = trunkCol;
            ctx.fillRect(bx + w / 2 - 3, by + h - 18, 6, 22);

            // Layered Needles (Top to bottom)
            const tiers = 4;
            for (let i = 0; i < tiers; i++) {
                const tw = Math.floor((14 + i * 8) * scale);
                const th = Math.floor(16 * scale);
                const ty = by + Math.floor(i * 14 * scale);

                ctx.fillStyle = darkNeedles;
                ctx.fillRect(bx + w / 2 - tw / 2, ty, tw, th);
                ctx.fillStyle = lightNeedles;
                ctx.fillRect(bx + w / 2 - tw / 2 + 2, ty, tw - 4, th - 4);
            }
        }

        // BONFIRE RENDERING (For Night Scene)
        drawBonfire(ctx) {
            const bx = this.bonfire.x;
            const by = this.bonfire.y;

            // Warm firelight glow on grass
            const glowGrad = ctx.createRadialGradient(bx, by - 6, 4, bx, by - 6, 65);
            glowGrad.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
            glowGrad.addColorStop(0.6, 'rgba(249, 115, 22, 0.15)');
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(bx, by - 6, 65, 0, Math.PI * 2);
            ctx.fill();

            // Campfire Stone Circle
            ctx.fillStyle = '#475569';
            for (let a = 0; a < Math.PI * 2; a += 0.7) {
                const sx = bx + Math.cos(a) * 14;
                const sy = by + Math.sin(a) * 6;
                ctx.fillRect(Math.floor(sx) - 2, Math.floor(sy) - 2, 4, 3);
            }

            // Crossed Wooden Logs
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(bx - 10, by - 2, 20, 4);
            ctx.fillStyle = '#271711';
            ctx.fillRect(bx - 8, by - 4, 16, 3);

            // Dancing Animated Pixel Flames
            this.bonfire.flames.forEach(f => {
                f.y -= f.vy;
                f.life++;
                if (f.life >= f.maxLife) {
                    f.life = 0;
                    f.y = Math.random() * 4;
                    f.x = (Math.random() - 0.5) * 12;
                }

                const progress = f.life / f.maxLife;
                const fx = bx + f.x + Math.sin(this.time * 6 + f.x) * 2;
                const fy = by - f.y - 4;
                const fSize = Math.max(1, Math.floor(f.size * (1 - progress)));

                // Color transition: White core -> Yellow -> Orange -> Red ember
                let fCol = '#ffffff';
                if (progress > 0.15) fCol = '#fef08a';
                if (progress > 0.45) fCol = '#f97316';
                if (progress > 0.75) fCol = '#dc2626';

                ctx.fillStyle = fCol;
                ctx.fillRect(Math.floor(fx), Math.floor(fy), fSize, fSize);
            });

            // Rising Embers
            if (Math.random() > 0.6) {
                this.particles.push({
                    x: bx + (Math.random() - 0.5) * 10,
                    y: by - 12,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -1 - Math.random() * 1.5,
                    color: '#fef08a',
                    size: 1,
                    life: 25
                });
            }

            // Fireflies floating near bonfire and lake
            for (let i = 0; i < 8; i++) {
                const ffx = bx + Math.cos(this.time * 0.8 + i) * (50 + i * 15);
                const ffy = by - 30 + Math.sin(this.time * 1.2 + i * 2) * 25;
                const fAlpha = 0.4 + Math.sin(this.time * 4 + i) * 0.4;
                if (fAlpha > 0.1) {
                    ctx.fillStyle = `rgba(190, 242, 100, ${fAlpha})`;
                    ctx.fillRect(Math.floor(ffx), Math.floor(ffy), 2, 2);
                }
            }
        }

        // ====================================================================
        // PIXEL CHARACTERS: KATARA & AANG
        // ====================================================================
        drawKatara(ctx) {
            const k = this.katara;
            const x = Math.floor(k.x);
            const y = Math.floor(k.y);

            // Palette
            const skin = '#c98c60';
            const skinShadow = '#a1653e';
            const hair = '#2b1810';
            const robeBlue = '#0284c7';
            const robeDark = '#0369a1';
            const trimWhite = '#f8fafc';
            const boots = '#451a03';
            const choker = '#0369a1';
            const pendant = '#38bdf8';

            if (k.state === 'night_sit' || k.state === 'cuddle') {
                // SITTING COZY BY BONFIRE
                const sy = y + 4;
                // Legs crossed on grass
                ctx.fillStyle = robeDark;
                ctx.fillRect(x - 8, sy + 6, 18, 7);
                ctx.fillStyle = boots;
                ctx.fillRect(x - 9, sy + 10, 6, 4);

                // Body & Tunic
                ctx.fillStyle = robeBlue;
                ctx.fillRect(x - 6, sy - 6, 14, 13);
                // White fleece collar trim
                ctx.fillStyle = trimWhite;
                ctx.fillRect(x - 5, sy - 6, 12, 2);

                // Head
                ctx.fillStyle = skin;
                ctx.fillRect(x - 5, sy - 18, 12, 12);

                // Hair & Ponytail
                ctx.fillStyle = hair;
                ctx.fillRect(x - 6, sy - 21, 14, 5);
                ctx.fillRect(x - 7, sy - 19, 4, 10);
                // Katara's Iconic Hair Loopies!
                ctx.fillRect(x - 6, sy - 14, 2, 9);
                ctx.fillRect(x + 5, sy - 14, 2, 9);

                // Eyes looking at Aang (left)
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(x - 4, sy - 13, 2, 2);
                ctx.fillRect(x, sy - 13, 2, 2);

                // Blushing pink cheeks
                if (k.blush > 0) {
                    ctx.fillStyle = '#f43f5e';
                    ctx.fillRect(x - 4, sy - 10, 3, 2);
                    ctx.fillRect(x + 1, sy - 10, 3, 2);
                }

                // Betrothal Necklace Choker
                ctx.fillStyle = choker;
                ctx.fillRect(x - 4, sy - 8, 8, 2);
                ctx.fillStyle = pendant;
                ctx.fillRect(x - 1, sy - 7, 2, 2);

            } else {
                // STANDING / WATERBENDING COMBAT STANCE
                const bob = Math.sin(this.time * 4) * 1;

                // Boots
                ctx.fillStyle = boots;
                ctx.fillRect(x - 6, y + 10, 4, 6);
                ctx.fillRect(x + 2, y + 10, 4, 6);

                // Trousers
                ctx.fillStyle = robeDark;
                ctx.fillRect(x - 6, y + 4, 12, 7);

                // Tunic & White trim
                ctx.fillStyle = robeBlue;
                ctx.fillRect(x - 7, y - 10 + bob, 14, 15);
                ctx.fillStyle = trimWhite;
                ctx.fillRect(x - 7, y + 3 + bob, 14, 2);
                ctx.fillRect(x - 6, y - 10 + bob, 12, 2);

                // Water Pouch / Canteen at hip
                ctx.fillStyle = '#6b4423';
                ctx.fillRect(x + 7, y - 2 + bob, 4, 5);
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(x + 8, y - 1 + bob, 2, 3);

                // Arms
                if (k.state === 'bending') {
                    // Outstretched bending arms
                    ctx.fillStyle = skin;
                    ctx.fillRect(x + 7, y - 8 + bob, 12, 4);
                    // Swirling water ribbon around hands
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(x + 15, y - 12 + bob, 6, 3);
                    ctx.fillRect(x + 17, y - 7 + bob, 4, 5);
                } else {
                    ctx.fillStyle = skin;
                    ctx.fillRect(x - 9, y - 7 + bob, 3, 10);
                    ctx.fillRect(x + 6, y - 7 + bob, 3, 10);
                }

                // Head
                ctx.fillStyle = skin;
                ctx.fillRect(x - 5, y - 22 + bob, 10, 12);

                // Hair Loopies (Iconic Katara signature)
                ctx.fillStyle = hair;
                ctx.fillRect(x - 6, y - 25 + bob, 13, 5);
                ctx.fillRect(x - 7, y - 23 + bob, 3, 11);
                // Curled hair loopies flanking face
                ctx.fillRect(x - 6, y - 18 + bob, 2, 8);
                ctx.fillRect(x + 4, y - 18 + bob, 2, 8);

                // Eyes & Smile
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(x - 3, y - 17 + bob, 2, 2);
                ctx.fillRect(x + 1, y - 17 + bob, 2, 2);

                // Betrothal Necklace
                ctx.fillStyle = choker;
                ctx.fillRect(x - 4, y - 12 + bob, 8, 2);
                ctx.fillStyle = pendant;
                ctx.fillRect(x - 1, y - 11 + bob, 2, 2);
            }
        }

        drawAang(ctx) {
            const a = this.aang;
            const x = Math.floor(a.x);
            const y = Math.floor(a.y);

            // Palette
            const skin = '#fcd34d';
            const robesYellow = '#fde047';
            const robesOrange = '#f97316';
            const arrowBlue = a.avatarGlow > 0 ? '#ffffff' : '#00e5ff';
            const arrowBloom = '#38bdf8';
            const boots = '#5c3a21';

            if (a.state === 'night_sit') {
                // SITTING BESIDE KATARA BY BONFIRE
                const sy = y + 4;
                // Legs crossed
                ctx.fillStyle = robesOrange;
                ctx.fillRect(x - 8, sy + 6, 18, 7);
                ctx.fillStyle = boots;
                ctx.fillRect(x + 6, sy + 9, 6, 4);

                // Body
                ctx.fillStyle = robesYellow;
                ctx.fillRect(x - 6, sy - 6, 14, 13);
                // Orange Monk Shawl draped
                ctx.fillStyle = robesOrange;
                ctx.fillRect(x - 6, sy - 6, 8, 12);

                // Head (Bald with blue arrow tattoo)
                ctx.fillStyle = skin;
                ctx.fillRect(x - 5, sy - 18, 12, 12);

                // Blue Arrow Tattoo on Forehead pointing down
                ctx.fillStyle = arrowBlue;
                ctx.fillRect(x - 1, sy - 21, 3, 7);
                ctx.fillRect(x - 2, sy - 16, 5, 2);

                // Warm smile looking at Katara (right)
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(x, sy - 13, 2, 2);
                ctx.fillRect(x + 4, sy - 13, 2, 2);
                ctx.fillStyle = '#b45309';
                ctx.fillRect(x + 1, sy - 9, 4, 1);

                // Blushing pink cheeks (for his 2-month confession!)
                if (a.blush > 0) {
                    ctx.fillStyle = '#f43f5e';
                    ctx.fillRect(x - 1, sy - 10, 3, 2);
                    ctx.fillRect(x + 4, sy - 10, 3, 2);
                }

                // Glider staff resting on ground
                ctx.fillStyle = '#854d0e';
                ctx.fillRect(x - 12, sy - 10, 3, 24);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x - 13, sy - 12, 5, 4);

            } else {
                // COMBAT / AIRBENDING STANCE
                const bob = Math.sin(this.time * 4 + 1) * 1;

                // Avatar State Electric Glow Aura
                if (a.state === 'avatar_state' || a.avatarGlow > 0) {
                    ctx.fillStyle = `rgba(56, 189, 248, ${0.4 + Math.sin(this.time * 10) * 0.2})`;
                    ctx.beginPath();
                    ctx.arc(x + 1, y - 10, 24, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Boots
                ctx.fillStyle = boots;
                ctx.fillRect(x - 5, y + 10, 4, 6);
                ctx.fillRect(x + 2, y + 10, 4, 6);

                // Robes & Shawl
                ctx.fillStyle = robesYellow;
                ctx.fillRect(x - 6, y - 8 + bob, 13, 18);
                ctx.fillStyle = robesOrange;
                ctx.fillRect(x - 6, y - 8 + bob, 7, 16);

                // Head
                ctx.fillStyle = skin;
                ctx.fillRect(x - 5, y - 20 + bob, 11, 12);

                // Arrow Tattoo
                ctx.fillStyle = arrowBlue;
                ctx.fillRect(x - 1, y - 24 + bob, 3, 8);
                ctx.fillRect(x - 2, y - 18 + bob, 5, 2);

                // Eyes (Glowing white in Avatar state!)
                if (a.state === 'avatar_state') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x - 3, y - 15 + bob, 3, 3);
                    ctx.fillRect(x + 2, y - 15 + bob, 3, 3);
                } else {
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(x - 3, y - 15 + bob, 2, 2);
                    ctx.fillRect(x + 2, y - 15 + bob, 2, 2);
                }

                // Airbending Glider Staff
                ctx.fillStyle = '#854d0e';
                ctx.fillRect(x + 8, y - 22 + bob, 2, 32);
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(x + 6, y - 24 + bob, 6, 4);

                // Air scooter underneath if attacking
                if (a.state === 'scooter' || a.state === 'airblast') {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.beginPath();
                    ctx.arc(x, y + 16, 12, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // FIRE NATION ENEMIES
        drawEnemy(ctx) {
            const e = this.enemy;
            const x = Math.floor(e.x);
            const y = Math.floor(e.y);

            ctx.save();
            ctx.translate(x, y);
            if (e.state === 'hit') {
                ctx.rotate(this.time * 8);
            }

            // Fire Nation Crimson & Charcoal Armor
            const armorRed = '#991b1b';
            const armorDark = '#1c1917';
            const goldTrim = '#fbbf24';

            // Boots & Greaves
            ctx.fillStyle = armorDark;
            ctx.fillRect(-6, 10, 4, 6);
            ctx.fillRect(2, 10, 4, 6);

            // Armored Tunic
            ctx.fillStyle = armorRed;
            ctx.fillRect(-7, -8, 14, 18);
            ctx.fillStyle = goldTrim;
            ctx.fillRect(-7, 2, 14, 2);

            // Spiked Pauldrons (Shoulders)
            ctx.fillStyle = armorDark;
            ctx.fillRect(-10, -8, 3, 6);
            ctx.fillRect(7, -8, 3, 6);

            // Helmet & Skull Face Mask
            ctx.fillStyle = armorDark;
            ctx.fillRect(-5, -20, 11, 12);
            // Red Plume on Top
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-1, -26, 3, 6);
            // Mask slit eyes
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(-3, -16, 2, 2);
            ctx.fillRect(1, -16, 2, 2);

            // Fire in hand if attacking
            if (e.state === 'idle') {
                ctx.fillStyle = '#f97316';
                ctx.fillRect(-12, -2, 5, 5);
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(-11, -1, 3, 3);
            }

            ctx.restore();
        }

        // DRAW VISUAL EFFECTS & DUAL-BENDING COMBOS
        drawVisualEffects(ctx) {
            // 1. Water Ribbons & Waves
            this.waterRibbons.forEach((wr, idx) => {
                wr.life--;
                if (wr.type === 'whip') {
                    ctx.strokeStyle = wr.color;
                    ctx.lineWidth = wr.width;
                    ctx.beginPath();
                    ctx.moveTo(wr.sx, wr.sy);
                    // Curving wave path
                    const cx = (wr.sx + wr.ex) / 2;
                    const cy = Math.min(wr.sy, wr.ey) - 35 + Math.sin(this.time * 12) * 15;
                    ctx.quadraticCurveTo(cx, cy, wr.ex, wr.ey);
                    ctx.stroke();

                    // Water droplets
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(wr.ex - 3, wr.ey - 3, 6, 6);

                } else if (wr.type === 'ice_spike') {
                    ctx.fillStyle = wr.color;
                    wr.sx += (wr.ex - wr.sx) * wr.speed;
                    wr.sy += (wr.ey - wr.sy) * wr.speed;
                    // Draw diamond ice spike
                    ctx.beginPath();
                    ctx.moveTo(wr.sx + 8, wr.sy);
                    ctx.lineTo(wr.sx, wr.sy - 3);
                    ctx.lineTo(wr.sx - 8, wr.sy);
                    ctx.lineTo(wr.sx, wr.sy + 3);
                    ctx.closePath();
                    ctx.fill();

                } else if (wr.type === 'octopus_arm') {
                    const wave = Math.sin(this.time * 8 + wr.angle) * 12;
                    const ex = wr.sx + Math.cos(wr.angle) * wr.length + wave;
                    const ey = wr.sy + Math.sin(wr.angle) * (wr.length * 0.6) + wave;

                    ctx.strokeStyle = '#38bdf8';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(wr.sx, wr.sy);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();

                } else if (wr.type === 'tidal_wave') {
                    ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
                    ctx.fillRect(wr.x, 140, 60, 60);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(wr.x, 138, 60, 4);
                    wr.x -= 3.5;

                } else if (wr.type === 'dragon') {
                    // Spiraling twin water dragons
                    wr.t += 0.15;
                    const dx = wr.sx + (wr.ex - wr.sx) * Math.min(1, wr.t / 3);
                    const dy = wr.sy - 20 + Math.sin(wr.t * 3) * 25;
                    ctx.fillStyle = wr.color;
                    ctx.beginPath();
                    ctx.arc(dx, dy, 9, 0, Math.PI * 2);
                    ctx.fill();
                    // Dragon glowing eye
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(dx + 2, dy - 2, 3, 3);
                }

                if (wr.life <= 0) this.waterRibbons.splice(idx, 1);
            });

            // 2. Air Ribbons & Gusts
            this.airRibbons.forEach((ar, idx) => {
                ar.life--;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                const midX = (ar.sx + ar.ex) / 2;
                const midY = (ar.sy + ar.ey) / 2 + Math.sin(this.time * 10) * ar.radius;
                ctx.moveTo(ar.sx, ar.sy);
                ctx.quadraticCurveTo(midX, midY, ar.ex, ar.ey);
                ctx.stroke();
                if (ar.life <= 0) this.airRibbons.splice(idx, 1);
            });

            // 3. General Particles (Splashes, Text, Embers)
            this.particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                if (p.isText) {
                    ctx.fillStyle = p.color;
                    ctx.font = '8px "Press Start 2P", monospace';
                    ctx.fillText(p.text, Math.floor(p.x - 30), Math.floor(p.y));
                } else {
                    ctx.fillStyle = p.color;
                    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
                }

                if (p.life <= 0) this.particles.splice(idx, 1);
            });

            // 4. Romantic Floating Hearts
            this.floatingHearts.forEach((h, idx) => {
                h.x += h.vx;
                h.y += h.vy;
                h.life--;

                ctx.fillStyle = `rgba(244, 63, 94, ${Math.min(1, h.life / 20)})`;
                const hx = Math.floor(h.x);
                const hy = Math.floor(h.y);
                // Pixel heart drawing
                ctx.fillRect(hx - 2, hy - 2, 2, 2);
                ctx.fillRect(hx + 1, hy - 2, 2, 2);
                ctx.fillRect(hx - 3, hy - 1, 7, 2);
                ctx.fillRect(hx - 2, hy + 1, 5, 2);
                ctx.fillRect(hx - 1, hy + 3, 3, 1);

                if (h.life <= 0) this.floatingHearts.splice(idx, 1);
            });
        }

        // DRAW DIALOGUE PORTRAIT AVATARS
        drawPortrait(avatarType) {
            const pCtx = this.portraitAvatar;
            pCtx.innerHTML = ''; // Clear

            const pc = document.createElement('canvas');
            pc.width = 48;
            pc.height = 48;
            const c = pc.getContext('2d');
            c.imageSmoothingEnabled = false;

            if (avatarType === 'aang' || avatarType === 'aang_blush') {
                // Aang Portrait
                c.fillStyle = '#fde047'; // background
                c.fillRect(0, 0, 48, 48);
                // Head
                c.fillStyle = '#fcd34d';
                c.fillRect(10, 10, 28, 28);
                // Arrow
                c.fillStyle = '#00e5ff';
                c.fillRect(22, 6, 4, 16);
                c.fillRect(19, 16, 10, 4);
                // Eyes
                c.fillStyle = '#1e293b';
                c.fillRect(16, 24, 4, 4);
                c.fillRect(28, 24, 4, 4);
                // Smile
                c.fillStyle = '#92400e';
                c.fillRect(21, 32, 6, 2);
                // Blush
                if (avatarType === 'aang_blush') {
                    c.fillStyle = '#f43f5e';
                    c.fillRect(13, 27, 6, 3);
                    c.fillRect(29, 27, 6, 3);
                }
            } else if (avatarType === 'katara' || avatarType === 'katara_blush') {
                // Katara Portrait
                c.fillStyle = '#0284c7';
                c.fillRect(0, 0, 48, 48);
                // Head
                c.fillStyle = '#c98c60';
                c.fillRect(12, 12, 24, 26);
                // Hair Loopies
                c.fillStyle = '#2b1810';
                c.fillRect(10, 6, 28, 8);
                c.fillRect(8, 12, 5, 20);
                c.fillRect(35, 12, 5, 20);
                // Eyes
                c.fillStyle = '#1e293b';
                c.fillRect(17, 22, 4, 4);
                c.fillRect(27, 22, 4, 4);
                // Choker
                c.fillStyle = '#0369a1';
                c.fillRect(18, 36, 12, 3);
                c.fillStyle = '#38bdf8';
                c.fillRect(22, 37, 4, 3);
                // Blush
                if (avatarType === 'katara_blush') {
                    c.fillStyle = '#f43f5e';
                    c.fillRect(14, 26, 6, 3);
                    c.fillRect(28, 26, 6, 3);
                }
            } else {
                // Fire Nation Soldier Portrait
                c.fillStyle = '#7f1d1d';
                c.fillRect(0, 0, 48, 48);
                c.fillStyle = '#1c1917';
                c.fillRect(12, 10, 24, 28);
                c.fillStyle = '#ef4444';
                c.fillRect(22, 2, 4, 10);
                c.fillStyle = '#fef08a';
                c.fillRect(16, 20, 5, 3);
                c.fillRect(27, 20, 5, 3);
            }

            pCtx.appendChild(pc);
        }

        // ====================================================================
        // MAIN GAME ANIMATION LOOP
        // ====================================================================
        loop(timestamp) {
            this.time += 0.03;

            // Handle enemy hit physics
            if (this.enemy.state === 'hit') {
                this.enemy.x += this.enemy.vx;
                this.enemy.y += this.enemy.vy;
                this.enemy.vy += 0.35; // Gravity
                if (this.enemy.x > VW + 50 || this.enemy.y > VH + 50) {
                    this.enemy.visible = false;
                }
            }

            // Render all layers
            this.render();

            requestAnimationFrame(this.loop);
        }
    }

    // Attach to global window object
    window.game = new KataangGame();

})();
