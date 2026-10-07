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

            // Audio tracks
            this.fightAudio = null;
            this.tavernAudio = null;
            this.initAudioElements();
        }

        initAudioElements() {
            try {
                this.fightAudio = document.getElementById('fight-music');
                if (!this.fightAudio) {
                    this.fightAudio = new Audio('fight%20scene%20song.mp3');
                }
                this.fightAudio.volume = 0.65;
                this.fightAudio.preload = 'auto';

                this.tavernAudio = document.getElementById('tavern-music');
                if (!this.tavernAudio) {
                    this.tavernAudio = new Audio('tavernsong.mp3');
                }
                this.tavernAudio.volume = 0.65;
                this.tavernAudio.preload = 'auto';

                // Seamless looping from designated starting timestamps if scene lingers
                this.fightAudio.addEventListener('ended', () => {
                    if (this.currentTrack === 'battle' && this.enabled) {
                        this.playAudioTrack(this.fightAudio, 115);
                    }
                });

                this.tavernAudio.addEventListener('ended', () => {
                    if ((this.currentTrack === 'night' || this.currentTrack === 'aurora') && this.enabled) {
                        this.playAudioTrack(this.tavernAudio, 67);
                    }
                });
            } catch (e) {
                console.warn('Audio element initialization error:', e);
            }
        }

        playAudioTrack(audio, startTime = null) {
            if (!this.enabled || !audio) return;

            const executePlay = () => {
                if (startTime !== null) {
                    try {
                        audio.currentTime = startTime;
                    } catch (e) {}
                }

                const playPromise = audio.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(() => {
                        // Double check currentTime in case browser reset to 0 before stream buffered
                        if (startTime !== null && Math.abs(audio.currentTime - startTime) > 2) {
                            try { audio.currentTime = startTime; } catch (e) {}
                        }
                    }).catch(err => {
                        console.log('Audio playback waiting for gesture:', err);
                    });
                }
            };

            if (audio.readyState >= 1) { // HAVE_METADATA or higher
                executePlay();
            } else {
                audio.addEventListener('loadedmetadata', () => {
                    executePlay();
                }, { once: true });
                if (typeof audio.load === 'function') {
                    try { audio.load(); } catch (e) {}
                }
            }
        }

        pauseAllMusic() {
            if (this.musicTimer) {
                clearInterval(this.musicTimer);
                this.musicTimer = null;
            }
            if (this.fightAudio) {
                try { this.fightAudio.pause(); } catch (e) {}
            }
            if (this.tavernAudio) {
                try { this.tavernAudio.pause(); } catch (e) {}
            }
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                try {
                    const resumeP = this.ctx.resume();
                    if (resumeP && typeof resumeP.catch === 'function') {
                        resumeP.catch(() => {});
                    }
                } catch (e) {}
            }
            if (!this.fightAudio || !this.tavernAudio) {
                this.initAudioElements();
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
            if (this.currentTrack === trackName) {
                // If already on this track but paused, unpause without seeking
                if (trackName === 'battle' && this.fightAudio && this.fightAudio.paused && this.enabled) {
                    this.playAudioTrack(this.fightAudio, null);
                } else if ((trackName === 'night' || trackName === 'aurora') && this.tavernAudio && this.tavernAudio.paused && this.enabled) {
                    this.playAudioTrack(this.tavernAudio, null);
                }
                return;
            }

            const prevTrack = this.currentTrack;
            this.currentTrack = trackName;

            if (!this.enabled) {
                this.pauseAllMusic();
                return;
            }

            if (trackName === 'battle') {
                this.pauseAllMusic();
                // Fight scene song starting at 1:55 (115 seconds)
                this.playAudioTrack(this.fightAudio, 115);
            } else if (trackName === 'night') {
                this.pauseAllMusic();
                // Tavern song from 1:07 (67 seconds)
                this.playAudioTrack(this.tavernAudio, 67);
            } else if (trackName === 'aurora') {
                // Tavern song continues in aurora page too!
                if (this.tavernAudio && !this.tavernAudio.paused && prevTrack === 'night') {
                    // Already playing from bonfire scene: continue seamlessly without interruption!
                } else if (this.tavernAudio && this.tavernAudio.paused && prevTrack === 'night') {
                    // Was paused during night: unpause without restarting
                    this.playAudioTrack(this.tavernAudio, null);
                } else {
                    // Direct visit to aurora page or switched from battle: start tavern song from 1:07 (67s)
                    this.pauseAllMusic();
                    this.playAudioTrack(this.tavernAudio, 67);
                }
            }
        }

        startAuroraMusic() {
            this.musicStep = 0;
            // Ethereal Polar Celesta & Kalimba Pentatonic Chimes
            const auroraNotes = [
                523.25, 659.25, 783.99, 1046.50,
                880.00, 1046.50, 1318.51, 1174.66,
                783.99, 659.25, 880.00, 1046.50,
                587.33, 783.99, 659.25, 523.25
            ];

            const lowPad = [
                130.81, 0, 164.81, 0, 196.00, 0, 220.00, 0,
                164.81, 0, 130.81, 0, 146.83, 0, 130.81, 0
            ];

            this.musicTimer = setInterval(() => {
                if (!this.enabled || !this.ctx) return;
                const note = auroraNotes[this.musicStep % auroraNotes.length];
                const pad = lowPad[this.musicStep % lowPad.length];

                if (note > 0) {
                    this.playTone(note, 'sine', 0.65, 0.08);
                    if (this.musicStep % 4 === 0) {
                        this.playTone(note * 1.5, 'sine', 0.9, 0.04);
                    }
                }
                if (pad > 0 && this.musicStep % 2 === 0) {
                    this.playTone(pad, 'triangle', 0.9, 0.05);
                }

                if (this.musicStep % 8 === 0) {
                    this.createNoise(0.8, 0.03, 400);
                }

                this.musicStep++;
            }, 360);
        }

        stopMusic() {
            this.pauseAllMusic();
            if (this.fightAudio) {
                try { this.fightAudio.currentTime = 115; } catch (e) {}
            }
            if (this.tavernAudio) {
                try { this.tavernAudio.currentTime = 67; } catch (e) {}
            }
            this.currentTrack = null;
        }

        toggle() {
            // If sound was enabled but audio is currently paused (e.g. browser blocked autoplay),
            // pressing sound toggle should start playback rather than muting!
            if (this.enabled && this.currentTrack && (
                (this.currentTrack === 'battle' && this.fightAudio && this.fightAudio.paused) ||
                ((this.currentTrack === 'night' || this.currentTrack === 'aurora') && this.tavernAudio && this.tavernAudio.paused)
            )) {
                this.init();
                if (this.currentTrack === 'battle') {
                    this.playAudioTrack(this.fightAudio, 115);
                } else {
                    this.playAudioTrack(this.tavernAudio, 67);
                }
                return true;
            }

            this.enabled = !this.enabled;
            if (!this.enabled) {
                this.pauseAllMusic();
            } else if (this.currentTrack) {
                if (this.currentTrack === 'battle') {
                    this.playAudioTrack(this.fightAudio, null);
                } else if (this.currentTrack === 'night' || this.currentTrack === 'aurora') {
                    this.playAudioTrack(this.tavernAudio, null);
                }
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
            this.maxPhases = 3;

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
            this.auroraMessageContainer = document.getElementById('aurora-message-container');
            this.introScreen = document.getElementById('intro-screen');
            this.fadeCurtain = document.getElementById('fade-curtain');
            this.sceneIndicator = document.getElementById('scene-indicator');

            this.northPoleSnowflakes = [];
            this.northPoleStars = [];
            this.northPoleShootingStars = [];
            this.snowGlints = [];
            this.northPoleInitialized = false;

            this.dialogueQueue = [];
            this.currentDialogue = null;
            this.typingTimer = null;
            this.isTyping = false;
            this.currentTextFull = '';

            // EXACTLY 3 EPIC FIGHT SCENES
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

            const isDirectAurora = window.location.pathname.toLowerCase().includes('aurora') ||
                                   window.location.search.toLowerCase().includes('aurora') || 
                                   window.location.hash.toLowerCase().includes('aurora') || 
                                   window.location.hash.toLowerCase().includes('northpole') ||
                                   (document.body && document.body.dataset && document.body.dataset.scene === 'aurora') ||
                                   (document.body && document.body.getAttribute && document.body.getAttribute('data-scene') === 'aurora');

            if (isDirectAurora) {
                this.startNorthPoleAuroraDirectly();
            }

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
            if (soundBtn) {
                soundBtn.addEventListener('click', () => {
                    const on = this.sound.toggle();
                    if (soundIcon) soundIcon.textContent = on ? '🔊' : '🔇';
                    if (soundText) soundText.textContent = on ? 'SOUND: ON' : 'SOUND: OFF';
                });
            }

            // Automatically resume audio on the user's first gesture anywhere on screen
            const handleFirstGesture = () => {
                if (this.sound && this.sound.enabled) {
                    this.sound.init();
                    if (this.state === 'NORTH_POLE_AURORA') {
                        if (this.sound.tavernAudio && this.sound.tavernAudio.paused) {
                            this.sound.playTrack('aurora');
                        }
                    }
                }
            };
            window.addEventListener('click', handleFirstGesture, { once: true });
            window.addEventListener('touchstart', handleFirstGesture, { once: true });
            window.addEventListener('keydown', handleFirstGesture, { once: true });

            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.addEventListener('click', () => this.startAdventure());

            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) restartBtn.addEventListener('click', () => this.restartGame());

            window.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    if (this.dialogueBox && !this.dialogueBox.classList.contains('hidden')) {
                        this.advanceDialogue();
                    } else if (this.aang && (this.aang.state === 'hug' || this.katara.state === 'hug')) {
                        this.transitionToNorthPoleAurora();
                    }
                }
            });

            if (this.dialogueBox) {
                this.dialogueBox.addEventListener('click', () => {
                    this.advanceDialogue();
                });
            }

            if (this.canvas) {
                this.canvas.addEventListener('click', () => {
                    if (this.aang && (this.aang.state === 'hug' || this.katara.state === 'hug')) {
                        this.transitionToNorthPoleAurora();
                    }
                });
            }
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
                    text: 'HALT! It’s the Water Tribe water bender and the Avatar! ATTACK THEM!!'
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
                this.dialogueBox.classList.remove('romantic-glow');
                if (this.dialogueTextEl) this.dialogueTextEl.classList.remove('romantic-text');
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

            if (d.isRomantic || (d.style && d.style.includes('romantic'))) {
                this.dialogueBox.classList.add('romantic-glow');
                if (this.dialogueTextEl) this.dialogueTextEl.classList.add('romantic-text');
            } else {
                this.dialogueBox.classList.remove('romantic-glow');
                if (this.dialogueTextEl) this.dialogueTextEl.classList.remove('romantic-text');
            }

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

            this.sceneIndicator.textContent = `BATTLE: SCENE ${phaseNum} OF 3`;
            this.phaseCounter.textContent = `${phaseNum} / 3`;
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
                this.aang.state = (this.battlePhase === 3) ? 'avatar_state' : 'airblast';
                if (this.battlePhase === 3) {
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

            if (this.battlePhase === 3) {
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
                            speaker: 'AANG 💕 [2-MONTH CONFESSION]',
                            style: 'aang romantic',
                            avatar: 'aang_blush',
                            isRomantic: true,
                            text: 'Hiiii Katara, its 2 month since confession and it was the best decision ever . i love youuuuuuuuuuu and i love every moment we sharee '
                        }
                    ], () => {
                        this.startAangHugKatara();
                    });
                }, 800);

            }, 900);
        }

        startAangHugKatara() {
            // Aang gets up and moves toward Katara to cuddle into a cute, comforting embrace
            this.aang.state = 'moving_to_hug';
            this.katara.state = 'night_sit';
            this.katara.blush = 1;
            this.aang.blush = 1;

            const startX = this.aang.x; // ~185
            const targetX = 265;
            const kataraTargetX = 280;
            this.katara.x = kataraTargetX;

            const duration = 500; // ms (smooth, snappy approach)
            const startTime = performance.now();

            const step = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(1, elapsed / duration);
                const ease = 1 - Math.pow(1 - progress, 3); // smooth easeOutCubic
                this.aang.x = startX + (targetX - startX) * ease;

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    // REACHED KATARA! THE CUTE COMFORT HUG BEGINS!
                    this.aang.x = targetX;
                    this.katara.x = kataraTargetX;
                    this.aang.state = 'hug';
                    this.katara.state = 'hug';

                    this.sound.sfxHeartChime();
                    this.spawnFloatingHearts(274, 180, 26);
                    this.spawnWaterHeart();

                    // Continuous floating hearts during the cozy hug
                    const heartInterval = setInterval(() => {
                        if (this.aang.state === 'hug') {
                            this.spawnFloatingHearts(274 + (Math.random() - 0.5) * 16, 180, 2);
                        } else {
                            clearInterval(heartInterval);
                        }
                    }, 300);

                    // Reduced hug scene duration: sweet 1.6s duration before seamless cross-fade to aurora
                    if (this.hugTimer) clearTimeout(this.hugTimer);
                    this.hugTimer = setTimeout(() => {
                        clearInterval(heartInterval);
                        this.transitionToNorthPoleAurora();
                    }, 1600);
                }
            };

            requestAnimationFrame(step);
        }

        transitionToNorthPoleAurora() {
            if (this.state === 'NORTH_POLE_AURORA' || this.state === 'NORTH_POLE_TRANSITION') {
                return;
            }

            if (this.hugTimer) {
                clearTimeout(this.hugTimer);
                this.hugTimer = null;
            }

            this.state = 'NORTH_POLE_TRANSITION';
            this.transitionStart = performance.now();
            this.transitionDuration = 1000; // ms (smooth and brisk cross-fade)
            this.sound.playTrack('aurora');
            this.initNorthPoleWorld();

            // Strictly NO black screen curtain!
            if (this.fadeCurtain) {
                this.fadeCurtain.classList.remove('active');
                this.fadeCurtain.style.display = 'none';
            }

            if (this.topBar) this.topBar.classList.add('hidden');
            if (this.battleHud) this.battleHud.classList.add('hidden');
            if (this.dialogueBox) this.dialogueBox.classList.add('hidden');
            if (this.nightActions) this.nightActions.classList.add('hidden');
            if (this.introScreen) {
                this.introScreen.classList.remove('active');
                this.introScreen.classList.add('hidden');
            }

            // After seamless cross-dissolve completes:
            setTimeout(() => {
                this.state = 'NORTH_POLE_AURORA';
                if (this.auroraMessageContainer) {
                    this.auroraMessageContainer.classList.remove('hidden');
                }
                document.title = "Get Well Soon Sweetheart ❤️";
            }, 1000);
        }

        startNorthPoleAuroraDirectly() {
            if (this.state === 'NORTH_POLE_AURORA') return;
            this.state = 'NORTH_POLE_AURORA';
            this.sound.init();
            this.sound.playTrack('aurora');
            this.initNorthPoleWorld();

            if (this.topBar) this.topBar.classList.add('hidden');
            if (this.introScreen) {
                this.introScreen.classList.remove('active');
                this.introScreen.classList.add('hidden');
            }
            if (this.battleHud) this.battleHud.classList.add('hidden');
            if (this.dialogueBox) this.dialogueBox.classList.add('hidden');
            if (this.nightActions) this.nightActions.classList.add('hidden');
            if (this.fadeCurtain) {
                this.fadeCurtain.classList.remove('active');
                this.fadeCurtain.style.display = 'none';
            }

            if (this.auroraMessageContainer) {
                this.auroraMessageContainer.classList.remove('hidden');
            }
            document.title = "Get Well Soon Sweetheart ❤️";
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
            if (this.battleHud) this.battleHud.classList.add('hidden');
            if (this.dialogueBox) this.dialogueBox.classList.add('hidden');
            if (this.nightActions) this.nightActions.classList.add('hidden');
            if (this.auroraMessageContainer) this.auroraMessageContainer.classList.add('hidden');
            if (this.topBar) this.topBar.classList.remove('hidden');
            document.title = "Katara & Aang 🌊💨 | Battle & Bonfire";
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

            if (this.state === 'NORTH_POLE_AURORA') {
                this.renderNorthPoleScene(ctx);
            } else if (this.state === 'NORTH_POLE_TRANSITION') {
                // SEAMLESS IN-CANVAS CROSS-FADE (ZERO BLACK SCREEN!)
                const elapsed = performance.now() - (this.transitionStart || performance.now());
                const progress = Math.min(1, Math.max(0, elapsed / (this.transitionDuration || 1000)));

                // 1. Draw the current bonfire scene (with cute comforting hug)
                this.drawSkyAndMountains(ctx);
                this.drawLake(ctx);
                this.drawForestMeadow(ctx);
                if (this.bonfire.active || this.nightProgress > 0.5) {
                    this.drawBonfire(ctx);
                }
                this.drawCozyComfortHug(ctx, 274, 205);
                this.drawVisualEffects(ctx);

                // 2. Render North Pole scene on offscreen canvas and blend with alpha = progress
                if (!this.auroraOffCanvas) {
                    this.auroraOffCanvas = document.createElement('canvas');
                    this.auroraOffCanvas.width = VW;
                    this.auroraOffCanvas.height = VH;
                    this.aoc = this.auroraOffCanvas.getContext('2d');
                    this.aoc.imageSmoothingEnabled = false;
                }
                this.aoc.clearRect(0, 0, VW, VH);
                this.renderNorthPoleScene(this.aoc);

                // Draw aurora scene dissolving in smoothly!
                ctx.save();
                ctx.globalAlpha = progress;
                ctx.drawImage(this.auroraOffCanvas, 0, 0);

                // Soft celestial aurora shimmer veil across the dissolve (dreamy glow, NO black screen!)
                const shimmerAlpha = Math.sin(progress * Math.PI) * 0.28;
                if (shimmerAlpha > 0.01) {
                    const auroraGlow = ctx.createLinearGradient(0, 0, 0, VH);
                    auroraGlow.addColorStop(0, `rgba(52, 211, 153, ${shimmerAlpha})`);
                    auroraGlow.addColorStop(0.5, `rgba(56, 189, 248, ${shimmerAlpha * 0.7})`);
                    auroraGlow.addColorStop(1, `rgba(167, 139, 250, ${shimmerAlpha * 0.5})`);
                    ctx.fillStyle = auroraGlow;
                    ctx.fillRect(0, 0, VW, VH);
                }
                ctx.restore();

            } else {
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
                if (this.aang.state === 'hug' || this.katara.state === 'hug') {
                    this.drawCozyComfortHug(ctx, 274, 205);
                } else {
                    this.drawAang(ctx);
                    this.drawKatara(ctx);
                }

                if (this.state === 'BATTLE' && this.enemy.visible) {
                    this.drawEnemy(ctx);
                }

                // 6. Dynamic Water/Air/Fire FX
                this.drawVisualEffects(ctx);

                // 7. Cinematic Vignette (Subtle edge darkening for movie quality)
                const vig = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.45, VW / 2, VH / 2, VW * 0.74);
                vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
                vig.addColorStop(0.65, 'rgba(0, 0, 0, 0.12)');
                vig.addColorStop(1, 'rgba(0, 0, 0, 0.58)');
                ctx.fillStyle = vig;
                ctx.fillRect(0, 0, VW, VH);
            }

            // Scale to screen
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(
                this.offCanvas,
                0, 0, VW, VH,
                this.offsetX, this.offsetY, VW * this.scale, VH * this.scale
            );
        }

        // SKY, MOUNTAINS, CASCADING WATERFALL & SPIRIT MOON
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

            // Cinematic Volumetric Sunbeams / God-Rays (Day Mode)
            if (t < 0.75) {
                ctx.save();
                const rayAlpha = (1 - t) * 0.11;
                ctx.fillStyle = `rgba(254, 240, 138, ${rayAlpha})`;
                // Beam 1
                ctx.beginPath();
                ctx.moveTo(70, 42);
                ctx.lineTo(-20, 250);
                ctx.lineTo(60, 270);
                ctx.closePath();
                ctx.fill();
                // Beam 2
                ctx.beginPath();
                ctx.moveTo(70, 42);
                ctx.lineTo(130, 270);
                ctx.lineTo(230, 270);
                ctx.closePath();
                ctx.fill();
                // Beam 3
                ctx.beginPath();
                ctx.moveTo(70, 42);
                ctx.lineTo(280, 270);
                ctx.lineTo(390, 270);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // Night Stars & Nebula Dust
            if (t > 0.2) {
                // Nebula cloud wash
                ctx.fillStyle = `rgba(168, 85, 247, ${0.14 * t})`;
                ctx.beginPath();
                ctx.arc(200, 50, 95, 0, Math.PI * 2);
                ctx.fill();

                this.stars.forEach(st => {
                    const alpha = st.baseAlpha * Math.sin(this.time * st.twinkleSpeed + st.phase) * t;
                    if (alpha > 0.05) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, Math.max(0, alpha))})`;
                        ctx.fillRect(Math.floor(st.x), Math.floor(st.y), st.size, st.size);
                        if (st.size === 2) {
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
                const moonGlow = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 44);
                moonGlow.addColorStop(0, `rgba(254, 240, 138, ${0.38 * moonAlpha})`);
                moonGlow.addColorStop(0.5, `rgba(224, 242, 254, ${0.16 * moonAlpha})`);
                moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = moonGlow;
                ctx.beginPath();
                ctx.arc(moonX, moonY, 44, 0, Math.PI * 2);
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
                const sunGlow = ctx.createRadialGradient(70, 42, 10, 70, 42, 55);
                sunGlow.addColorStop(0, `rgba(253, 224, 71, ${0.85 * sunA})`);
                sunGlow.addColorStop(0.5, `rgba(254, 240, 138, ${0.35 * sunA})`);
                sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = sunGlow;
                ctx.beginPath();
                ctx.arc(70, 42, 55, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(254, 240, 138, ${sunA})`;
                ctx.beginPath();
                ctx.arc(70, 42, 15, 0, Math.PI * 2);
                ctx.fill();

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

            // Cascading Cliff Waterfall into Lake
            const wfX = 395;
            const wfY1 = 105;
            const wfY2 = 162;
            ctx.fillStyle = this.lerpColor('#38bdf8', '#1e3a8a', t);
            ctx.fillRect(wfX - 1, wfY1, 6, wfY2 - wfY1);
            // Foaming water ribbons
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            for (let y = wfY1; y < wfY2; y += 4) {
                const wave = Math.sin(this.time * 18 + y) * 1.5;
                ctx.fillRect(wfX + wave, y, 4, 3);
            }
            // Rising spray mist at lake base
            ctx.fillStyle = t > 0.5 ? 'rgba(56, 189, 248, 0.28)' : 'rgba(255, 255, 255, 0.55)';
            const sprayW = 18 + Math.sin(this.time * 8) * 4;
            ctx.fillRect(wfX - sprayW / 2 + 2, wfY2 - 3, sprayW, 5);

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

            ctx.fillStyle = `rgba(203, 213, 225, ${alpha * 0.8})`;
            ctx.fillRect(bx + 6, by + h - 8, w - 12, 8);

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

            // Cinematic Drifting Lake Fog / Mist Layer
            ctx.fillStyle = t > 0.5 ? 'rgba(168, 85, 247, 0.12)' : 'rgba(224, 242, 254, 0.22)';
            for (let m = 0; m < 3; m++) {
                const mx = ((this.time * 14 + m * 85) % (lakeW + 70)) + lakeX - 35;
                const my = lakeY + 20 + m * 22;
                ctx.fillRect(Math.floor(mx), Math.floor(my), 60, 4);
                ctx.fillRect(Math.floor(mx + 8), Math.floor(my - 2), 44, 2);
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
        // CUTE & COMFORTING EMBRACE SPRITE (KATARA & AANG COZY BONFIRE CUDDLE)
        // ====================================================================
        drawCozyComfortHug(ctx, x, y) {
            const breath = Math.sin(this.time * 2.8) * 1.2;
            const sy = Math.floor(y + 4 + breath);
            const cx = Math.floor(x);

            // 1. Warm Hearth & Heart Ambient Aura
            const hugGlow = ctx.createRadialGradient(cx, sy - 8, 4, cx, sy - 8, 42);
            hugGlow.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
            hugGlow.addColorStop(0.5, 'rgba(244, 63, 94, 0.20)');
            hugGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = hugGlow;
            ctx.beginPath();
            ctx.arc(cx, sy - 8, 42, 0, Math.PI * 2);
            ctx.fill();

            // 2. Cozy Water Tribe Fleece Blanket on the Grass
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(cx - 24, sy + 10, 48, 5);
            ctx.fillStyle = '#f8fafc'; // White fur trim fringe
            ctx.fillRect(cx - 25, sy + 12, 50, 2);

            // 3. Katara Seated on Right (Holding Aang tenderly)
            // Katara's folded dark pants & boots
            ctx.fillStyle = '#0c2b47';
            ctx.fillRect(cx - 2, sy + 6, 20, 8);
            ctx.fillStyle = '#4a3020'; // Boots
            ctx.fillRect(cx + 10, sy + 9, 8, 4);

            // Katara's Southern Coat Torso
            ctx.fillStyle = '#1d6fa5';
            ctx.fillRect(cx - 1, sy - 12, 20, 18);
            ctx.fillStyle = '#114b73';
            ctx.fillRect(cx + 8, sy - 6, 11, 12);
            ctx.fillStyle = '#f8fafc'; // Fur coat hem
            ctx.fillRect(cx - 2, sy + 3, 21, 3);
            ctx.fillStyle = '#f8fafc'; // Fur collar
            ctx.fillRect(cx + 1, sy - 15, 17, 4);

            // 4. Aang Nestled Snugly on Left (Resting comfortably against Katara)
            // Aang's yellow monk trousers
            ctx.fillStyle = '#d49b13';
            ctx.fillRect(cx - 18, sy + 6, 18, 8);
            ctx.fillStyle = '#52361b'; // Boots
            ctx.fillRect(cx - 19, sy + 9, 6, 4);

            // Aang's Yellow Tunic & Orange Nomad Shawl
            ctx.fillStyle = '#fad02c';
            ctx.fillRect(cx - 16, sy - 12, 17, 18);
            ctx.fillStyle = '#f9690e';
            ctx.fillRect(cx - 16, sy - 12, 11, 18);
            ctx.fillStyle = '#c2410c';
            ctx.fillRect(cx - 16, sy - 4, 11, 10);
            ctx.fillStyle = '#452712'; // Belt
            ctx.fillRect(cx - 15, sy + 2, 16, 2);

            // 5. The Comforting Arms Wrapping Around Each Other
            // Katara's comforting left arm around Aang's back
            ctx.fillStyle = '#1d6fa5';
            ctx.fillRect(cx - 10, sy - 1, 14, 5);
            ctx.fillStyle = '#f8fafc'; // Fur cuff
            ctx.fillRect(cx - 13, sy - 2, 4, 7);
            ctx.fillStyle = '#bd8257'; // Katara's warm hand holding Aang close
            ctx.fillRect(cx - 17, sy - 1, 5, 4);

            // Katara's right arm wrapped over Aang's shoulder
            ctx.fillStyle = '#1d6fa5';
            ctx.fillRect(cx - 5, sy - 10, 12, 5);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(cx - 8, sy - 11, 4, 7);
            ctx.fillStyle = '#bd8257'; // Hand gently resting on Aang's upper back
            ctx.fillRect(cx - 12, sy - 9, 5, 4);

            // Aang's arms wrapped comfortably around Katara's waist
            ctx.fillStyle = '#f9690e';
            ctx.fillRect(cx - 5, sy - 4, 14, 4);
            ctx.fillStyle = '#f5c798'; // Aang's hand resting on Katara
            ctx.fillRect(cx + 8, sy - 3, 5, 4);
            ctx.fillStyle = '#00d8f6'; // Cyan arrow tattoo on back of hand
            ctx.fillRect(cx + 10, sy - 2, 2, 2);

            // 6. Heads Nestled Together in Pure Comfort & Warmth
            // Katara's Head (Right, tilted tenderly toward Aang)
            ctx.fillStyle = '#bd8257';
            ctx.fillRect(cx + 2, sy - 28, 14, 14);
            ctx.fillStyle = '#d89c70';
            ctx.fillRect(cx + 4, sy - 26, 10, 10);

            // Katara's Ponytail
            ctx.fillStyle = '#1f130b';
            ctx.fillRect(cx + 3, sy - 32, 15, 6);
            ctx.fillRect(cx + 14, sy - 28, 6, 18);
            ctx.fillStyle = '#382315';
            ctx.fillRect(cx + 4, sy - 31, 12, 3);

            // Iconic Katara Hair Loopies
            ctx.fillStyle = '#1f130b';
            ctx.fillRect(cx + 1, sy - 22, 3, 11);
            ctx.fillRect(cx + 2, sy - 11, 3, 3);
            ctx.fillRect(cx + 13, sy - 22, 3, 11);
            ctx.fillRect(cx + 12, sy - 11, 3, 3);
            ctx.fillStyle = '#38bdf8'; // Cyan loop beads
            ctx.fillRect(cx + 2, sy - 10, 3, 2);
            ctx.fillRect(cx + 12, sy - 10, 3, 2);

            // Katara's Betrothal Necklace
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(cx + 5, sy - 14, 8, 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(cx + 8, sy - 13, 3, 3);

            // Katara's Closed Peaceful Anime Eyes (^ _ ^)
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(cx + 5, sy - 21, 3, 1);
            ctx.fillRect(cx + 6, sy - 22, 2, 1);
            ctx.fillRect(cx + 10, sy - 21, 3, 1);
            ctx.fillRect(cx + 11, sy - 22, 2, 1);

            // Katara's Rosy Blushing Cheeks
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(cx + 4, sy - 18, 4, 2);
            ctx.fillRect(cx + 11, sy - 18, 4, 2);

            // Katara's Sweet Loving Smile
            ctx.fillStyle = '#7c2d12';
            ctx.fillRect(cx + 7, sy - 15, 4, 1);

            // Aang's Head (Left, nestled snugly into Katara's neck/shoulder)
            ctx.fillStyle = '#f5c798';
            ctx.fillRect(cx - 12, sy - 27, 14, 14);
            ctx.fillStyle = '#ffdfbe';
            ctx.fillRect(cx - 10, sy - 25, 10, 10);

            // Aang's Iconic Blue Arrow Tattoo
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(cx - 7, sy - 31, 4, 8);
            ctx.fillRect(cx - 8, sy - 25, 6, 3);
            ctx.fillStyle = '#00d8f6';
            ctx.fillRect(cx - 6, sy - 31, 2, 7);
            ctx.fillRect(cx - 7, sy - 24, 4, 2);

            // Aang's Closed Blissful Comfort Eyes
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(cx - 9, sy - 20, 3, 1);
            ctx.fillRect(cx - 8, sy - 21, 2, 1);
            ctx.fillRect(cx - 4, sy - 20, 3, 1);
            ctx.fillRect(cx - 3, sy - 21, 2, 1);

            // Aang's Glowing Rosy Blushing Cheeks
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(cx - 10, sy - 17, 4, 2);
            ctx.fillRect(cx - 3, sy - 17, 4, 2);

            // Aang's Peaceful Comforted Smile
            ctx.fillStyle = '#9a3412';
            ctx.fillRect(cx - 6, sy - 14, 4, 2);

            // 7. Aang's Glider Staff Resting beside them
            ctx.fillStyle = '#824513';
            ctx.fillRect(cx - 24, sy - 10, 3, 26);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(cx - 25, sy - 13, 5, 4);
        }

        // ====================================================================
        // SERIES-ACCURATE KATARA SPRITE (16-BIT DETAILED ANIME PIXEL ART)
        // ====================================================================
        drawKatara(ctx) {
            const k = this.katara;
            if (k.state === 'hug') {
                return; // Rendered by drawCozyComfortHug
            }

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

            if (a.state === 'hug') {
                this.drawCozyComfortHug(ctx, 274, 205);
                return;
            } else if (a.state === 'night_sit' || a.state === 'moving_to_hug') {
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
        // NORTH POLE WITH AURORA BOREALIS & CAMPER VAN PIXEL ART ENGINE
        // ====================================================================
        initNorthPoleWorld() {
            if (this.northPoleInitialized) return;
            this.northPoleInitialized = true;

            // 180 Polar Stars with individual twinkling properties
            this.northPoleStars = [];
            for (let i = 0; i < 180; i++) {
                this.northPoleStars.push({
                    x: Math.random() * VW,
                    y: Math.random() * 165,
                    size: Math.random() > 0.88 ? 2 : 1,
                    baseAlpha: 0.35 + Math.random() * 0.65,
                    twinkleSpeed: 1.5 + Math.random() * 3.5,
                    phase: Math.random() * Math.PI * 2,
                    color: Math.random() > 0.75 ? '#67e8f9' : (Math.random() > 0.5 ? '#bae6fd' : (Math.random() > 0.25 ? '#fef08a' : '#ffffff'))
                });
            }

            // 70 Drifting Snowflakes
            this.northPoleSnowflakes = [];
            for (let i = 0; i < 70; i++) {
                this.northPoleSnowflakes.push({
                    x: Math.random() * VW,
                    y: Math.random() * VH,
                    size: Math.random() > 0.75 ? 2 : 1,
                    speedY: 0.35 + Math.random() * 0.7,
                    swayAmp: 0.6 + Math.random() * 1.4,
                    swayFreq: 0.02 + Math.random() * 0.03,
                    swayPhase: Math.random() * Math.PI * 2,
                    alpha: 0.4 + Math.random() * 0.6
                });
            }

            // Shooting stars queue
            this.northPoleShootingStars = [];

            // Diamond snow glints
            this.snowGlints = [];
            for (let i = 0; i < 28; i++) {
                this.snowGlints.push({
                    x: 10 + Math.random() * (VW - 20),
                    y: 195 + Math.random() * 70,
                    seed: Math.random() * 10
                });
            }
        }

        renderNorthPoleScene(ctx) {
            const t = this.time;
            const vanX = 160;
            const vanY = 150;

            if (!this.northPoleInitialized) {
                this.initNorthPoleWorld();
            }

            // 1. Polar Night Sky & Twinkling Starfield
            this.drawNorthPoleSkyAndStars(ctx, t);

            // 2. Multi-layered Dynamic Aurora Borealis
            this.drawNorthPoleAurora(ctx, t);

            // 3. Distant Arctic Glaciers & Snowy Peaks
            this.drawNorthPoleGlaciers(ctx);

            // 4. Snowy Tundra, Dunes & Tire Tracks
            this.drawNorthPoleSnowTundra(ctx, t);

            // 5. The Retro Camper Van
            this.drawCamperVan(ctx, vanX, vanY, t);

            // 6. She and Her on the Roof of the Van looking at the Aurora
            this.drawFiguresOnRoof(ctx, vanX, vanY, t);

            // 7. Drifting Snowflakes
            this.drawNorthPoleSnowflakes(ctx, t);

            // 8. Film-Quality Pixel Vignette
            this.drawNorthPoleVignette(ctx);
        }

        drawNorthPoleSkyAndStars(ctx, t) {
            // High arctic midnight gradient
            const skyGrad = ctx.createLinearGradient(0, 0, 0, 195);
            skyGrad.addColorStop(0.0, '#02030a');
            skyGrad.addColorStop(0.35, '#040b1e');
            skyGrad.addColorStop(0.70, '#081734');
            skyGrad.addColorStop(1.0, '#0c2847');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, VW, VH);

            // Twinkling stars
            for (let i = 0; i < this.northPoleStars.length; i++) {
                const s = this.northPoleStars[i];
                const shimmer = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase);
                const a = Math.max(0.1, s.baseAlpha * shimmer);

                ctx.fillStyle = s.color;
                ctx.globalAlpha = a;

                if (s.size === 2 && shimmer > 0.7) {
                    ctx.fillRect(s.x, s.y, 2, 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(s.x - 1, s.y, 4, 1);
                    ctx.fillRect(s.x, s.y - 1, 1, 4);
                } else {
                    ctx.fillRect(s.x, s.y, s.size, s.size);
                }
            }
            ctx.globalAlpha = 1.0;

            // Occasional Shooting Star
            if (this.northPoleShootingStars.length > 0) {
                for (let i = this.northPoleShootingStars.length - 1; i >= 0; i--) {
                    const ss = this.northPoleShootingStars[i];
                    ctx.save();
                    ctx.strokeStyle = '#bae6fd';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(ss.x, ss.y);
                    ctx.lineTo(ss.x - ss.vx * (ss.life / 10), ss.y - ss.vy * (ss.life / 10));
                    ctx.stroke();

                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(ss.x - 1, ss.y - 1, 3, 3);
                    ctx.restore();

                    ss.x += ss.vx;
                    ss.y += ss.vy;
                    ss.life--;
                    if (ss.life <= 0) this.northPoleShootingStars.splice(i, 1);
                }
            } else if (Math.random() < 0.008) {
                this.northPoleShootingStars.push({
                    x: 60 + Math.random() * 280,
                    y: 12 + Math.random() * 40,
                    vx: 5.2 + Math.random() * 2,
                    vy: 2.2 + Math.random() * 1.5,
                    life: 24
                });
            }
        }

        drawNorthPoleAurora(ctx, t) {
            ctx.save();

            // 1. Violet & Magenta Atmospheric Crown (Highest layer)
            for (let x = 0; x < VW; x += 3) {
                const waveY = 46 + Math.sin(x * 0.013 + t * 0.45) * 16 + Math.cos(x * 0.026 - t * 0.35) * 8;
                const rayH = 34 + Math.sin(x * 0.08 + t * 0.6) * 14;
                const alpha = 0.22 + 0.18 * Math.sin(x * 0.05 + t * 0.4);

                const gradV = ctx.createLinearGradient(0, waveY, 0, waveY - rayH);
                gradV.addColorStop(0, `rgba(168, 85, 247, ${alpha * 0.9})`);
                gradV.addColorStop(0.5, `rgba(192, 132, 252, ${alpha * 0.7})`);
                gradV.addColorStop(1, `rgba(244, 114, 182, 0)`);
                ctx.fillStyle = gradV;
                ctx.fillRect(x, waveY - rayH, 3, rayH);
            }

            // 2. Main Brilliant Emerald & Mint Dancing Curtain
            for (let x = 0; x < VW; x += 2) {
                const waveY = 78 + Math.sin(x * 0.017 + t * 0.72) * 22 + Math.cos(x * 0.033 - t * 0.48) * 15 + Math.sin(x * 0.006 + t * 0.2) * 16;
                const flute = 0.42 + 0.58 * Math.sin(x * 0.11 + Math.sin(t * 0.65 + x * 0.018) * 2.2);
                const rayH = 50 + flute * 32 + Math.sin(x * 0.03 - t * 0.5) * 12;

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

            // 3. Lower Electric Arctic Cyan & Turquoise Ribbon
            for (let x = 0; x < VW; x += 3) {
                const waveY = 104 + Math.sin(x * 0.024 + t * 0.92) * 16 + Math.sin(x * 0.011 - t * 0.32) * 12;
                const flute = 0.35 + 0.65 * Math.sin(x * 0.14 - t * 0.8);
                const rayH = 26 + flute * 18;

                const gradC = ctx.createLinearGradient(0, waveY, 0, waveY - rayH);
                gradC.addColorStop(0, `rgba(2, 132, 199, ${flute * 0.85})`);
                gradC.addColorStop(0.4, `rgba(6, 182, 212, ${flute * 0.80})`);
                gradC.addColorStop(0.75, `rgba(34, 211, 238, ${flute * 0.65})`);
                gradC.addColorStop(1, `rgba(186, 230, 253, 0)`);

                ctx.fillStyle = gradC;
                ctx.fillRect(x, waveY - rayH, 3, rayH);
            }

            // Soft atmospheric ambient green wash
            const ambGrad = ctx.createLinearGradient(0, 40, 0, 180);
            ambGrad.addColorStop(0, 'rgba(52, 211, 153, 0.06)');
            ambGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.09)');
            ambGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
            ctx.fillStyle = ambGrad;
            ctx.fillRect(0, 40, VW, 140);

            ctx.restore();
        }

        drawNorthPoleGlaciers(ctx) {
            // Far Mountain silhouette (deep slate)
            ctx.fillStyle = '#061325';
            ctx.beginPath();
            ctx.moveTo(0, 180);
            const peaks = [
                {x: 0, y: 172}, {x: 45, y: 154}, {x: 85, y: 168}, {x: 130, y: 148},
                {x: 180, y: 162}, {x: 235, y: 144}, {x: 290, y: 164}, {x: 345, y: 146},
                {x: 400, y: 160}, {x: 445, y: 152}, {x: 480, y: 170}, {x: 480, y: 185}, {x: 0, y: 185}
            ];
            for (let i = 0; i < peaks.length; i++) {
                ctx.lineTo(peaks[i].x, peaks[i].y);
            }
            ctx.closePath();
            ctx.fill();

            // Glacial ice & snow crests lit by aurora
            ctx.fillStyle = '#0e3a58';
            ctx.beginPath();
            ctx.moveTo(35, 160);
            ctx.lineTo(45, 154);
            ctx.lineTo(55, 165);
            ctx.lineTo(45, 168);
            ctx.fill();

            ctx.fillStyle = '#155e75';
            ctx.beginPath();
            ctx.moveTo(120, 155);
            ctx.lineTo(130, 148);
            ctx.lineTo(142, 158);
            ctx.lineTo(130, 164);
            ctx.fill();

            ctx.fillStyle = '#164e63';
            ctx.beginPath();
            ctx.moveTo(225, 152);
            ctx.lineTo(235, 144);
            ctx.lineTo(248, 156);
            ctx.lineTo(235, 162);
            ctx.fill();

            ctx.fillStyle = '#155e75';
            ctx.beginPath();
            ctx.moveTo(335, 154);
            ctx.lineTo(345, 146);
            ctx.lineTo(358, 158);
            ctx.lineTo(345, 164);
            ctx.fill();

            // Aurora green/cyan rim highlight on mountain crests
            ctx.fillStyle = '#34d399';
            ctx.fillRect(44, 154, 3, 2);
            ctx.fillRect(129, 148, 3, 2);
            ctx.fillRect(234, 144, 3, 2);
            ctx.fillRect(344, 146, 3, 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(43, 155, 5, 1);
            ctx.fillRect(128, 149, 5, 1);
            ctx.fillRect(233, 145, 5, 1);
            ctx.fillRect(343, 147, 5, 1);

            // Floating icebergs in polar fjord (y: 172 - 188)
            // Left Iceberg
            ctx.fillStyle = '#0c233c';
            ctx.fillRect(28, 172, 54, 14);
            ctx.fillStyle = '#164e63';
            ctx.beginPath();
            ctx.moveTo(28, 178);
            ctx.lineTo(46, 168);
            ctx.lineTo(72, 174);
            ctx.lineTo(82, 186);
            ctx.lineTo(28, 186);
            ctx.fill();
            // Snow top on iceberg
            ctx.fillStyle = '#bae6fd';
            ctx.fillRect(44, 168, 6, 2);
            ctx.fillRect(40, 170, 14, 2);
            ctx.fillRect(66, 173, 8, 2);

            // Right Iceberg
            ctx.fillStyle = '#0c233c';
            ctx.fillRect(395, 170, 65, 16);
            ctx.fillStyle = '#164e63';
            ctx.beginPath();
            ctx.moveTo(395, 186);
            ctx.lineTo(412, 168);
            ctx.lineTo(440, 166);
            ctx.lineTo(460, 186);
            ctx.fill();
            ctx.fillStyle = '#bae6fd';
            ctx.fillRect(410, 168, 8, 2);
            ctx.fillRect(436, 166, 7, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(412, 167, 4, 1);
        }

        drawNorthPoleSnowTundra(ctx, t) {
            // Back Snow Dune (y: 182 to 208)
            ctx.fillStyle = '#0a1c38';
            ctx.beginPath();
            ctx.moveTo(0, 192);
            ctx.bezierCurveTo(120, 182, 280, 204, VW, 188);
            ctx.lineTo(VW, 270);
            ctx.lineTo(0, 270);
            ctx.closePath();
            ctx.fill();

            // Dune rim highlight (lit by aurora)
            ctx.strokeStyle = '#1e3a5f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 192);
            ctx.bezierCurveTo(120, 182, 280, 204, VW, 188);
            ctx.stroke();

            // Mid Snow Dune (y: 200 to 232)
            ctx.fillStyle = '#0e284a';
            ctx.beginPath();
            ctx.moveTo(0, 222);
            ctx.bezierCurveTo(140, 198, 320, 218, VW, 210);
            ctx.lineTo(VW, 270);
            ctx.lineTo(0, 270);
            ctx.closePath();
            ctx.fill();

            // Mid dune crest highlight
            ctx.strokeStyle = '#22557e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 222);
            ctx.bezierCurveTo(140, 198, 320, 218, VW, 210);
            ctx.stroke();

            // Foreground Main Snowpack Shelf (y: 216 to 270)
            ctx.fillStyle = '#163b66';
            ctx.beginPath();
            ctx.moveTo(0, 234);
            ctx.bezierCurveTo(160, 218, 310, 238, VW, 228);
            ctx.lineTo(VW, 270);
            ctx.lineTo(0, 270);
            ctx.closePath();
            ctx.fill();

            // Bright icy crust edge (cyan moonlight & emerald aurora sheen)
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, 234);
            ctx.bezierCurveTo(160, 222, 310, 238, VW, 228);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 233);
            ctx.bezierCurveTo(160, 221, 310, 237, VW, 227);
            ctx.stroke();

            // Tire tracks in the snow leading up to the van
            ctx.fillStyle = '#0a1626';
            ctx.fillRect(0, 238, 175, 4);
            ctx.fillRect(0, 246, 175, 5);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 237, 175, 1);
            ctx.fillRect(0, 245, 175, 1);

            // Diamond snow glints (twinkling in polar snowpack)
            for (let i = 0; i < this.snowGlints.length; i++) {
                const g = this.snowGlints[i];
                const shimmer = Math.sin(t * 3.5 + g.seed);
                if (shimmer > 0.72) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(g.x, g.y, 1, 1);
                    if (shimmer > 0.9) {
                        ctx.fillStyle = '#7dd3fc';
                        ctx.fillRect(g.x - 1, g.y, 3, 1);
                        ctx.fillRect(g.x, g.y - 1, 1, 3);
                    }
                }
            }
        }

        drawNorthPoleSnowflakes(ctx, t) {
            for (let i = 0; i < this.northPoleSnowflakes.length; i++) {
                const f = this.northPoleSnowflakes[i];
                f.y += f.speedY;
                f.x += Math.sin(t * 1.8 + f.swayPhase) * f.swayAmp * 0.4;

                if (f.y > VH) {
                    f.y = -4;
                    f.x = Math.random() * VW;
                }
                if (f.x > VW) f.x = 0;
                if (f.x < 0) f.x = VW;

                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = f.alpha;
                ctx.fillRect(Math.round(f.x), Math.round(f.y), f.size, f.size);
            }
            ctx.globalAlpha = 1.0;
        }

        drawCamperVan(ctx, vanX, vanY, t) {
            // Drop shadow under van on snow
            ctx.fillStyle = '#060f1e';
            ctx.beginPath();
            ctx.ellipse(vanX + 82, vanY + 74, 80, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            // Headlight Volumetric Beam extending forward across snow
            const beamGrad = ctx.createLinearGradient(vanX + 158, vanY + 48, vanX + 270, vanY + 70);
            beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
            beamGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.16)');
            beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(vanX + 158, vanY + 46);
            ctx.lineTo(vanX + 275, vanY + 42);
            ctx.lineTo(vanX + 290, vanY + 78);
            ctx.lineTo(vanX + 158, vanY + 54);
            ctx.closePath();
            ctx.fill();

            // Snow Tires & Wheels
            const wheels = [vanX + 34, vanX + 130];
            wheels.forEach(wx => {
                // Wheel arch cutout
                ctx.fillStyle = '#060f1e';
                ctx.beginPath();
                ctx.arc(wx, vanY + 68, 14, Math.PI, 0, false);
                ctx.fill();

                // Tire rubber
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(wx, vanY + 68, 12, 0, Math.PI * 2);
                ctx.fill();

                // Retro chrome wheel rim & white wall
                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.arc(wx, vanY + 68, 8, 0, Math.PI * 2);
                ctx.fill();

                // Hubcap center
                ctx.fillStyle = '#94a3b8';
                ctx.beginPath();
                ctx.arc(wx, vanY + 68, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#0f766e';
                ctx.fillRect(wx - 2, vanY + 66, 4, 4);

                // Natural soft snowdrift nestled around tire base
                ctx.fillStyle = '#0e2a4f';
                ctx.beginPath();
                ctx.ellipse(wx, vanY + 75, 14, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#163b66';
                ctx.beginPath();
                ctx.ellipse(wx, vanY + 73, 12, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#bae6fd';
                ctx.beginPath();
                ctx.ellipse(wx, vanY + 71, 9, 2, 0, 0, Math.PI * 2);
                ctx.fill();
            });

            // Lower Body (Deep Polar Teal)
            ctx.fillStyle = '#0f766e';
            ctx.fillRect(vanX + 6, vanY + 36, 150, 32);

            // Front nose curve
            ctx.beginPath();
            ctx.moveTo(vanX + 156, vanY + 36);
            ctx.quadraticCurveTo(vanX + 162, vanY + 50, vanX + 158, vanY + 68);
            ctx.lineTo(vanX + 156, vanY + 68);
            ctx.fill();

            // Rear curve
            ctx.beginPath();
            ctx.moveTo(vanX + 6, vanY + 36);
            ctx.quadraticCurveTo(vanX + 2, vanY + 50, vanX + 4, vanY + 68);
            ctx.lineTo(vanX + 6, vanY + 68);
            ctx.fill();

            // Shading & highlight
            ctx.fillStyle = '#115e59';
            ctx.fillRect(vanX + 4, vanY + 64, 154, 4);
            ctx.fillStyle = '#14b8a6';
            ctx.fillRect(vanX + 6, vanY + 38, 150, 2);

            // Chrome waistline molding
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(vanX + 4, vanY + 35, 156, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(vanX + 5, vanY + 35, 154, 1);

            // Front Chrome Bumper (Right) with snow on top
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(vanX + 156, vanY + 60, 6, 7);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(vanX + 155, vanY + 58, 8, 2);

            // Rear Chrome Bumper (Left) with snow
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(vanX - 1, vanY + 60, 6, 7);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(vanX - 2, vanY + 58, 8, 2);

            // Headlights & Tail Lights
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(vanX + 159, vanY + 49, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(vanX + 159, vanY + 49, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(vanX + 158, vanY + 56, 3, 3);

            // Rear Taillight
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(vanX + 2, vanY + 48, 3, 7);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(vanX + 2, vanY + 55, 3, 3);

            // Upper Body & Cabin (Warm Ivory / Cream)
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(vanX + 8, vanY + 8, 146, 28);
            ctx.beginPath();
            ctx.moveTo(vanX + 154, vanY + 36);
            ctx.lineTo(vanX + 148, vanY + 8);
            ctx.lineTo(vanX + 142, vanY + 8);
            ctx.lineTo(vanX + 142, vanY + 36);
            ctx.fill();

            // Windows & Cozy Warm Hearth Light Inside
            // Front Windshield
            ctx.fillStyle = '#78350f';
            ctx.fillRect(vanX + 130, vanY + 11, 20, 23);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(vanX + 132, vanY + 13, 16, 19);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(vanX + 134, vanY + 15, 12, 15);

            // Side Windows with glowing honey amber
            // Window 1 (Passenger/Living)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(vanX + 76, vanY + 11, 48, 23);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(vanX + 78, vanY + 13, 44, 19);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(vanX + 80, vanY + 15, 40, 15);

            // Window 2 (Rear Sleeper)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(vanX + 22, vanY + 11, 48, 23);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(vanX + 24, vanY + 13, 44, 19);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(vanX + 26, vanY + 15, 40, 15);

            // Cozy Curtains tied back inside the windows
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(vanX + 78, vanY + 13, 6, 19);
            ctx.fillRect(vanX + 116, vanY + 13, 6, 19);
            ctx.fillRect(vanX + 24, vanY + 13, 6, 19);
            ctx.fillRect(vanX + 62, vanY + 13, 6, 19);

            // Window frame divider bars
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(vanX + 70, vanY + 10, 6, 25);
            ctx.fillRect(vanX + 124, vanY + 10, 6, 25);

            // Door handle
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(vanX + 126, vanY + 42, 6, 2);

            // Expedition Side Ladder
            const ladderX = vanX + 14;
            ctx.fillStyle = '#475569';
            ctx.fillRect(ladderX, vanY + 10, 2, 54);
            ctx.fillRect(ladderX + 8, vanY + 10, 2, 54);
            for (let ly = vanY + 14; ly < vanY + 62; ly += 9) {
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(ladderX, ly, 10, 2);
            }

            // Heavy-Duty Safari Roof Rack & Platform
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(vanX + 8, vanY + 5, 146, 3);
            ctx.fillRect(vanX + 8, vanY + 2, 146, 2);
            for (let rx = vanX + 12; rx < vanX + 150; rx += 22) {
                ctx.fillStyle = '#475569';
                ctx.fillRect(rx, vanY + 2, 2, 6);
            }
            // Wooden deck slats on roof
            ctx.fillStyle = '#92400e';
            ctx.fillRect(vanX + 12, vanY + 5, 138, 3);
            ctx.fillStyle = '#78350f';
            for (let dx = vanX + 14; dx < vanX + 148; dx += 6) {
                ctx.fillRect(dx, vanY + 5, 1, 3);
            }

            // Fairy String Lights draped along roof rack
            const fairyColors = ['#f472b6', '#facc15', '#4ade80', '#38bdf8', '#f43f5e', '#a855f7'];
            for (let i = 0; i < 11; i++) {
                const fx = vanX + 22 + i * 11;
                const fy = vanY + 7 + Math.sin(i * 0.9) * 2;
                const col = fairyColors[i % fairyColors.length];

                ctx.fillStyle = col;
                ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i);
                ctx.fillRect(fx - 1, fy - 1, 4, 4);
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.9;
                ctx.fillRect(fx, fy, 2, 2);
            }
            ctx.globalAlpha = 1.0;
        }

        drawFiguresOnRoof(ctx, vanX, vanY, t) {
            // 1. Quilted Camp Blanket / Thermal Sleeping Pad under them
            ctx.fillStyle = '#831843';
            ctx.fillRect(vanX + 50, vanY + 2, 64, 4);
            ctx.fillStyle = '#fbcfe8';
            ctx.fillRect(vanX + 48, vanY + 4, 68, 2);

            const breathCycle = (t * 0.85) % 4.0;
            const isBreathing = breathCycle < 1.2;

            // 2. FIGURE 1 (Left - "She"):
            const f1x = vanX + 60;
            const f1y = vanY - 22;

            // Legs dangling over roof edge
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(f1x + 2, vanY + 2, 8, 8);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(f1x + 1, vanY + 9, 10, 4);
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(f1x + 1, vanY + 8, 10, 2);

            // Parka Body (Warm berry coat)
            ctx.fillStyle = '#9f1239';
            ctx.fillRect(f1x, f1y + 8, 14, 15);
            ctx.fillStyle = '#be123c';
            ctx.fillRect(f1x + 2, f1y + 10, 10, 12);

            // White Sherpa Fur Collar around neck
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(f1x + 1, f1y + 6, 12, 4);
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(f1x + 2, f1y + 9, 10, 2);

            // Head & Hair
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(f1x + 2, f1y + 1, 10, 10);
            ctx.fillRect(f1x + 1, f1y + 4, 12, 8);
            ctx.fillRect(f1x + 2, f1y + 11, 4, 5);

            // Cute Rose Winter Beanie
            ctx.fillStyle = '#fb7185';
            ctx.fillRect(f1x + 2, f1y - 3, 10, 6);
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(f1x + 3, f1y - 5, 8, 3);
            // Fluffy White Pom-Pom on top!
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(f1x + 6, f1y - 8, 4, 4);
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(f1x + 5, f1y - 7, 6, 2);

            // Mittens holding camp mug
            ctx.fillStyle = '#fb7185';
            ctx.fillRect(f1x + 7, f1y + 14, 4, 4);

            // 3. FIGURE 2 (Right - "Her"):
            const f2x = vanX + 76;
            const f2y = vanY - 23;

            // Legs
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(f2x + 4, vanY + 2, 8, 8);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(f2x + 4, vanY + 9, 9, 4);
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(f2x + 4, vanY + 8, 9, 2);

            // Coat Body (Deep Navy/Spruce)
            ctx.fillStyle = '#1e3a5f';
            ctx.fillRect(f2x + 2, f2y + 8, 15, 15);
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(f2x + 4, f2y + 10, 11, 12);

            // Warm Knitted Scarf (Pastel Gold/Yellow)
            ctx.fillStyle = '#fde047';
            ctx.fillRect(f2x + 3, f2y + 7, 12, 4);
            ctx.fillStyle = '#eab308';
            ctx.fillRect(f2x + 5, f2y + 10, 4, 7);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(f2x + 5, f2y + 16, 4, 2);

            // Her Left Arm affectionately wrapped around Figure 1's shoulders
            ctx.fillStyle = '#1e3a5f';
            ctx.fillRect(f1x + 10, f1y + 8, 8, 5);
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(f1x + 8, f1y + 9, 4, 4);

            // Head & Hair
            ctx.fillStyle = '#451a03';
            ctx.fillRect(f2x + 4, f2y + 1, 10, 8);
            ctx.fillRect(f2x + 3, f2y + 4, 12, 7);

            // Cute Winter Earmuffs / Headband
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(f2x + 3, f2y - 2, 12, 3);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(f2x + 2, f2y + 1, 4, 5);
            ctx.fillRect(f2x + 12, f2y + 1, 4, 5);

            // 4. Shared Cozy Plaid Fleece Blanket draped over both their backs
            ctx.fillStyle = '#7c2d12';
            ctx.fillRect(f1x + 4, f1y + 12, 22, 9);
            ctx.fillStyle = '#9a3412';
            ctx.fillRect(f1x + 6, f1y + 14, 18, 6);
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(f1x + 4, f1y + 20, 22, 2);

            // 5. Hot Thermos & Steaming Enamel Camp Mug
            const mugX = vanX + 100;
            const mugY = vanY - 6;

            // Stainless Steel Thermos with Red Cap
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(mugX + 10, mugY - 4, 6, 12);
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(mugX + 11, mugY - 3, 2, 10);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(mugX + 9, mugY - 7, 8, 4);

            // Camp Enamel Mug
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(mugX, mugY + 2, 7, 6);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(mugX, mugY + 1, 7, 1);
            ctx.fillRect(mugX + 6, mugY + 3, 2, 3);

            // Delicate Steam wisps rising into polar air
            for (let i = 0; i < 3; i++) {
                const sy = ((t * 14 + i * 6) % 18);
                const sx = mugX + 3 + Math.sin(t * 3 + i) * 2;
                ctx.fillStyle = 'rgba(248, 250, 252, 0.45)';
                ctx.fillRect(sx, mugY - sy, 2, 2);
            }

            // 6. Condensing Breath Mist from the two figures
            if (isBreathing) {
                const bAlpha = (1.2 - breathCycle) * 0.45;
                ctx.fillStyle = `rgba(240, 249, 255, ${bAlpha})`;
                ctx.fillRect(f1x + 11, f1y + 1 - breathCycle * 3, 3, 2);
                ctx.fillRect(f1x + 13, f1y - breathCycle * 4, 4, 3);
                ctx.fillRect(f2x + 10, f2y + 1 - breathCycle * 3, 3, 2);
                ctx.fillRect(f2x + 12, f2y - breathCycle * 4, 4, 3);
            }
        }

        drawAuroraMessage(ctx, t) {
            ctx.save();
            const message = 'GET WELL SOON MY SWEETHEART';
            const cx = VW / 2;
            const cy = 34;

            ctx.font = '11px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const glowAmp = 0.8 + 0.2 * Math.sin(t * 2.5);

            // Drop shadow
            ctx.fillStyle = '#020617';
            ctx.fillText(message, cx + 2, cy + 2);

            // Emerald aura
            ctx.fillStyle = `rgba(52, 211, 153, ${0.45 * glowAmp})`;
            ctx.fillText(message, cx - 1, cy);
            ctx.fillText(message, cx + 1, cy);
            ctx.fillText(message, cx, cy - 1);
            ctx.fillText(message, cx, cy + 1);

            // Cyan aura
            ctx.fillStyle = `rgba(34, 211, 238, ${0.7 * glowAmp})`;
            ctx.fillText(message, cx, cy);

            // Pure diamond white text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(message, cx, cy);

            ctx.restore();
        }

        drawNorthPoleVignette(ctx) {
            const vig = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.42, VW / 2, VH / 2, VW * 0.72);
            vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vig.addColorStop(0.65, 'rgba(2, 6, 23, 0.15)');
            vig.addColorStop(1, 'rgba(2, 6, 23, 0.65)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, VW, VH);
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
