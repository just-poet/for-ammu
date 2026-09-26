/* ============================================================================
   PIXEL ART GAME ENGINE — HIGH-FIDELITY VACATION LOVE STORY
   A Romantic Journey for Ammu & Eugene
   ============================================================================ */

const VW = 384;
const VH = 216;

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Offscreen canvas for crisp pixel scaling
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

        // Fade transition
        this.fadeAlpha = 0;
        this.fading = false;
        this.fadingIn = false;
        this.fadeCb = null;

        // DOM elements
        this.dBox = document.getElementById('dialogue-box');
        this.dSpeaker = document.getElementById('dialogue-speaker');
        this.dText = document.getElementById('dialogue-text');
        this.dChoices = document.getElementById('dialogue-choices');
        this.dContinue = document.getElementById('dialogue-continue');
        this.typeInterval = null;

        // Scene Progression Queue
        this.scenes = [
            'VACATION_ASK',     // 0: "Finally vacation time?" + movie ask
            'WALK_CINEMA',      // 1: Walking to vintage cinema hall
            'CINEMA_SCENE',     // 2: Inside watching Premam (Malayalam)
            'MOVIE_DIALOGUE',   // 3: Dialogue about Premam
            'ICE_CREAM_ASK',    // 4: Ask about ice cream & cotton candy
            'WALK_ICE_CREAM',   // 5: Walking to sweet parlour
            'ICE_CREAM_SCENE',  // 6: Eating ice cream & cotton candy together
            'WALK_BEACH',       // 7: Walking to beach
            'BEACH_BENCH',      // 8: Sitting on beach bench, "I love you"
            'NIGHT_TRANSITION', // 9: Sunset to celestial night transition
            'TANGLED_BOAT'      // 10: Tangled boat scene (castle + floating lanterns)
        ];
        this.si = -1;
        this.adventureComplete = false;
        this.completeTime = 0;

        // Tangled Lanterns System (multi-depth parallax)
        this.lanterns = [];
        for (let i = 0; i < 48; i++) {
            const depth = (i % 3 === 0) ? 'far' : (i % 3 === 1) ? 'mid' : 'near';
            this.lanterns.push({
                x: Math.random() * (VW + 40) - 20,
                y: VH * 0.2 + Math.random() * (VH * 0.9),
                speed: depth === 'far' ? 0.18 + Math.random() * 0.15 : depth === 'mid' ? 0.32 + Math.random() * 0.2 : 0.5 + Math.random() * 0.25,
                drift: (Math.random() - 0.5) * 0.35,
                size: depth === 'far' ? 3 + Math.random() * 1.5 : depth === 'mid' ? 5 + Math.random() * 2 : 8 + Math.random() * 3,
                glow: depth === 'far' ? 0.45 : depth === 'mid' ? 0.7 : 0.95,
                phase: Math.random() * Math.PI * 2,
                depth: depth
            });
        }
        this.lanternsActive = false;

        // Intro decorative stars
        this.createIntroStars();

        // Dual Audio System
        // Track 1: Malare (plays from 0:25 to till ice cream shop)
        // Track 2: Tangled youtube-audio.mp3 (plays from 1:35 after that)
        this.audio1 = document.getElementById('bg-music-1');
        this.audio2 = document.getElementById('bg-music-2');
        this.currentTrack = 1;
        this.musicMuted = false;

        if (this.audio1) {
            this.audio1.volume = 0.55;
            this.audio1.addEventListener('ended', () => {
                this.audio1.currentTime = 25;
                this.audio1.play().catch(() => {});
            });
        }
        if (this.audio2) {
            this.audio2.volume = 0.60;
            this.audio2.addEventListener('ended', () => {
                this.audio2.currentTime = 95;
                this.audio2.play().catch(() => {});
            });
        }

        const onFirstInteract = () => {
            if (this.state !== 'INTRO' && !this.musicMuted) {
                const active = (this.currentTrack === 1) ? this.audio1 : this.audio2;
                if (active && active.paused) {
                    this.playMusic();
                }
            }
        };
        window.addEventListener('click', onFirstInteract);
        window.addEventListener('keydown', onFirstInteract);

        // Start animation loop
        this.last = 0;
        requestAnimationFrame(t => this.loop(t));
    }

    createIntroStars() {
        const c = document.getElementById('intro-stars');
        if (!c) return;
        for (let i = 0; i < 65; i++) {
            const s = document.createElement('div');
            s.className = 'intro-star';
            s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${1+Math.random()*2.5}px;height:${1+Math.random()*2.5}px;animation-delay:${Math.random()*3}s;animation-duration:${1.5+Math.random()*2}s`;
            c.appendChild(s);
        }
    }

    resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const s = Math.max(1, Math.floor(Math.min(w / VW, h / VH)));
        this.canvas.width = VW * s;
        this.canvas.height = VH * s;
        this.canvas.style.width = VW * s + 'px';
        this.canvas.style.height = VH * s + 'px';
        this.scale = s;
        this.ctx.imageSmoothingEnabled = false;
    }

    playTrack(trackNum) {
        if (trackNum === 1) {
            this.currentTrack = 1;
            if (this.audio2) this.audio2.pause();
            if (this.audio1 && !this.musicMuted) {
                this.audio1.currentTime = 25; // 0:25 seconds
                this.audio1.play().then(() => {
                    const btn = document.getElementById('music-btn');
                    if (btn) btn.classList.remove('muted');
                }).catch(() => {});
            }
        } else if (trackNum === 2) {
            if (this.currentTrack === 2 && this.audio2 && !this.audio2.paused) return;
            this.currentTrack = 2;
            if (this.audio1) this.audio1.pause();
            if (this.audio2 && !this.musicMuted) {
                this.audio2.currentTime = 95; // 1:35 seconds
                this.audio2.play().then(() => {
                    const btn = document.getElementById('music-btn');
                    if (btn) btn.classList.remove('muted');
                }).catch(() => {});
            }
        }
    }

    playMusic() {
        const active = (this.currentTrack === 1) ? this.audio1 : this.audio2;
        if (!active) return;
        if (this.currentTrack === 1 && active.currentTime < 25) {
            active.currentTime = 25;
        } else if (this.currentTrack === 2 && active.currentTime < 95) {
            active.currentTime = 95;
        }
        active.play().then(() => {
            const btn = document.getElementById('music-btn');
            if (btn) btn.classList.remove('muted');
        }).catch(() => {});
    }

    toggleMusic() {
        const btn = document.getElementById('music-btn');
        const active = (this.currentTrack === 1) ? this.audio1 : this.audio2;
        if (!active) return;
        if (active.paused) {
            this.musicMuted = false;
            active.play().catch(() => {});
            if (btn) btn.classList.remove('muted');
        } else {
            this.musicMuted = true;
            if (this.audio1) this.audio1.pause();
            if (this.audio2) this.audio2.pause();
            if (btn) btn.classList.add('muted');
        }
    }

    startGame() {
        const intro = document.getElementById('intro-overlay');
        intro.style.opacity = '0';
        intro.style.transition = 'opacity 0.6s ease';
        this.playTrack(1); // Malare from 0:25 seconds
        setTimeout(() => {
            intro.classList.add('hidden');
            this.advance();
        }, 600);
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
            if (this.walkTimer > 175) {
                this.walkFrame = (this.walkFrame + 1) % 4;
                this.walkTimer = 0;
            }
            this.bgOffset += dt * 0.065;
        }

        // Fade logic
        if (this.fading) {
            if (this.fadingIn) {
                this.fadeAlpha -= dt * 0.0035;
                if (this.fadeAlpha <= 0) { this.fadeAlpha = 0; this.fading = false; }
            } else {
                this.fadeAlpha += dt * 0.0035;
                if (this.fadeAlpha >= 1) {
                    this.fadeAlpha = 1;
                    this.fading = false;
                    if (this.fadeCb) { const cb = this.fadeCb; this.fadeCb = null; cb(); }
                }
            }
        }

        // Tangled Lanterns Floating Upward
        if (this.lanternsActive) {
            this.lanterns.forEach(l => {
                l.y -= l.speed * (dt * 0.06);
                l.x += l.drift * (dt * 0.06) + Math.sin(this.animTime * 0.0012 + l.phase) * 0.12;
                if (l.y < -25) {
                    l.y = VH + 15;
                    l.x = Math.random() * (VW + 40) - 20;
                }
            });
        }

        // Auto-advance walking scenes
        if (this.state.startsWith('WALK_') && !this.walkDone && this.stateTime > 3900) {
            this.walkDone = true;
            this.walking = false;
            this.walkFrame = 0;
            this.advance();
        }

        // Auto-advance night transition
        if (this.state === 'NIGHT_TRANSITION' && !this.walkDone && this.stateTime > 3800) {
            this.walkDone = true;
            this.advance();
        }
    }

    // ============ RENDER ============
    render() {
        const c = this.oc;
        c.clearRect(0, 0, VW, VH);

        switch (this.state) {
            case 'INTRO': break;
            case 'VACATION_ASK':
                this.drawCity(c);
                this.drawCharacters(c, 'stand');
                break;
            case 'WALK_CINEMA':
                this.drawCity(c);
                this.drawCharacters(c, 'walk');
                this.drawWalkLabel(c, 'WALKING TO VINTAGE CINEMA...');
                break;
            case 'CINEMA_SCENE':
            case 'MOVIE_DIALOGUE':
                this.drawCinemaInterior(c);
                break;
            case 'ICE_CREAM_ASK':
                this.drawIceCreamShop(c);
                this.drawCharacters(c, 'stand');
                break;
            case 'WALK_ICE_CREAM':
                this.drawCity(c);
                this.drawCharacters(c, 'walk');
                this.drawWalkLabel(c, 'HEADING TO SWEET PARLOUR...');
                break;
            case 'ICE_CREAM_SCENE':
                this.drawIceCreamShop(c);
                this.drawCharactersAtShop(c);
                break;
            case 'WALK_BEACH':
                this.drawBeachDay(c, false);
                this.drawCharacters(c, 'walk');
                this.drawWalkLabel(c, 'WALKING TO SEASIDE BEACH...');
                break;
            case 'BEACH_BENCH':
                this.drawBeachDay(c, true);
                this.drawBenchScene(c);
                break;
            case 'NIGHT_TRANSITION':
                this.drawNightTransition(c);
                break;
            case 'TANGLED_BOAT':
                this.drawTangledScene(c);
                break;
            case 'PRE_FINALE':
                this.drawTangledScene(c);
                break;
            case 'FINALE':
                this.drawNightSky(c);
                break;
        }

        // Fade overlay
        if (this.fadeAlpha > 0) {
            c.fillStyle = `rgba(10, 10, 26, ${Math.min(1, this.fadeAlpha)})`;
            c.fillRect(0, 0, VW, VH);
        }

        // Blit virtual offscreen canvas to main canvas scaled up
        this.ctx.drawImage(this.off, 0, 0, this.canvas.width, this.canvas.height);
    }

    // ============ SCENE FLOW ============
    advance() {
        this.si++;
        if (this.si >= this.scenes.length) return;
        this.state = this.scenes[this.si];
        this.stateTime = 0;
        this.walkDone = false;

        this.hideDialogue();

        switch (this.state) {
            case 'VACATION_ASK':
                this.walking = false;
                this.fadeIn();
                setTimeout(() => this.showVacationAsk(), 500);
                break;
            case 'WALK_CINEMA':
                this.walking = true;
                this.fadeIn();
                break;
            case 'CINEMA_SCENE':
                this.walking = false;
                this.fadeOut(() => {
                    this.fadeIn();
                    setTimeout(() => this.showCinemaDialogue(), 600);
                });
                break;
            case 'MOVIE_DIALOGUE':
                this.walking = false;
                this.showMovieReaction();
                break;
            case 'ICE_CREAM_ASK':
                this.walking = false;
                this.fadeOut(() => {
                    this.fadeIn();
                    setTimeout(() => this.showIceCreamAsk(), 500);
                });
                break;
            case 'WALK_ICE_CREAM':
                this.walking = true;
                this.fadeIn();
                break;
            case 'ICE_CREAM_SCENE':
                this.walking = false;
                this.fadeOut(() => {
                    this.fadeIn();
                    setTimeout(() => this.showIceCreamDialogue(), 600);
                });
                break;
            case 'WALK_BEACH':
                this.playTrack(2); // After ice cream shop: Tangled song from 1:35
                this.walking = true;
                this.fadeOut(() => {
                    this.fadeIn();
                });
                break;
            case 'BEACH_BENCH':
                this.walking = false;
                this.fadeOut(() => {
                    this.fadeIn();
                    setTimeout(() => this.showBeachDialogue(), 600);
                });
                break;
            case 'NIGHT_TRANSITION':
                this.walking = false;
                break;
            case 'TANGLED_BOAT':
                this.lanternsActive = true;
                this.playTrack(2);
                this.fadeOut(() => {
                    this.fadeIn();
                    setTimeout(() => this.showTangledDialogue(), 800);
                });
                break;
        }
    }

    // ============ DIALOGUE SYSTEM ============
    showDialogue(speaker, text, choices, onContinue) {
        this.dBox.classList.remove('hidden');
        this.dSpeaker.textContent = speaker;
        this.dSpeaker.style.color = (speaker === 'Me' || speaker === 'Eugene') ? '#4da6ff' : '#ffd166';
        this.dText.textContent = '';
        this.dChoices.innerHTML = '';
        this.dContinue.classList.add('hidden');

        let i = 0;
        clearInterval(this.typeInterval);
        this.typeInterval = setInterval(() => {
            if (i < text.length) {
                this.dText.textContent += text[i];
                i++;
            } else {
                clearInterval(this.typeInterval);
                if (choices) {
                    choices.forEach(ch => {
                        const btn = document.createElement('button');
                        btn.className = `choice-btn ${ch.class || 'yes-btn'}`;
                        btn.textContent = ch.text;
                        btn.onclick = () => ch.action();
                        this.dChoices.appendChild(btn);
                    });
                } else if (onContinue) {
                    this.dContinue.classList.remove('hidden');
                    this.dContinue.onclick = onContinue;
                }
            }
        }, 26);
    }

    hideDialogue() {
        clearInterval(this.typeInterval);
        this.dBox.classList.add('hidden');
        this.dChoices.innerHTML = '';
        this.dContinue.classList.add('hidden');
    }

    fadeOut(cb) {
        this.fadeAlpha = 0;
        this.fading = true;
        this.fadingIn = false;
        this.fadeCb = cb;
    }

    fadeIn() {
        this.fadeAlpha = 1;
        this.fading = true;
        this.fadingIn = true;
    }

    // ============ STORY DIALOGUES ============

    showVacationAsk() {
        this.showDialogue('Me', 'Finally vacation time! Wanna go to the movies with me?', null, () => {
            this.hideDialogue();
            this.showDialogue('Me', 'Yayyy! Let\'s walk over to the vintage cinema hall.', null, () => {
                this.advance();
            });
        });
    }

    showCinemaDialogue() {
        this.showDialogue('Me', '🎵 "Malare ninne kaanathirunnal... mizhivekiya niramellam maayunna pole..."', null, () => {
            this.hideDialogue();
            this.showDialogue('Me', '🎵 "Alivoden arikathinnanayathirunnal... azhakekiya kanavellam akalunna pole..."', null, () => {
                this.hideDialogue();
                this.showDialogue('Me', '🎵 "En akathaaril anuraagam pakarunna yaamam... Malare... ennuyiril vidarum panimalare..."', null, () => {
                    this.advance();
                });
            });
        });
    }

    showMovieReaction() {
        this.showDialogue('Me', 'That was such a nice movie.', null, () => {
            this.hideDialogue();
            this.showDialogue('Me', 'Wanna go here? Let\'s get some ice cream and cotton candy.', null, () => {
                this.advance();
            });
        });
    }

    showIceCreamAsk() {
        this.showDialogue('Me', 'There\'s the sweet parlour right ahead. Wanna get some ice cream and cotton candy?', null, () => {
            this.hideDialogue();
            this.showDialogue('Me', 'Yayyy! Let\'s go!', null, () => {
                this.advance();
            });
        });
    }

    showIceCreamDialogue() {
        this.showDialogue('Me', 'Here\'s your cotton candy and my ice cream cone.', null, () => {
            this.hideDialogue();
            this.showDialogue('Me', 'Wanna go here? Let\'s walk over to the beach.', null, () => {
                this.hideDialogue();
                this.showDialogue('Me', 'Yayyy! Let\'s head over to the beach then.', null, () => {
                    this.advance();
                });
            });
        });
    }

    showBeachDialogue() {
        this.showDialogue('Me', 'Let\'s sit here on this bench and look at the sea.', null, () => {
            this.hideDialogue();
            this.showDialogue('Me', 'The sunset looks really pretty over the water.', null, () => {
                this.hideDialogue();
                this.showDialogue('Me', 'Ammu... I love you. Will you go to the lantern festival tonight with me?', [
                    {
                        text: 'YES! 🏮',
                        class: 'yes-btn',
                        action: () => {
                            this.hideDialogue();
                            this.showDialogue('Me', 'Yayyy! Look, it\'s getting dark... let\'s head down to the boat.', null, () => {
                                this.advance();
                            });
                        }
                    },
                    {
                        text: 'NO! 😜',
                        class: 'no-btn',
                        action: () => {
                            this.hideDialogue();
                            this.showDialogue('Me', 'It\'s okayyyy, I understand.', null, () => {
                                this.advance();
                            });
                        }
                    }
                ]);
            });
        });
    }

    showTangledDialogue() {
        this.showDialogue('Me', 'Look at all the lanterns floating up into the sky... and the castle across the water.', null, () => {
            this.hideDialogue();
            this.showDialogue('Me', '🎵 "All those days watching from the windows... all those years outside looking in..."', null, () => {
                this.hideDialogue();
                this.showDialogue('Me', '🎵 "And at last I see the light, and it\'s like the fog has lifted..."', null, () => {
                    this.hideDialogue();
                    this.showDialogue('Me', '🎵 "And at last I see the light, and it\'s like the sky is new... and it\'s warm and real and bright..."', null, () => {
                        this.hideDialogue();
                        this.showDialogue('Me', '🎵 "And the world has somehow shifted... now that I see you."', null, () => {
                            this.hideDialogue();
                            this.showDialogue('Me', 'You are my new dream, Ammu. 🏮✨', null, () => {
                                this.adventureComplete = true;
                                this.completeTime = this.animTime;
                                setTimeout(() => this.hideDialogue(), 2500);
                            });
                        });
                    });
                });
            });
        });
    }

    // ========================================================================
    // HIGH-DEFINITION GRAPHICS: CITY & VINTAGE CINEMA HALL EXTERIOR
    // ========================================================================

    drawCity(c) {
        const o = this.bgOffset;
        const gy = Math.floor(VH * 0.68);

        // 1. Lush Morning/Afternoon Sky Gradient
        this.gradient(c, 0, 0, VW, Math.floor(VH * 0.58), '#3a9fe6', '#6ac0ee', '#a8dcf8', '#fce2ba', '#fff2d6');

        // 2. High-Fidelity Fluffy Clouds with 3D Billows & Shading
        this.drawFluffyCloud(c, this.wrap(45 - o * 0.12, VW + 80, -80), 12, 54);
        this.drawFluffyCloud(c, this.wrap(185 - o * 0.09, VW + 70, -70), 22, 44);
        this.drawFluffyCloud(c, this.wrap(310 - o * 0.15, VW + 60, -60), 8, 38);

        // 3. Graceful Birds Flying
        for (let i = 0; i < 3; i++) {
            const bx = this.wrap(120 + i * 85 - o * 0.22, VW + 30, -30);
            const by = 22 + Math.sin(this.animTime * 0.003 + i * 1.8) * 5;
            this.drawBird(c, bx, by);
        }

        // 4. Parallax Distant Skyline (Spires, Domes, Classical Towers)
        this.drawDetailedSkyline(c, o * 0.12, gy);

        // 5. Streetscape: Townhouses & Vintage Cinema Facade
        const buildings = [
            { type: 'house', x: 0,   w: 48, h: 64, col: '#e2be96', roof: '#b84e2a' },
            { type: 'cinema', x: 50, w: 90, h: 88 }, // THE VINTAGE CINEMA!
            { type: 'house', x: 142, w: 46, h: 66, col: '#d8c2aa', roof: '#3d745c' },
            { type: 'house', x: 190, w: 52, h: 72, col: '#e8cca8', roof: '#a85032' },
            { type: 'house', x: 244, w: 42, h: 58, col: '#c8b49c', roof: '#486256' },
            { type: 'house', x: 288, w: 50, h: 68, col: '#edd8bc', roof: '#b45230' },
            { type: 'house', x: 340, w: 50, h: 62, col: '#dcc6ae', roof: '#3a6e5a' }
        ];

        buildings.forEach(b => {
            const bx = this.wrap(b.x - o * 0.45, VW + 100, -100);
            if (b.type === 'cinema') {
                this.drawVintageCinemaExterior(c, bx, gy, b.w, b.h);
            } else {
                this.drawDetailedTownhouse(c, bx, gy, b.w, b.h, b);
            }
        });

        // 6. Street Furnishings: Trees with Planters & Falling Leaves
        [32, 175, 275, 365].forEach((tx, idx) => {
            const px = this.wrap(tx - o * 0.72, VW + 35, -35);
            this.drawDetailedCityTree(c, px, gy, idx);
        });

        // 7. Victorian Ornate Lampposts with Radial Warm Glow
        [80, 220, 320].forEach(lx => {
            const px = this.wrap(lx - o * 0.82, VW + 25, -25);
            this.drawDetailedLamppost(c, px, gy);
        });

        // 8. Sidewalk Café Table & Vintage Bicycle
        const cafeX = this.wrap(12 - o * 0.76, VW + 50, -50);
        this.drawCafeTable(c, cafeX, gy);

        const bikeX = this.wrap(250 - o * 0.84, VW + 40, -40);
        this.drawBicycle(c, bikeX, gy);

        // 9. Herringbone Paver Sidewalk with Granite Curb
        const swH = 7;
        c.fillStyle = '#dbd4cc';
        c.fillRect(0, gy, VW, swH);
        for (let x = Math.floor(-o * 0.88) % 12 - 12; x < VW; x += 12) {
            c.fillStyle = '#bebaa8';
            c.fillRect(x, gy, 1, swH);
            c.fillStyle = '#f0ebe4';
            c.fillRect(x + 1, gy, 1, swH);
            // Herringbone pattern dots
            c.fillStyle = '#c8c2b6';
            c.fillRect(x + 4, gy + 2, 3, 2);
            c.fillRect(x + 7, gy + 4, 3, 2);
        }
        // Granite Curb
        c.fillStyle = '#9c948a';
        c.fillRect(0, gy + swH - 2, VW, 1);
        c.fillStyle = '#6e665c';
        c.fillRect(0, gy + swH - 1, VW, 1);

        // 10. Asphalt Road with Weathering & Yellow Markings
        const roadY = gy + swH;
        c.fillStyle = '#26262e';
        c.fillRect(0, roadY, VW, VH - roadY);
        c.fillStyle = '#34343e';
        for (let x = Math.floor(-o * 0.95) % 18 - 18; x < VW; x += 18) {
            c.fillRect(x + 5, roadY + 6, 2, 1);
            c.fillRect(x + 12, roadY + 16, 2, 1);
        }
        // Crisp Yellow Centerline Dash
        const dy = roadY + Math.floor((VH - roadY) / 2);
        for (let x = Math.floor(-o * 0.98) % 28 - 28; x < VW; x += 28) {
            c.fillStyle = '#e8ba22';
            c.fillRect(x, dy, 15, 2);
            c.fillStyle = '#c49a14';
            c.fillRect(x, dy + 2, 15, 1);
        }
    }

    drawDetailedTownhouse(c, x, gy, w, h, b) {
        // Main wall with brick texture
        c.fillStyle = b.col;
        c.fillRect(x, gy - h, w, h);

        // Right side drop shadow
        c.fillStyle = 'rgba(0, 0, 0, 0.15)';
        c.fillRect(x + w - 4, gy - h, 4, h);

        // Individual Brick Flecks
        c.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let row = 0; row < h - 14; row += 6) {
            const shift = (row % 12 === 0) ? 0 : 5;
            for (let bx = x + 3 + shift; bx < x + w - 6; bx += 10) {
                c.fillRect(bx, gy - h + 10 + row, 5, 2);
            }
        }

        // Stone corner quoins
        c.fillStyle = '#faf4eb';
        for (let qy = gy - h; qy < gy - 4; qy += 8) {
            c.fillRect(x, qy, 3, 4);
            c.fillRect(x + w - 3, qy, 3, 4);
        }

        // 3D Roof with Cornice
        c.fillStyle = b.roof;
        c.fillRect(x - 3, gy - h - 4, w + 6, 5);
        c.fillStyle = 'rgba(255,255,255,0.2)';
        c.fillRect(x - 2, gy - h - 4, w + 4, 1);
        c.fillStyle = '#5c2a1a';
        c.fillRect(x - 3, gy - h + 1, w + 6, 2);

        // Chimney with animated smoke puffs
        c.fillStyle = '#8a3c28';
        c.fillRect(x + 8, gy - h - 14, 7, 10);
        c.fillStyle = '#5c2214';
        c.fillRect(x + 7, gy - h - 15, 9, 2);
        // Swirling Smoke
        const smt = this.animTime * 0.003;
        for (let s = 0; s < 3; s++) {
            const sp = (smt * 15 + s * 20) % 50;
            const sx = x + 11 + Math.sin(smt * 2 + s) * 5;
            const sy = gy - h - 16 - sp * 0.45;
            const sa = Math.max(0, 0.5 - sp / 100);
            c.fillStyle = `rgba(240, 240, 250, ${sa})`;
            this.drawCircle(c, Math.floor(sx), Math.floor(sy), Math.floor(2 + sp * 0.06));
        }

        // Multi-paned Windows with Wooden Shutters & Flower Boxes
        const ww = 6, wh = 9, gap = 5;
        const cols = Math.max(1, Math.floor((w - 10) / (ww + gap)));
        const sx = x + Math.floor((w - cols * (ww + gap) + gap) / 2);
        const rows = Math.min(Math.floor((h - 20) / 16), 3);

        for (let r = 0; r < rows; r++) {
            for (let cl = 0; cl < cols; cl++) {
                const wx = sx + cl * (ww + gap);
                const wy = gy - h + 12 + r * 16;

                // Shutters
                c.fillStyle = '#2f523c';
                c.fillRect(wx - 3, wy, 2, wh);
                c.fillRect(wx + ww + 1, wy, 2, wh);

                // Frame
                c.fillStyle = '#3a2416';
                c.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);

                // Warm glass with reflection
                c.fillStyle = '#fffae4';
                c.fillRect(wx, wy, ww, wh);
                c.fillStyle = '#5c4028';
                c.fillRect(wx + Math.floor(ww / 2), wy, 1, wh);
                c.fillRect(wx, wy + Math.floor(wh / 2), ww, 1);

                // Flower box on bottom floor window
                if (r === rows - 1) {
                    c.fillStyle = '#543622';
                    c.fillRect(wx - 2, wy + wh, ww + 4, 3);
                    c.fillStyle = '#ff4d79';
                    c.fillRect(wx - 1, wy + wh - 1, 2, 2);
                    c.fillRect(wx + 3, wy + wh - 1, 2, 2);
                    c.fillStyle = '#44aa44';
                    c.fillRect(wx + 1, wy + wh - 1, 2, 1);
                }
            }
        }

        // Arched Front Door
        const dw = 10, dh = 15;
        const dx = x + Math.floor((w - dw) / 2);
        c.fillStyle = '#3c2214';
        c.fillRect(dx, gy - dh, dw, dh);
        c.fillStyle = '#5c3620';
        c.fillRect(dx + 1, gy - dh + 1, dw - 2, dh - 1);
        c.fillStyle = '#ffd152';
        c.fillRect(dx + dw - 3, gy - 7, 2, 2); // Brass knob
    }

    // THE VINTAGE CINEMA HALL EXTERIOR (Premam Showing!)
    drawVintageCinemaExterior(c, x, gy, w, h) {
        // Art Deco Cinema Facade
        c.fillStyle = '#9b2b3a'; // Rich theater burgundy
        c.fillRect(x, gy - h, w, h);
        c.fillStyle = '#7a1c29';
        c.fillRect(x + w - 5, gy - h, 5, h);

        // Gold Trim Pilasters
        for (let px = x + 4; px <= x + w - 8; px += 26) {
            c.fillStyle = '#e6b84a';
            c.fillRect(px, gy - h, 3, h);
            c.fillStyle = '#ffd978';
            c.fillRect(px + 1, gy - h, 1, h);
        }

        // Grand Illuminated Marquee Projection
        const mqY = gy - h + 14;
        const mqH = 26;
        c.fillStyle = '#1c1c24';
        c.fillRect(x + 4, mqY, w - 8, mqH);
        c.fillStyle = '#e6b84a';
        c.fillRect(x + 2, mqY - 2, w - 4, 3);
        c.fillRect(x + 2, mqY + mqH - 1, w - 4, 3);

        // Animated Marquee Chaser Bulbs
        const bulbTick = Math.floor(this.animTime / 180) % 2;
        for (let bx = x + 4; bx < x + w - 8; bx += 6) {
            c.fillStyle = (bulbTick === 0) ? '#ffea78' : '#ffa030';
            c.fillRect(bx, mqY - 1, 2, 2);
            c.fillStyle = (bulbTick === 1) ? '#ffea78' : '#ffa030';
            c.fillRect(bx, mqY + mqH - 2, 2, 2);
        }

        // Marquee Glowing Letters: "VINTAGE CINEMA" & "PREMAM"
        this.drawTinyText(c, 'VINTAGE CINEMA', x + Math.floor(w / 2), mqY + 4, '#ffdd66', true);
        this.drawTinyText(c, '★ PREMAM ★', x + Math.floor(w / 2), mqY + 14, '#ff4770', true);

        // Movie Poster Frames on Walls
        // Left Poster: Premam (George & Malar)
        c.fillStyle = '#e6b84a';
        c.fillRect(x + 8, mqY + mqH + 6, 22, 28);
        c.fillStyle = '#18243b';
        c.fillRect(x + 9, mqY + mqH + 7, 20, 26);
        // Poster Art inside: Blue/Green Kerala hills & butterfly
        c.fillStyle = '#2f7447';
        c.fillRect(x + 9, mqY + mqH + 18, 20, 15);
        c.fillStyle = '#ff6b9d';
        c.fillRect(x + 16, mqY + mqH + 12, 3, 2); // Butterfly
        c.fillRect(x + 20, mqY + mqH + 11, 3, 2);
        this.drawTinyText(c, 'PREMAM', x + 19, mqY + mqH + 26, '#ffffff', true);

        // Right Poster: Vintage Romance
        c.fillStyle = '#e6b84a';
        c.fillRect(x + w - 30, mqY + mqH + 6, 22, 28);
        c.fillStyle = '#3a1824';
        c.fillRect(x + w - 29, mqY + mqH + 7, 20, 26);
        this.drawPixelHeart(c, x + w - 19, mqY + mqH + 15, '#ff4770', 1);
        this.drawTinyText(c, 'NOW ON', x + w - 19, mqY + mqH + 26, '#ffd978', true);

        // Grand Double Entrance Doors
        const dw = 24, dh = 18;
        const dx = x + Math.floor(w / 2) - Math.floor(dw / 2);
        c.fillStyle = '#2b1a16';
        c.fillRect(dx, gy - dh, dw, dh);
        // Glass panes
        c.fillStyle = '#fff0ba';
        c.fillRect(dx + 3, gy - dh + 2, 7, 10);
        c.fillRect(dx + 14, gy - dh + 2, 7, 10);
        // Brass Kickplates & Handles
        c.fillStyle = '#e6b84a';
        c.fillRect(dx + 2, gy - 4, dw - 4, 3);
        c.fillRect(dx + 9, gy - 10, 2, 4);
        c.fillRect(dx + 13, gy - 10, 2, 4);

        // Red Carpet Leading In
        c.fillStyle = '#c42036';
        c.fillRect(dx - 4, gy - 1, dw + 8, 2);
    }

    drawDetailedSkyline(c, offset, gy) {
        const blds = [
            { x: 0,   w: 36, h: 46, t: 'spire' },
            { x: 40,  w: 28, h: 36, t: 'flat' },
            { x: 72,  w: 44, h: 54, t: 'dome' },
            { x: 120, w: 32, h: 40, t: 'flat' },
            { x: 156, w: 40, h: 60, t: 'spire' },
            { x: 200, w: 34, h: 42, t: 'flat' },
            { x: 238, w: 46, h: 52, t: 'dome' },
            { x: 288, w: 36, h: 44, t: 'flat' },
            { x: 328, w: 42, h: 62, t: 'spire' },
            { x: 374, w: 34, h: 38, t: 'flat' }
        ];

        c.fillStyle = '#7a9eb0';
        blds.forEach(b => {
            const bx = this.wrap(b.x - offset, VW + 60, -60);
            c.fillRect(bx, gy - b.h, b.w, b.h);

            if (b.t === 'spire') {
                for (let i = 0; i < 16; i++) {
                    const sw = Math.max(1, Math.floor(b.w * (1 - i / 16)));
                    c.fillRect(bx + Math.floor((b.w - sw) / 2), gy - b.h - i, sw, 1);
                }
            } else if (b.t === 'dome') {
                const cx = bx + Math.floor(b.w / 2);
                const cr = Math.floor(b.w / 2);
                this.drawCircle(c, cx, gy - b.h, cr);
                c.fillRect(cx - 1, gy - b.h - cr - 4, 3, 5);
            }
        });
    }

    drawDetailedCityTree(c, x, gy, idx) {
        // Planter box
        c.fillStyle = '#5c4838';
        c.fillRect(x + 2, gy - 6, 12, 6);
        c.fillStyle = '#7c6450';
        c.fillRect(x + 3, gy - 5, 10, 4);

        // Textured trunk with branches
        c.fillStyle = '#4e3422';
        c.fillRect(x + 6, gy - 24, 4, 18);
        c.fillRect(x + 3, gy - 22, 4, 3);
        c.fillRect(x + 9, gy - 20, 4, 3);

        // Lush 3-tone rounded foliage
        const isAutumn = (idx % 2 === 1);
        const colDark = isAutumn ? '#993d14' : '#1d5e22';
        const colMid  = isAutumn ? '#d65b18' : '#2e8c35';
        const colHigh = isAutumn ? '#f49430' : '#52be5a';

        c.fillStyle = colDark;
        this.drawCircle(c, x + 8, gy - 28, 12);
        c.fillStyle = colMid;
        this.drawCircle(c, x + 7, gy - 30, 10);
        c.fillStyle = colHigh;
        this.drawCircle(c, x + 5, gy - 32, 6);

        // Drifting leaves
        const lt = (this.animTime * 0.002 + idx) % 1;
        c.fillStyle = colMid;
        c.fillRect(x + 12 + Math.sin(lt * 6) * 4, gy - 20 + lt * 18, 2, 1);
    }

    drawDetailedLamppost(c, x, gy) {
        // Cast-iron base
        c.fillStyle = '#22262c';
        c.fillRect(x, gy - 4, 6, 4);
        c.fillRect(x + 2, gy - 36, 2, 32);

        // Curved scrollwork arms
        c.fillRect(x - 3, gy - 33, 8, 2);

        // Lantern head
        c.fillRect(x, gy - 40, 6, 4);
        c.fillRect(x + 1, gy - 42, 4, 2);

        // Glowing glass
        c.fillStyle = '#ffea78';
        c.fillRect(x + 1, gy - 39, 4, 3);
        c.fillStyle = '#ffffff';
        c.fillRect(x + 2, gy - 38, 2, 2);

        // Ambient radial light bloom
        c.fillStyle = 'rgba(255, 235, 120, 0.08)';
        for (let r = 14; r > 0; r -= 3) {
            c.fillRect(x + 3 - r, gy - 38 - r, r * 2, r * 2);
        }
    }

    drawCafeTable(c, x, gy) {
        // Wrought iron legs
        c.fillStyle = '#32363e';
        c.fillRect(x + 5, gy - 11, 2, 11);
        c.fillRect(x + 2, gy - 2, 8, 2);

        // Checkered Tablecloth
        c.fillStyle = '#d42626';
        c.fillRect(x + 1, gy - 14, 10, 3);
        c.fillStyle = '#f8f8f8';
        c.fillRect(x + 2, gy - 14, 2, 2);
        c.fillRect(x + 6, gy - 14, 2, 2);

        // Porcelain coffee cups with rising steam
        c.fillStyle = '#ffffff';
        c.fillRect(x + 3, gy - 16, 3, 2);
        c.fillRect(x + 7, gy - 16, 3, 2);

        const st = Math.sin(this.animTime * 0.005);
        if (st > 0) {
            c.fillStyle = 'rgba(255, 255, 255, 0.6)';
            c.fillRect(x + 4, gy - 18, 1, 2);
            c.fillRect(x + 8, gy - 19, 1, 2);
        }

        // Chairs
        c.fillStyle = '#444852';
        c.fillRect(x - 3, gy - 9, 3, 9);
        c.fillRect(x - 3, gy - 15, 1, 6);
        c.fillRect(x + 12, gy - 9, 3, 9);
        c.fillRect(x + 14, gy - 15, 1, 6);
    }

    drawBicycle(c, x, gy) {
        // Spoke wheels
        c.fillStyle = '#3a3a44';
        this.drawCircle(c, x + 3, gy - 5, 5);
        this.drawCircle(c, x + 17, gy - 5, 5);
        c.fillStyle = '#dbd6ce';
        c.fillRect(x + 3, gy - 5, 1, 1);
        c.fillRect(x + 17, gy - 5, 1, 1);

        // Teal metal frame
        c.fillStyle = '#189688';
        c.fillRect(x + 4, gy - 7, 7, 1);
        c.fillRect(x + 10, gy - 11, 1, 6);
        c.fillRect(x + 10, gy - 7, 7, 1);
        c.fillRect(x + 16, gy - 12, 1, 7);

        // Leather seat & handlebar
        c.fillStyle = '#5c361e';
        c.fillRect(x + 8, gy - 12, 4, 2);
        c.fillStyle = '#22262c';
        c.fillRect(x + 15, gy - 13, 4, 1);

        // Front wicker basket with pink roses!
        c.fillStyle = '#b8946c';
        c.fillRect(x + 17, gy - 12, 4, 4);
        c.fillStyle = '#ff4d80';
        c.fillRect(x + 17, gy - 13, 2, 2);
        c.fillRect(x + 19, gy - 14, 2, 2);
    }

    // ========================================================================
    // HIGH-DEFINITION GRAPHICS: VINTAGE CINEMA INTERIOR (WATCHING PREMAM)
    // ========================================================================

    drawCinemaInterior(c) {
        // 1. Dark Velvety Atmosphere
        this.gradient(c, 0, 0, VW, VH, '#08060c', '#0e0a16', '#140e1e', '#08060c');

        // 2. Art Deco Wall Sconces with warm golden light cones
        [15, 368].forEach(wx => {
            c.fillStyle = '#d4af37';
            c.fillRect(wx - 2, 45, 5, 6);
            c.fillStyle = '#fff4b8';
            c.fillRect(wx - 1, 46, 3, 4);
            // Light fans
            c.fillStyle = 'rgba(255, 220, 120, 0.05)';
            for (let i = 0; i < 18; i++) {
                c.fillRect(wx - i, 51 + i * 2, i * 2, 2);
            }
        });

        // 3. Grand Proscenium Arch & Crimson Velvet Drapes
        const sx = 44, sy = 12, sw = VW - 88, sh = 105;

        // Proscenium Gold Border
        c.fillStyle = '#8f6820';
        c.fillRect(sx - 8, sy - 6, sw + 16, sh + 12);
        c.fillStyle = '#e6b84a';
        c.fillRect(sx - 6, sy - 4, sw + 12, sh + 8);

        // Draped Crimson Curtains with Gold Tassels
        c.fillStyle = '#801424';
        c.fillRect(sx - 4, sy - 3, sw + 8, 8); // Top valance
        c.fillStyle = '#a61c32';
        c.fillRect(sx - 4, sy - 2, sw + 8, 3);
        // Hanging side curtains
        for (let i = 0; i < 10; i++) {
            c.fillStyle = (i % 2 === 0) ? '#8a1828' : '#aa2238';
            c.fillRect(sx - 4 + i, sy + 5, 2, sh - 4);
            c.fillRect(sx + sw + 2 - i, sy + 5, 2, sh - 4);
        }
        // Gold curtain tieback cords
        c.fillStyle = '#f0c444';
        c.fillRect(sx + 3, sy + 45, 4, 3);
        c.fillRect(sx + sw - 7, sy + 45, 4, 3);

        // 4. Volumetric Flickering Projector Beam from back of theater!
        const projFlicker = 0.035 + Math.sin(this.animTime * 0.015) * 0.012;
        c.fillStyle = `rgba(255, 245, 220, ${projFlicker})`;
        c.beginPath();
        c.moveTo(VW / 2, 0);
        c.lineTo(sx, sy);
        c.lineTo(sx + sw, sy);
        c.closePath();
        c.fill();
        c.beginPath();
        c.moveTo(VW / 2, 0);
        c.lineTo(sx + sw, sy + sh);
        c.lineTo(sx, sy + sh);
        c.closePath();
        c.fill();

        // Projector floating dust motes
        for (let m = 0; m < 12; m++) {
            const mx = sx + 20 + (m * 41 + this.animTime * 0.015) % (sw - 40);
            const my = sy + 10 + (m * 29 + Math.sin(this.animTime * 0.004 + m) * 15) % (sh - 20);
            c.fillStyle = 'rgba(255, 255, 255, 0.45)';
            c.fillRect(Math.floor(mx), Math.floor(my), 1, 1);
        }

        // 5. THE MOVIE SCREEN: PREMAM (Malayalam Romance)
        c.fillStyle = '#100c14';
        c.fillRect(sx, sy, sw, sh);

        // Screen Scene: Lush Kerala Munnar Tea Hills Landscape
        this.gradient(c, sx, sy, sw, Math.floor(sh * 0.52), '#256599', '#468ebb', '#96cbe8', '#fae8c6');

        // Rolling Emerald Green Tea Plantations
        this.gradient(c, sx, sy + Math.floor(sh * 0.52), sw, Math.floor(sh * 0.48), '#1c5e2a', '#28823c', '#38a44e');

        // Distant Misty Western Ghats Mountains
        c.fillStyle = '#5c8ca8';
        for (let x = sx; x < sx + sw; x += 2) {
            const my = sy + 30 + Math.sin((x - sx) * 0.04) * 8 + Math.cos((x - sx) * 0.09) * 4;
            c.fillRect(x, Math.floor(my), 2, sy + Math.floor(sh * 0.52) - Math.floor(my));
        }

        // Kerala Swaying Coconut Palms on Screen
        this.drawKeralaPalm(c, sx + 24, sy + Math.floor(sh * 0.65));
        this.drawKeralaPalm(c, sx + sw - 36, sy + Math.floor(sh * 0.68));

        // The Iconic Couple on Screen: Nivin Pauly (George) & Sai Pallavi (Malar)
        const gX = sx + Math.floor(sw / 2) - 20;
        const mX = sx + Math.floor(sw / 2) + 12;
        const charBaseY = sy + Math.floor(sh * 0.82);

        // Nivin Pauly (George) — Black Shirt, Mundu, Beard, Aviator Sunglasses!
        // Head & Thick Black Beard
        c.fillStyle = '#1c1410';
        c.fillRect(gX - 4, charBaseY - 26, 9, 8); // Hair
        c.fillStyle = '#e2aa76';
        c.fillRect(gX - 3, charBaseY - 22, 7, 7); // Face
        c.fillStyle = '#120e0a';
        c.fillRect(gX - 4, charBaseY - 18, 9, 5); // Iconic Thick Beard
        c.fillRect(gX - 2, charBaseY - 21, 5, 2); // Dark Aviator Sunglasses
        // Black Shirt
        c.fillStyle = '#18181c';
        c.fillRect(gX - 5, charBaseY - 13, 11, 10);
        // Kerala White Mundu with Gold Border (Kasavu)
        c.fillStyle = '#f8f6f0';
        c.fillRect(gX - 4, charBaseY - 3, 9, 12);
        c.fillStyle = '#d4af37';
        c.fillRect(gX - 4, charBaseY + 6, 9, 2); // Gold border

        // Sai Pallavi (Malar) — Curly Hair, Saree, Flowers, Sweet Smile
        // Long Natural Curly Hair with Jasmine Flowers
        c.fillStyle = '#18120c';
        c.fillRect(mX - 4, charBaseY - 26, 9, 9);
        c.fillRect(mX - 6, charBaseY - 22, 3, 14); // Flowing curls
        c.fillRect(mX + 4, charBaseY - 22, 3, 14);
        c.fillStyle = '#ffffff';
        c.fillRect(mX - 2, charBaseY - 27, 4, 2); // Jasmine blossoms (Mulla poo)
        // Face & Smile
        c.fillStyle = '#f2bc88';
        c.fillRect(mX - 3, charBaseY - 22, 7, 6);
        c.fillStyle = '#1a1008';
        c.fillRect(mX - 2, charBaseY - 20, 2, 1); // Eyes
        c.fillRect(mX + 2, charBaseY - 20, 2, 1);
        c.fillStyle = '#e85c70';
        c.fillRect(mX - 1, charBaseY - 18, 3, 1); // Red smile
        // Traditional Kasavu Saree (Navy Blue Blouse + Gold Saree)
        c.fillStyle = '#163866'; // Navy blouse
        c.fillRect(mX - 4, charBaseY - 14, 9, 7);
        c.fillStyle = '#fcf8ea'; // Saree drape
        c.fillRect(mX - 5, charBaseY - 7, 11, 16);
        c.fillStyle = '#d4af37'; // Saree gold pallu
        c.fillRect(mX - 3, charBaseY - 12, 4, 16);

        // Iconic Premam Butterflies fluttering across screen!
        const bt = this.animTime * 0.003;
        const b1x = sx + 30 + Math.sin(bt * 1.5) * 20;
        const b1y = sy + 35 + Math.cos(bt * 2) * 10;
        c.fillStyle = '#ff6b9d';
        c.fillRect(Math.floor(b1x), Math.floor(b1y), 3, 2);
        c.fillRect(Math.floor(b1x) + 1, Math.floor(b1y) - 1, 1, 4);

        const b2x = sx + sw - 45 + Math.cos(bt * 1.2) * 18;
        const b2y = sy + 45 + Math.sin(bt * 1.8) * 8;
        c.fillStyle = '#38d4f8';
        c.fillRect(Math.floor(b2x), Math.floor(b2y), 3, 2);

        // Movie Title Banner: PREMAM
        this.drawTinyText(c, 'P R E M A M', sx + Math.floor(sw / 2), sy + 14, '#ffffff', true);

        // Soft yellow Malayalam subtitle text at screen bottom
        this.drawTinyText(c, '"Malare ninne kaanathirunnal..."', sx + Math.floor(sw / 2), sy + sh - 8, '#ffea78', true);

        // 6. Tiered Luxury Red Velvet Cinema Seating
        const seatY = sy + sh + 14;
        for (let row = 0; row < 3; row++) {
            const ry = seatY + row * 18;
            const seatW = 16;
            const count = 18 + row * 2;
            const startX = Math.floor((VW - count * seatW) / 2);

            for (let s = 0; s < count; s++) {
                const kx = startX + s * seatW;
                // Seat Backrest
                c.fillStyle = (row === 1 && (s === Math.floor(count / 2) - 1 || s === Math.floor(count / 2))) ? '#9c1c28' : '#6a121c';
                c.fillRect(kx + 1, ry - 4, seatW - 2, 6);
                // Seat Cushion
                c.fillStyle = '#8a1824';
                c.fillRect(kx + 1, ry + 2, seatW - 2, 10);
                c.fillStyle = '#a82434';
                c.fillRect(kx + 2, ry + 3, seatW - 4, 3);
                // Armrests
                c.fillStyle = '#3a2016';
                c.fillRect(kx, ry + 1, 2, 9);
                c.fillRect(kx + seatW - 2, ry + 1, 2, 9);
            }
        }

        // 7. Eugene & Ammu Sitting in the VIP Center Row!
        const cRowY = seatY + 18;
        const cx = Math.floor(VW / 2);

        this.drawEugeneSitting(c, cx - 12, cRowY, 'cinema');
        this.drawAmmuSitting(c, cx + 4, cRowY, 'cinema');

        // Extra Butter Popcorn Bucket between them!
        const pkX = cx - 2;
        const pkY = cRowY + 1;
        c.fillStyle = '#f4eedc';
        c.fillRect(pkX, pkY, 6, 7);
        c.fillStyle = '#d42626';
        c.fillRect(pkX + 1, pkY, 1, 7);
        c.fillRect(pkX + 4, pkY, 1, 7);
        // Overflowing Golden Butter Popcorn
        c.fillStyle = '#ffe066';
        c.fillRect(pkX - 1, pkY - 2, 8, 3);
        c.fillRect(pkX + 1, pkY - 4, 2, 2);
        c.fillRect(pkX + 4, pkY - 3, 2, 2);

        // Holding Hands in the dark with sweet glowing hearts
        const ht = this.animTime * 0.004;
        if (Math.sin(ht) > 0.1) {
            this.drawPixelHeart(c, cx + 1, cRowY - 8 + Math.sin(ht * 2) * 2, '#ff4770', 1);
        }
    }

    // ========================================================================
    // HIGH-DEFINITION GRAPHICS: ARTISAN GELATO & COTTON CANDY PARLOUR
    // ========================================================================

    drawIceCreamShop(c) {
        const gy = Math.floor(VH * 0.68);

        // 1. Radiant Sunny Sky
        this.gradient(c, 0, 0, VW, Math.floor(VH * 0.58), '#3eaef4', '#76cbfa', '#b2e4fc', '#fce6c4', '#fff4de');

        // Clouds
        this.drawFluffyCloud(c, 90, 14, 46);
        this.drawFluffyCloud(c, 275, 20, 40);

        // 2. Tiled Promenade Ground
        c.fillStyle = '#ded6ce';
        c.fillRect(0, gy, VW, VH - gy);
        for (let x = 0; x < VW; x += 14) {
            c.fillStyle = '#c4bcb2';
            c.fillRect(x, gy, 1, VH - gy);
            c.fillStyle = '#f4ede6';
            c.fillRect(x + 1, gy, 13, 1);
        }

        // 3. The Boutique Sweet Parlour Building
        const sx = Math.floor(VW / 2) - 85;
        const sw = 170;
        const sh = 92;

        // Pastel Strawberry Cream Walls
        c.fillStyle = '#fce4ec';
        c.fillRect(sx, gy - sh, sw, sh);
        c.fillStyle = '#f8bbd0';
        c.fillRect(sx + sw - 6, gy - sh, 6, sh);

        // Ornate Corner Pilasters
        c.fillStyle = '#ffffff';
        c.fillRect(sx, gy - sh, 5, sh);
        c.fillRect(sx + sw - 5, gy - sh, 5, sh);

        // Striped Scalloped Awning (Pink & White Canvas) with 3D drop shadow
        c.fillStyle = 'rgba(0, 0, 0, 0.15)';
        c.fillRect(sx - 4, gy - sh + 15, sw + 8, 4);

        for (let ax = sx - 6; ax <= sx + sw + 4; ax += 12) {
            c.fillStyle = '#ff6090'; // Rose pink stripe
            c.fillRect(ax, gy - sh - 2, 6, 16);
            this.drawCircle(c, ax + 3, gy - sh + 14, 3);

            c.fillStyle = '#fff9f0'; // Cream white stripe
            c.fillRect(ax + 6, gy - sh - 2, 6, 16);
            this.drawCircle(c, ax + 9, gy - sh + 14, 3);
        }

        // Hanging fairy light festoon along the awning
        for (let lx = sx; lx <= sx + sw; lx += 14) {
            c.fillStyle = '#ffea78';
            this.drawCircle(c, lx, gy - sh + 18, 2);
            c.fillStyle = '#ffffff';
            c.fillRect(lx, gy - sh + 18, 1, 1);
        }

        // Boutique Carved Gold Sign
        const sgnW = 120, sgnH = 15;
        const sgnX = sx + Math.floor((sw - sgnW) / 2);
        const sgnY = gy - sh + 22;
        c.fillStyle = '#3a2024';
        c.fillRect(sgnX - 1, sgnY - 1, sgnW + 2, sgnH + 2);
        c.fillStyle = '#fff4e6';
        c.fillRect(sgnX, sgnY, sgnW, sgnH);
        c.fillStyle = '#e6b84a';
        c.fillRect(sgnX + 1, sgnY + 1, sgnW - 2, 1);
        c.fillRect(sgnX + 1, sgnY + sgnH - 2, sgnW - 2, 1);
        this.drawTinyText(c, 'SWEET RETREAT GELATO', sgnX + Math.floor(sgnW / 2), sgnY + 4, '#e03264', true);

        // Panoramic Curved Glass Display Case showcasing 6 Gourmet Gelato Troughs!
        const winX = sx + 10;
        const winY = gy - 44;
        const winW = 100;
        const winH = 32;

        c.fillStyle = '#382028';
        c.fillRect(winX - 1, winY - 1, winW + 2, winH + 2);
        c.fillStyle = '#b8eef8'; // Glass reflection
        c.fillRect(winX, winY, winW, winH);
        c.fillStyle = 'rgba(255, 255, 255, 0.4)';
        c.fillRect(winX + 2, winY + 2, winW - 4, 3);

        // 6 Gelato Troughs with toppings & metal spoons
        const gelatoFlavours = [
            { col: '#422416', top: '#28140a' }, // Dark Belgian Chocolate
            { col: '#ff709c', top: '#ff3068' }, // Strawberry Swirl
            { col: '#82c974', top: '#5aa84c' }, // Pistachio with crushed nuts
            { col: '#ffa438', top: '#e88418' }, // Alphonso Mango
            { col: '#fff8cc', top: '#e6c878' }, // Vanilla Bean
            { col: '#50c8b4', top: '#321810' }  // Mint Chocolate Chip
        ];

        gelatoFlavours.forEach((g, idx) => {
            const gx = winX + 6 + idx * 15;
            const gyPos = winY + 14;
            // Metal tub
            c.fillStyle = '#9aa4ac';
            c.fillRect(gx, gyPos, 12, 14);
            // Scooped mound
            c.fillStyle = g.col;
            this.drawCircle(c, gx + 6, gyPos + 4, 5);
            c.fillStyle = g.top;
            c.fillRect(gx + 4, gyPos + 2, 4, 2);
            // Metal serving spoon
            c.fillStyle = '#e4ecf0';
            c.fillRect(gx + 8, gyPos - 3, 2, 8);
        });

        // Stack of Crispy Waffle Cones in Glass Dispenser
        const cnX = winX + winW - 14;
        c.fillStyle = '#d89b48';
        for (let k = 0; k < 4; k++) {
            c.fillRect(cnX, winY + 6 + k * 4, 6, 3);
            c.fillRect(cnX + 1, winY + 9 + k * 4, 4, 1);
        }

        // Spinning Antique Cotton Candy Machine!
        const ccmX = sx + sw - 46;
        const ccmY = gy - 44;
        // Brass base & spinner
        c.fillStyle = '#e6b84a';
        c.fillRect(ccmX, ccmY + 18, 28, 14);
        c.fillStyle = '#f8d268';
        c.fillRect(ccmX + 2, ccmY + 20, 24, 4);
        // Clear Glass Bowl
        c.fillStyle = 'rgba(230, 245, 255, 0.4)';
        c.fillRect(ccmX + 2, ccmY + 2, 24, 16);
        // Swirling Pink & Sky Blue Spun Sugar Cloud inside!
        const cct = this.animTime * 0.005;
        c.fillStyle = '#ff88ba';
        this.drawCircle(c, ccmX + 14 + Math.sin(cct) * 3, ccmY + 10, 7);
        c.fillStyle = '#64d2ff';
        this.drawCircle(c, ccmX + 14 - Math.sin(cct) * 3, ccmY + 10, 5);
        c.fillStyle = '#ffffff';
        this.drawCircle(c, ccmX + 14, ccmY + 8, 3);

        // Entrance Door
        const dw = 16, dh = 24;
        const dx = sx + Math.floor(sw / 2) - 8;
        c.fillStyle = '#4a242c';
        c.fillRect(dx, gy - dh, dw, dh);
        c.fillStyle = '#fff4e4';
        c.fillRect(dx + 2, gy - dh + 2, dw - 4, 10);
        c.fillStyle = '#e6b84a';
        c.fillRect(dx + dw - 4, gy - 12, 2, 2);

        // Giant 3D Ice Cream Cone on the Roof!
        const roofCnX = sx + Math.floor(sw / 2);
        const roofCnY = gy - sh - 18;
        // Waffle Cone
        c.fillStyle = '#d49442';
        for (let i = 0; i < 14; i++) {
            const cw = Math.max(1, Math.floor(14 * (1 - i / 14)));
            c.fillRect(roofCnX - Math.floor(cw / 2), roofCnY + i, cw, 1);
        }
        // Triple Scoop Delight (Strawberry, Mint, Vanilla)
        c.fillStyle = '#50c8b4';
        this.drawCircle(c, roofCnX - 5, roofCnY - 2, 6);
        c.fillStyle = '#ff6090';
        this.drawCircle(c, roofCnX + 5, roofCnY - 2, 6);
        c.fillStyle = '#fff4cc';
        this.drawCircle(c, roofCnX, roofCnY - 8, 7);
        // Glossy Red Cherry on Top!
        c.fillStyle = '#d81838';
        this.drawCircle(c, roofCnX, roofCnY - 16, 3);
        c.fillStyle = '#489c38';
        c.fillRect(roofCnX, roofCnY - 20, 2, 4); // Stem

        // Outdoor Bistro Patio Table with flowers
        this.drawPatioTable(c, sx - 26, gy);
        this.drawPatioTable(c, sx + sw + 10, gy);
    }

    drawPatioTable(c, x, gy) {
        // Bistro table
        c.fillStyle = '#2e3238';
        c.fillRect(x + 7, gy - 10, 2, 10);
        c.fillRect(x + 4, gy - 2, 8, 2);
        // Marble top
        c.fillStyle = '#f0ece6';
        c.fillRect(x + 2, gy - 12, 12, 3);
        // Hydrangea planter
        c.fillStyle = '#a65432';
        c.fillRect(x + 5, gy - 17, 6, 5);
        c.fillStyle = '#ff6da4';
        this.drawCircle(c, x + 8, gy - 19, 4);
    }

    drawCharactersAtShop(c) {
        const gy = Math.floor(VH * 0.68);
        const cx = Math.floor(VW / 2);

        // Eugene holding Waffle Cone
        this.drawEugene(c, cx - 22, gy, 0, 'ice_cream');

        // Ammu holding huge fluffy Cotton Candy & tasting spoon
        this.drawAmmu(c, cx + 12, gy, 0, 'ice_cream');

        // Sparkles and Floating Hearts around them
        const t = this.animTime * 0.003;
        for (let i = 0; i < 3; i++) {
            const spX = cx - 18 + i * 22 + Math.sin(t * 2 + i * 2) * 8;
            const spY = gy - 36 - ((this.animTime * 0.02 + i * 15) % 24);
            this.drawPixelHeart(c, Math.floor(spX), Math.floor(spY), '#ff4d88', 1);
        }
    }

    // ========================================================================
    // HIGH-DEFINITION GRAPHICS: SUNSET BEACH & ROMANTIC BENCH
    // ========================================================================

    drawBeachDay(c, hasBench) {
        const o = this.bgOffset;
        const gy = Math.floor(VH * 0.70);

        // 1. Spectacular Kerala Sunset: 6-Stop Radiant Twilight Gradient
        this.gradient(c, 0, 0, VW, Math.floor(VH * 0.44), '#421248', '#8c1840', '#d84420', '#f07c24', '#f8b834', '#fae488');

        // 2. Sunset Clouds drifting
        c.fillStyle = 'rgba(180, 50, 90, 0.45)';
        this.drawFluffyCloud(c, this.wrap(85 - o * 0.08, VW + 70, -70), 10, 52);
        c.fillStyle = 'rgba(240, 120, 60, 0.4)';
        this.drawFluffyCloud(c, this.wrap(240 - o * 0.06, VW + 60, -60), 20, 42);

        // Seagulls flying across sunset
        for (let i = 0; i < 4; i++) {
            const bx = this.wrap(90 + i * 75 - o * 0.16, VW + 30, -30);
            const by = 20 + Math.sin(this.animTime * 0.0025 + i * 1.6) * 7;
            this.drawBird(c, bx, by);
        }

        // 3. Radiant Sinking Sun with 3 Concentric Golden Glow Rings
        const sunX = Math.floor(VW * 0.48);
        const sunY = Math.floor(VH * 0.35);
        c.fillStyle = 'rgba(255, 235, 140, 0.16)';
        this.drawCircle(c, sunX, sunY, 28);
        c.fillStyle = 'rgba(255, 240, 160, 0.28)';
        this.drawCircle(c, sunX, sunY, 20);
        c.fillStyle = '#fff4a0';
        this.drawCircle(c, sunX, sunY, 14);

        // 4. Ultramarine to Turquoise Deep Ocean
        const oy = Math.floor(VH * 0.42);
        this.gradient(c, 0, oy, VW, gy - oy, '#124888', '#1c68b0', '#2888c8', '#38a8e0');

        // Shimmering Golden Sun Reflection Path on the Water!
        for (let y = oy; y < gy; y += 2) {
            const progress = (y - oy) / (gy - oy);
            const rw = 8 + progress * 38 + Math.sin(y * 0.35 + this.animTime * 0.005) * 5;
            const alpha = 0.38 * (1 - progress * 0.45);
            c.fillStyle = (progress < 0.4) ? `rgba(255, 244, 160, ${alpha})` : `rgba(255, 180, 80, ${alpha})`;
            c.fillRect(Math.floor(sunX - rw / 2), y, Math.floor(rw), 1);
        }

        // 4 Rolling Animated Waves with White Foamy Crests & Spray
        for (let w = 0; w < 4; w++) {
            const wy = oy + 6 + w * 8;
            const waveSpeed = 0.024 + w * 0.008;
            for (let x = 0; x < VW; x += 2) {
                const woff = Math.sin((x + this.animTime * waveSpeed + w * 42) * 0.06) * 2;
                c.fillStyle = `rgba(180, 230, 255, ${0.36 - w * 0.05})`;
                c.fillRect(x, Math.floor(wy + woff), 2, 1);
                if (woff > 1.5) {
                    c.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    c.fillRect(x, Math.floor(wy + woff - 1), 2, 1);
                }
            }
        }

        // Sailboats bobbing gently in distance
        const bx = this.wrap(VW * 0.78 - o * 0.04, VW + 30, -30);
        const by = oy + 8 + Math.sin(this.animTime * 0.002) * 2;
        this.drawSailboat(c, bx, by);

        // 5. Seawall & Tetrapod Breakwater Stones with Crashing White Foam!
        const seawallY = gy - 12;
        for (let tx = Math.floor(-o * 0.6) % 18 - 18; tx < VW; tx += 18) {
            this.drawTetrapod(c, tx, seawallY + 4);
        }
        for (let sx = Math.floor(-o * 0.6) % 24 - 24; sx < VW; sx += 24) {
            if (Math.sin(this.animTime * 0.006 + sx) > 0.35) {
                c.fillStyle = 'rgba(255, 255, 255, 0.75)';
                c.fillRect(sx + 3, seawallY + 1, 3, 3);
                c.fillRect(sx + 2, seawallY, 5, 1);
            }
        }

        // Classical Granite Promenade Railing
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

        // 6. Queen's Necklace Curved Streetlights along the bay
        for (let lx = Math.floor(-o * 0.7) % 40 - 40; lx < VW; lx += 40) {
            this.drawMarineDriveLamp(c, lx, seawallY);
        }

        // 7. Tiled Promenade Walkway with Stone Pavers
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

        // 8. Majestic Swaying Coconut Palms
        const p1x = this.wrap(25 - o * 0.8, VW + 50, -50);
        const p2x = this.wrap(VW - 38 - o * 0.8, VW + 50, -50);
        this.drawKeralaPalm(c, p1x, gy);
        this.drawKeralaPalm(c, p2x, gy);
    }

    drawBenchScene(c) {
        const gy = Math.floor(VH * 0.70);
        const benchX = Math.floor(VW / 2) - 34;
        const benchY = gy - 3;
        const benchW = 68;

        // Elegant Handcrafted Weathered Wooden Bench
        // Cast-iron ornate bench legs & supports
        c.fillStyle = '#2c2e36';
        c.fillRect(benchX + 4, benchY - 14, 3, 14);
        c.fillRect(benchX + benchW - 7, benchY - 14, 3, 14);
        c.fillRect(benchX + Math.floor(benchW / 2) - 1, benchY - 14, 2, 14);
        c.fillRect(benchX + 2, benchY - 1, 7, 2);
        c.fillRect(benchX + benchW - 9, benchY - 1, 7, 2);

        // Wooden Slats: Backrest
        c.fillStyle = '#8b5a36';
        c.fillRect(benchX + 2, benchY - 22, benchW - 4, 3);
        c.fillRect(benchX + 2, benchY - 17, benchW - 4, 3);
        c.fillRect(benchX + 2, benchY - 12, benchW - 4, 3);
        c.fillStyle = '#b0784a';
        c.fillRect(benchX + 3, benchY - 22, benchW - 6, 1);
        c.fillRect(benchX + 3, benchY - 17, benchW - 6, 1);

        // Wooden Slats: Seat
        c.fillStyle = '#a06a40';
        c.fillRect(benchX, benchY - 6, benchW, 4);
        c.fillStyle = '#b88252';
        c.fillRect(benchX + 1, benchY - 6, benchW - 2, 1);

        // Cast-Iron Armrests
        c.fillStyle = '#2c2e36';
        c.fillRect(benchX, benchY - 12, 3, 8);
        c.fillRect(benchX + benchW - 3, benchY - 12, 3, 8);

        // Eugene & Ammu Seated Together on the Bench!
        this.drawEugeneSitting(c, benchX + 14, benchY - 4, 'bench');
        this.drawAmmuSitting(c, benchX + 36, benchY - 4, 'bench');

        // Eugene holding Ammu's hand tenderly
        c.fillStyle = '#4870a8';
        c.fillRect(benchX + 26, benchY - 11, 6, 2);
        c.fillStyle = '#f8d0a0';
        c.fillRect(benchX + 32, benchY - 11, 4, 2); // Clasping hands!

        // Radiant Romantic Hearts Floating up into the Sunset
        const t = this.animTime * 0.003;
        for (let h = 0; h < 4; h++) {
            const hProgress = (t * 14 + h * 25) % 55;
            const hx = benchX + 33 + Math.sin(t * 2 + h * 1.6) * 14;
            const hy = benchY - 24 - hProgress * 0.55;
            const ha = Math.max(0, 1 - hProgress / 55);
            this.drawPixelHeart(c, Math.floor(hx), Math.floor(hy), `rgba(255, 75, 120, ${ha})`, 1);
        }
    }

    // ========================================================================
    // HIGH-DEFINITION GRAPHICS: DAY-TO-NIGHT TWILIGHT TRANSITION
    // ========================================================================

    drawNightTransition(c) {
        const t = Math.min(1, this.stateTime / 3500);
        const gy = Math.floor(VH * 0.70);

        // Sky transition: Sunset Orange/Pink -> Celestial Deep Indigo/Navy
        const r1 = Math.floor(66 * (1 - t) + 4 * t);
        const g1 = Math.floor(18 * (1 - t) + 6 * t);
        const b1 = Math.floor(72 * (1 - t) + 26 * t);

        const r2 = Math.floor(216 * (1 - t) + 12 * t);
        const g2 = Math.floor(68 * (1 - t) + 16 * t);
        const b2 = Math.floor(32 * (1 - t) + 54 * t);

        this.gradient(c, 0, 0, VW, Math.floor(VH * 0.44), `rgb(${r1},${g1},${b1})`, `rgb(${r2},${g2},${b2})`, '#060a1c');

        // Stars Fade in
        if (t > 0.25) {
            const sAlpha = (t - 0.25) / 0.75;
            for (let i = 0; i < 50; i++) {
                const sx = (i * 77 + 13) % VW;
                const sy = (i * 39 + 7) % Math.floor(VH * 0.4);
                const tw = Math.sin(this.animTime * 0.003 + i) * 0.3 + 0.7;
                c.fillStyle = `rgba(255, 255, 255, ${sAlpha * tw * 0.75})`;
                c.fillRect(sx, sy, (i % 5 === 0) ? 2 : 1, (i % 5 === 0) ? 2 : 1);
            }
        }

        // Luminous Crescent Moon Fades In
        if (t > 0.45) {
            const mAlpha = (t - 0.45) / 0.55;
            const mx = Math.floor(VW * 0.82), my = 28;
            c.fillStyle = `rgba(255, 248, 200, ${mAlpha * 0.15})`;
            this.drawCircle(c, mx, my, 16);
            c.fillStyle = `rgb(255, 248, 210)`;
            this.drawCircle(c, mx, my, 8);
            c.fillStyle = `rgb(${r1},${g1},${b1})`;
            this.drawCircle(c, mx + 3, my - 1, 7);
        }

        // Ocean Darkening
        const oy = Math.floor(VH * 0.42);
        this.gradient(c, 0, oy, VW, gy - oy, '#081832', '#0c2448', '#103058');

        // Promenade
        c.fillStyle = '#1c1c28';
        c.fillRect(0, gy, VW, VH - gy);

        // Atmospheric Text
        if (t > 0.35 && t < 0.9) {
            const txtA = Math.sin((t - 0.35) * Math.PI / 0.55);
            this.drawTinyText(c, 'AS TWILIGHT WHISPERS...', VW / 2, Math.floor(VH * 0.32), `rgba(255, 255, 255, ${txtA * 0.9})`, true);
        }
    }

    // ========================================================================
    // HIGH-DEFINITION GRAPHICS: TANGLED BOAT & CASTLE LANTERN SCENE
    // ========================================================================

    drawTangledScene(c) {
        // 1. Deep Celestial Midnight Sky with Nebulae
        this.gradient(c, 0, 0, VW, Math.floor(VH * 0.45), '#03030c', '#080a22', '#10143a', '#0b1638');

        // Over 90 Twinkling Multicolored Stars & Constellations
        const starCols = ['#ffffff', '#b8e4ff', '#fff0b4', '#e4d2ff', '#a4d8ff'];
        for (let i = 0; i < 85; i++) {
            const sx = (i * 73 + 17) % VW;
            const sy = (i * 37 + 9) % Math.floor(VH * 0.42);
            const tw = Math.sin(this.animTime * 0.003 + i * 0.9);
            if (tw > -0.2) {
                c.fillStyle = starCols[i % starCols.length];
                if (i % 8 === 0 && tw > 0.4) {
                    // Sparkling 4-point cross star!
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

        // Periodic Shooting Star / Meteor Streak!
        this.drawShootingStar(c);

        // 2. Luminous Radiant Crescent Moon
        const mx = Math.floor(VW * 0.84);
        const my = 26;
        c.fillStyle = 'rgba(240, 230, 255, 0.08)';
        this.drawCircle(c, mx, my, 20);
        c.fillStyle = 'rgba(255, 245, 200, 0.18)';
        this.drawCircle(c, mx, my, 13);
        c.fillStyle = '#fff9e0';
        this.drawCircle(c, mx, my, 9);
        c.fillStyle = '#080a22';
        this.drawCircle(c, mx + 3, my - 1, 8); // Crescent cutout

        // 3. Majestic Fairy-Tale Castle Silhouette on the Sea Cliffs (Corona Castle!)
        this.drawTangledCastle(c, VW - 110, Math.floor(VH * 0.28));

        // 4. Dark Crystalline Ocean with Silvery Moonlit Reflection
        const oy = Math.floor(VH * 0.44);
        this.gradient(c, 0, oy, VW, VH - oy, '#060e20', '#0a1834', '#0d2244', '#08142c');

        // Moon reflection path down the rippling water
        for (let y = oy; y < VH; y += 2) {
            const progress = (y - oy) / (VH - oy);
            const rw = 6 + progress * 24 + Math.sin(y * 0.3 + this.animTime * 0.003) * 4;
            const alpha = 0.22 * (1 - progress * 0.6);
            c.fillStyle = `rgba(255, 248, 220, ${alpha})`;
            c.fillRect(Math.floor(mx - rw / 2), y, Math.floor(rw), 1);
        }

        // Rolling Gentle Night Swells
        for (let w = 0; w < 4; w++) {
            const wy = oy + 6 + w * 14;
            c.fillStyle = `rgba(120, 180, 240, ${0.12 - w * 0.02})`;
            for (let x = 0; x < VW; x += 2) {
                const woff = Math.sin((x + this.animTime * 0.015 + w * 40) * 0.05) * 1.5;
                c.fillRect(x, Math.floor(wy + woff), 2, 1);
            }
        }

        // 5. Water Reflections for ALL Floating Sky Lanterns!
        this.lanterns.forEach(l => {
            if (l.y < VH * 0.45 && l.y > 0) {
                const ry = oy + (oy - l.y) * 0.4;
                if (ry < VH) {
                    const glowAlpha = l.glow * 0.12 * (0.7 + Math.sin(this.animTime * 0.003 + l.phase) * 0.3);
                    c.fillStyle = `rgba(255, 180, 50, ${glowAlpha})`;
                    const rw = Math.floor(l.size * 1.4);
                    c.fillRect(Math.floor(l.x - rw / 2) + Math.sin(this.animTime * 0.004 + l.phase) * 2, Math.floor(ry), rw, 2);
                }
            }
        });

        // 6. 48+ Floating Tangled Sky Lanterns Drifting to the Sky!
        this.lanterns.forEach(l => {
            if (l.y < VH + 15 && l.y > -25) {
                this.drawSingleTangledLantern(c, l.x, l.y, l.size, l.glow, l.phase);
            }
        });

        // 7. Handcrafted Wooden Rowboat & Eugene & Ammu!
        const boatX = Math.floor(VW / 2) - 40;
        const boatBaseY = Math.floor(VH * 0.58);
        const boatRock = Math.sin(this.animTime * 0.002) * 2.5;

        this.drawWoodenRowboat(c, boatX, boatBaseY + boatRock);

        // Eugene & Ammu seated in the boat looking at each other & lanterns!
        this.drawEugeneSitting(c, boatX + 16, boatBaseY - 2 + boatRock, 'boat');
        this.drawAmmuSitting(c, boatX + 46, boatBaseY - 2 + boatRock, 'boat');

        // Warm Golden Lantern sitting inside the boat between them!
        const ltx = boatX + 32;
        const lty = boatBaseY + 2 + boatRock;
        c.fillStyle = '#6a4422';
        c.fillRect(ltx - 2, lty - 6, 5, 6);
        c.fillStyle = '#ffea78';
        c.fillRect(ltx - 1, lty - 5, 3, 4);
        c.fillStyle = '#ffffff';
        c.fillRect(ltx, lty - 4, 1, 2);
        // Soft radial firelight aura bathing their faces
        for (let r = 16; r >= 2; r -= 2) {
            const a = 0.025 * (1 - r / 16);
            c.fillStyle = `rgba(255, 215, 110, ${a})`;
            this.drawCircle(c, ltx, lty - 3, r);
        }

        // Concentric Water Ripples from Boat
        const ripAlpha = 0.2 + Math.sin(this.animTime * 0.003) * 0.1;
        c.fillStyle = `rgba(160, 210, 255, ${ripAlpha})`;
        c.fillRect(boatX - 8, boatBaseY + 8 + boatRock, 82, 1);
        c.fillRect(boatX - 14, boatBaseY + 11 + boatRock, 94, 1);

        // Dancing Magical Golden Fireflies
        for (let f = 0; f < 6; f++) {
            const fx = (f * 65 + Math.sin(this.animTime * 0.0025 + f) * 25 + this.animTime * 0.012) % (VW + 10) - 5;
            const fy = boatBaseY - 15 + Math.cos(this.animTime * 0.0035 + f * 2) * 18;
            const fa = Math.sin(this.animTime * 0.006 + f) * 0.45 + 0.55;
            c.fillStyle = `rgba(255, 235, 120, ${fa})`;
            c.fillRect(Math.floor(fx), Math.floor(fy), 2, 2);
        }

        // Finale banner: Our adventure continues!
        if (this.adventureComplete) {
            const bAlpha = Math.min(1, (this.animTime - this.completeTime) * 0.001);
            c.fillStyle = `rgba(8, 8, 20, ${bAlpha * 0.7})`;
            c.fillRect(Math.floor(VW / 2) - 100, 10, 200, 16);
            c.fillStyle = `rgba(255, 220, 100, ${bAlpha})`;
            c.fillRect(Math.floor(VW / 2) - 100, 10, 200, 1);
            c.fillRect(Math.floor(VW / 2) - 100, 25, 200, 1);
            this.drawTinyText(c, '★ OUR ADVENTURE CONTINUES ★', VW / 2, 14, `rgba(255, 240, 160, ${bAlpha})`, true);
        }
    }

    drawTangledCastle(c, x, y) {
        // High Sea Cliff Base
        c.fillStyle = '#080c1e';
        c.fillRect(x - 20, y + 25, 120, 25);
        for (let i = 0; i < 20; i++) {
            c.fillRect(x - 20 + i * 6, y + 20 + (i % 3) * 3, 8, 20);
        }

        // Castle Keep Silhouette
        c.fillStyle = '#12162e';
        c.fillRect(x + 10, y, 40, 35);
        c.fillRect(x - 10, y + 10, 25, 25);
        c.fillRect(x + 45, y + 8, 30, 27);

        // Soaring Towers with Spires
        const towers = [
            { tx: x - 8, ty: y - 18, tw: 8, th: 38 },
            { tx: x + 16, ty: y - 28, tw: 12, th: 46 }, // Central Great Spire
            { tx: x + 38, ty: y - 22, tw: 9, th: 40 },
            { tx: x + 62, ty: y - 12, tw: 8, th: 32 }
        ];

        towers.forEach(tw => {
            c.fillStyle = '#12162e';
            c.fillRect(tw.tx, tw.ty, tw.tw, tw.th);
            // Pointed Spire Roof
            for (let i = 0; i < 14; i++) {
                const lw = Math.max(1, Math.floor(tw.tw * (1 - i / 14)));
                c.fillRect(tw.tx + Math.floor((tw.tw - lw) / 2), tw.ty - i, lw, 1);
            }
            // Fluttering Royal Pennant Flag atop spire!
            c.fillStyle = '#8f6820';
            c.fillRect(tw.tx + Math.floor(tw.tw / 2), tw.ty - 16, 1, 4);
            c.fillStyle = '#d4af37';
            c.fillRect(tw.tx + Math.floor(tw.tw / 2) + 1, tw.ty - 16, 4, 2);
        });

        // Glowing Golden Castle Windows (Candlelight)
        c.fillStyle = '#ffa438';
        [
            [x + 18, y - 8], [x + 24, y - 8], [x + 20, y + 4],
            [x - 6, y - 4], [x + 40, y - 6], [x + 52, y + 14]
        ].forEach(([wx, wy]) => {
            c.fillRect(wx, wy, 2, 3);
            c.fillStyle = '#fff4a0';
            c.fillRect(wx, wy + 1, 1, 1);
            c.fillStyle = '#ffa438';
        });
    }

    drawWoodenRowboat(c, x, y) {
        // Curved Wooden Hull with Rich Planking
        c.fillStyle = '#422412';
        c.fillRect(x - 6, y + 4, 76, 8);
        c.fillRect(x - 2, y, 68, 6);
        c.fillStyle = '#6a3c1e';
        c.fillRect(x, y + 1, 64, 4);

        // Cedar Planks Lines
        c.fillStyle = '#321808';
        for (let p = 0; p < 6; p++) {
            c.fillRect(x + 6 + p * 10, y + 1, 1, 9);
        }

        // Pointed Bow & Stern
        c.fillStyle = '#522c14';
        c.fillRect(x - 8, y + 2, 4, 4);
        c.fillRect(x + 68, y + 2, 6, 4);
        c.fillRect(x + 72, y + 3, 3, 2);

        // Wooden Oars resting in brass oarlocks
        c.fillStyle = '#8f6820';
        c.fillRect(x + 26, y + 2, 2, 2); // Brass oarlock
        c.fillStyle = '#8c5832';
        // Left oar dipping into water
        c.fillRect(x + 18, y + 3, 10, 1);
        c.fillRect(x + 12, y + 4, 7, 2);
        // Right oar
        c.fillRect(x + 36, y + 3, 10, 1);
        c.fillRect(x + 45, y + 4, 7, 2);
    }

    drawSingleTangledLantern(c, x, y, size, glow, phase) {
        const lx = Math.floor(x);
        const ly = Math.floor(y);
        const ls = Math.floor(size);

        // Soft Multi-Ring Golden Light Aura (decaying alpha, no hard edges)
        const pulse = 0.8 + Math.sin(this.animTime * 0.004 + phase) * 0.2;
        const maxR = Math.floor(ls * 2.2);
        for (let r = maxR; r >= 2; r -= 2) {
            const a = (glow * 0.035 * pulse) * (1 - r / maxR);
            c.fillStyle = `rgba(255, 195, 75, ${a})`;
            this.drawCircle(c, lx, ly, r);
        }

        // Outer Warm Amber Paper Cylinder
        c.fillStyle = `rgba(255, 170, 50, ${glow})`;
        c.fillRect(lx - Math.floor(ls / 2), ly - ls, ls, Math.floor(ls * 1.3));

        // Tangled Royal Sun Symbol / Filigree Detail
        c.fillStyle = `rgba(255, 230, 130, ${glow * 0.9})`;
        c.fillRect(lx - Math.floor(ls / 4), ly - Math.floor(ls * 0.7), Math.floor(ls / 2), Math.floor(ls * 0.7));

        // Intense White-Hot Candle Core inside
        c.fillStyle = `rgba(255, 255, 230, ${glow})`;
        c.fillRect(lx - 1, ly - Math.floor(ls * 0.5), 2, 3);

        // Top & Bottom Wire Rims
        c.fillStyle = `rgba(180, 110, 30, ${glow * 0.8})`;
        c.fillRect(lx - Math.floor(ls / 2), ly - ls - 1, ls, 1);
        c.fillRect(lx - Math.floor(ls / 2), ly + Math.floor(ls * 0.3), ls, 1);
    }

    drawNightSky(c) {
        this.gradient(c, 0, 0, VW, VH, '#040410', '#0a0c24', '#12163c', '#080816');

        for (let i = 0; i < 90; i++) {
            const sx = (i * 73 + 11) % VW;
            const sy = (i * 31 + 7) % VH;
            const tw = Math.sin(this.animTime * 0.003 + i) * 0.35 + 0.65;
            c.fillStyle = `rgba(255,255,255,${tw * 0.7})`;
            c.fillRect(sx, sy, (i % 4 === 0) ? 2 : 1, (i % 4 === 0) ? 2 : 1);
        }

        // Floating glowing hearts
        for (let i = 0; i < 6; i++) {
            const hx = VW * 0.15 + i * VW * 0.14;
            const hy = VH * 0.35 + Math.sin(this.animTime * 0.002 + i * 1.4) * 22;
            const alpha = 0.35 + Math.sin(this.animTime * 0.003 + i) * 0.25;
            this.drawPixelHeart(c, Math.floor(hx), Math.floor(hy), `rgba(255,100,160,${alpha})`, 1);
        }
    }

    // ========================================================================
    // HIGH-DEFINITION CHARACTER RENDERING: EUGENE & AMMU (RAPUNZEL)
    // ========================================================================

    drawCharacters(c, pose) {
        const gy = Math.floor(VH * 0.68) - 1;
        const cx = Math.floor(VW / 2);
        const f = this.walking ? this.walkFrame : 0;

        this.drawEugene(c, cx - 18, gy, f, pose);
        this.drawAmmu(c, cx + 6, gy, f, pose);
    }

    drawEugene(c, x, y, f, pose) {
        // High-Fidelity Eugene (Flynn Rider) Pixel Sprite
        // Height ~20px, crisp proportions matching retro classics

        // Hair: Chestnut brown layered with highlights
        c.fillStyle = '#3a2218';
        c.fillRect(x + 2, y - 18, 8, 1);
        c.fillRect(x + 1, y - 17, 10, 2);
        c.fillRect(x + 1, y - 15, 10, 2);
        c.fillStyle = '#543626'; // Hair highlight
        c.fillRect(x + 3, y - 17, 5, 1);

        // Face: Warm Peach Skin
        c.fillStyle = '#f8d0a0';
        c.fillRect(x + 2, y - 13, 8, 5);

        // Sideburns
        c.fillStyle = '#3a2218';
        c.fillRect(x + 1, y - 13, 1, 3);
        c.fillRect(x + 10, y - 13, 1, 3);
        c.fillRect(x + 2, y - 13, 3, 1); // Fringe

        // Expressive Eyes with White Catchlight
        c.fillStyle = '#1a1428';
        c.fillRect(x + 4, y - 12, 1, 2);
        c.fillRect(x + 7, y - 12, 1, 2);
        c.fillStyle = '#ffffff';
        c.fillRect(x + 4, y - 12, 1, 1);
        c.fillRect(x + 7, y - 12, 1, 1);

        // Cheerful Smile & Soft Cheek Blush
        c.fillStyle = 'rgba(255,160,140,0.45)';
        c.fillRect(x + 3, y - 10, 1, 1);
        c.fillRect(x + 8, y - 10, 1, 1);
        c.fillStyle = '#c06848';
        c.fillRect(x + 5, y - 9, 2, 1);

        // Royal Blue Adventurer's Vest over Cream Shirt
        c.fillStyle = '#f6f2ec'; // Cream shirt collar
        c.fillRect(x + 4, y - 8, 4, 2);

        c.fillStyle = '#4870a8'; // Blue vest
        c.fillRect(x + 3, y - 7, 6, 1);
        c.fillRect(x + 2, y - 6, 8, 3);
        c.fillStyle = '#385888'; // Shadow trim
        c.fillRect(x + 2, y - 3, 8, 1);

        // Brown Leather Belt with Brass Buckle
        c.fillStyle = '#4e2f18';
        c.fillRect(x + 2, y - 2, 8, 2);
        c.fillStyle = '#ffd152';
        c.fillRect(x + 5, y - 2, 2, 2); // Buckle

        // Arms & Hands
        c.fillStyle = '#f8d0a0';
        if (pose === 'ice_cream') {
            // Holding Waffle Cone in hand!
            c.fillRect(x + 1, y - 6, 1, 3);
            c.fillStyle = '#4870a8';
            c.fillRect(x + 9, y - 6, 3, 2);
            c.fillStyle = '#f8d0a0';
            c.fillRect(x + 12, y - 6, 2, 2); // Hand
            // Waffle Cone with Chocolate & Vanilla Scoops + Cherry!
            c.fillStyle = '#d49442';
            c.fillRect(x + 14, y - 5, 3, 4);
            c.fillRect(x + 15, y - 1, 1, 2);
            c.fillStyle = '#422416'; // Chocolate scoop
            this.drawCircle(c, x + 15, y - 7, 2);
            c.fillStyle = '#fff4cc'; // Vanilla scoop
            this.drawCircle(c, x + 15, y - 10, 2);
            c.fillStyle = '#d81838'; // Red cherry!
            c.fillRect(x + 15, y - 13, 2, 2);
        } else {
            const aOff = (f === 1) ? -1 : (f === 3) ? 1 : 0;
            c.fillRect(x + 1, y - 6 + aOff, 1, 3);
            c.fillRect(x + 10, y - 6 - aOff, 1, 3);
        }

        // Trousers
        c.fillStyle = '#303038';
        c.fillRect(x + 3, y, 6, 2);
        if (f === 1) {
            c.fillRect(x + 3, y + 2, 2, 2);
            c.fillRect(x + 7, y + 2, 2, 2);
        } else if (f === 3) {
            c.fillRect(x + 4, y + 2, 2, 2);
            c.fillRect(x + 6, y + 2, 2, 2);
        } else {
            c.fillRect(x + 3, y + 2, 2, 2);
            c.fillRect(x + 7, y + 2, 2, 2);
        }

        // Two-Tone Leather Boots
        c.fillStyle = '#5c3c28';
        if (f === 1) {
            c.fillRect(x + 2, y + 4, 3, 1);
            c.fillRect(x + 7, y + 4, 3, 1);
        } else if (f === 3) {
            c.fillRect(x + 3, y + 4, 3, 1);
            c.fillRect(x + 6, y + 4, 3, 1);
        } else {
            c.fillRect(x + 2, y + 4, 3, 1);
            c.fillRect(x + 7, y + 4, 3, 1);
        }
    }

    drawAmmu(c, x, y, f, pose) {
        // High-Fidelity Ammu (Rapunzel) Pixel Sprite
        // Gorgeous flowing dark hair, crimson floral hairclip, layered coral dress

        // Long Flowing Dark Hair with Waves down both shoulders
        c.fillStyle = '#22140e';
        c.fillRect(x + 2, y - 18, 8, 1);
        c.fillRect(x + 1, y - 17, 10, 1);
        c.fillRect(x + 0, y - 16, 12, 2);
        // Flowing long locks
        c.fillRect(x - 1, y - 14, 2, 11);
        c.fillRect(x + 11, y - 14, 2, 11);
        c.fillStyle = '#362016'; // Hair wave highlights
        c.fillRect(x + 3, y - 17, 4, 1);
        c.fillRect(x - 1, y - 10, 1, 5);
        c.fillRect(x + 12, y - 10, 1, 5);

        // Floral Hair Ribbon / Rose Clip
        if (pose === 'night' || this.state === 'TANGLED_BOAT') {
            c.fillStyle = '#ffffff'; // Delicate Jasmine Blossom in hair!
            c.fillRect(x + 9, y - 17, 3, 2);
            c.fillStyle = '#ffd152';
            c.fillRect(x + 10, y - 16, 1, 1);
        } else {
            c.fillStyle = '#f01848'; // Bright crimson flower/ribbon!
            c.fillRect(x + 9, y - 17, 3, 2);
            c.fillStyle = '#ff6b9d';
            c.fillRect(x + 10, y - 16, 1, 1);
        }

        // Delicate Face with Warm Fair Tone
        c.fillStyle = '#f8d0a0';
        c.fillRect(x + 2, y - 14, 8, 5);

        // Big Anime-Pixel Eyes with Double Catchlights
        c.fillStyle = '#1a1428';
        c.fillRect(x + 3, y - 13, 2, 2);
        c.fillRect(x + 7, y - 13, 2, 2);
        c.fillStyle = '#ffffff';
        c.fillRect(x + 3, y - 13, 1, 1);
        c.fillRect(x + 7, y - 13, 1, 1);
        // Eyelashes & Brow
        c.fillStyle = '#1a1428';
        c.fillRect(x + 3, y - 14, 2, 1);
        c.fillRect(x + 7, y - 14, 2, 1);

        // Rosy Blushing Cheeks & Sweet Smile
        c.fillStyle = 'rgba(255, 120, 150, 0.55)';
        c.fillRect(x + 2, y - 11, 2, 1);
        c.fillRect(x + 8, y - 11, 2, 1);
        c.fillStyle = '#e83868';
        c.fillRect(x + 5, y - 10, 2, 1); // Pink smile

        // Coral & Rose Princess Dress with Sweetheart Neckline
        c.fillStyle = '#ff6090'; // Rose bodice
        c.fillRect(x + 3, y - 8, 6, 2);
        c.fillRect(x + 2, y - 6, 8, 3);
        c.fillStyle = '#f8d0a0'; // Neckline
        c.fillRect(x + 4, y - 8, 4, 1);

        // Skirt with Ruffle Pleats
        c.fillStyle = '#e04878';
        c.fillRect(x + 1, y - 3, 10, 3);
        c.fillRect(x + 0, y, 12, 2);
        c.fillStyle = '#ff88b0'; // Ruffle trim
        c.fillRect(x + 0, y + 1, 12, 1);

        // Arms & Accessories
        c.fillStyle = '#f8d0a0';
        if (pose === 'ice_cream') {
            // Holding Huge Fluffy Pink Cotton Candy Stick!
            c.fillRect(x + 1, y - 6, 1, 3);
            c.fillStyle = '#ff6090';
            c.fillRect(x + 10, y - 6, 3, 2);
            c.fillStyle = '#f8d0a0';
            c.fillRect(x + 13, y - 6, 2, 2); // Hand
            // White Paper Cone Stick
            c.fillStyle = '#ffffff';
            c.fillRect(x + 14, y - 3, 1, 8);
            // Fluffy Glowing Pink Spun Sugar Cloud!
            c.fillStyle = '#ff8ab8';
            this.drawCircle(c, x + 15, y - 8, 5);
            c.fillStyle = '#ffa4cc';
            this.drawCircle(c, x + 14, y - 9, 3);
            c.fillStyle = '#ffffff';
            c.fillRect(x + 13, y - 10, 2, 2);
        } else {
            const aOff = (f === 1) ? 1 : (f === 3) ? -1 : 0;
            c.fillRect(x + 1, y - 6 + aOff, 1, 3);
            c.fillRect(x + 10, y - 6 - aOff, 1, 3);
        }

        // Dainty Ballet Shoes
        c.fillStyle = '#f8d0a0';
        if (f === 1) {
            c.fillRect(x + 3, y + 2, 2, 1);
            c.fillRect(x + 7, y + 2, 2, 1);
        } else if (f === 3) {
            c.fillRect(x + 4, y + 2, 2, 1);
            c.fillRect(x + 6, y + 2, 2, 1);
        } else {
            c.fillRect(x + 4, y + 2, 2, 1);
            c.fillRect(x + 7, y + 2, 2, 1);
        }
        c.fillStyle = '#e04878';
        c.fillRect(x + 3, y + 3, 3, 1);
        c.fillRect(x + 6, y + 3, 3, 1);
    }

    drawEugeneSitting(c, x, y, context) {
        // Eugene Seated (Cinema, Beach Bench, Tangled Boat)
        c.fillStyle = '#3a2218';
        c.fillRect(x + 2, y - 16, 8, 2);
        c.fillRect(x + 1, y - 15, 10, 2);
        c.fillStyle = '#543626';
        c.fillRect(x + 3, y - 15, 5, 1);

        // Face
        c.fillStyle = '#f8d0a0';
        c.fillRect(x + 2, y - 12, 8, 5);
        c.fillStyle = '#3a2218';
        c.fillRect(x + 1, y - 12, 1, 3);
        c.fillRect(x + 10, y - 12, 1, 3);

        // Eyes looking warmly toward Ammu
        c.fillStyle = '#1a1428';
        c.fillRect(x + 4, y - 11, 1, 2);
        c.fillRect(x + 7, y - 11, 1, 2);
        c.fillStyle = '#ffffff';
        c.fillRect(x + 5, y - 11, 1, 1);
        c.fillRect(x + 8, y - 11, 1, 1);

        // Smile
        c.fillStyle = '#c06848';
        c.fillRect(x + 5, y - 8, 2, 1);

        // Blue Shirt / Vest
        c.fillStyle = '#4870a8';
        c.fillRect(x + 2, y - 6, 8, 6);
        c.fillStyle = '#385888';
        c.fillRect(x + 2, y - 1, 8, 1);

        // Trousers (bent knees)
        c.fillStyle = '#303038';
        c.fillRect(x + 2, y, 8, 4);
    }

    drawAmmuSitting(c, x, y, context) {
        // Ammu Seated (Cinema, Beach Bench, Tangled Boat)
        // Hair flowing down
        c.fillStyle = '#22140e';
        c.fillRect(x + 2, y - 16, 8, 2);
        c.fillRect(x + 0, y - 15, 12, 2);
        c.fillRect(x - 1, y - 13, 2, 10);
        c.fillRect(x + 11, y - 13, 2, 10);

        // Flower clip
        c.fillStyle = (context === 'boat') ? '#ffffff' : '#f01848';
        c.fillRect(x + 9, y - 16, 3, 2);

        // Face looking tenderly at Eugene
        c.fillStyle = '#f8d0a0';
        c.fillRect(x + 2, y - 12, 8, 5);

        // Eyes
        c.fillStyle = '#1a1428';
        c.fillRect(x + 3, y - 11, 2, 2);
        c.fillRect(x + 7, y - 11, 2, 2);
        c.fillStyle = '#ffffff';
        c.fillRect(x + 3, y - 11, 1, 1);
        c.fillRect(x + 7, y - 11, 1, 1);

        // Blush
        c.fillStyle = 'rgba(255, 120, 150, 0.6)';
        c.fillRect(x + 2, y - 9, 2, 1);
        c.fillRect(x + 8, y - 9, 2, 1);
        c.fillStyle = '#e83868';
        c.fillRect(x + 5, y - 8, 2, 1);

        // Coral Dress folded over lap
        c.fillStyle = '#ff6090';
        c.fillRect(x + 2, y - 6, 8, 5);
        c.fillStyle = '#e04878';
        c.fillRect(x + 1, y - 1, 10, 4);
    }

    // ========================================================================
    // HELPER DRAWING PRIMITIVES & PARTICLES
    // ========================================================================

    drawFluffyCloud(c, x, y, w) {
        const h = Math.floor(w * 0.34);
        // Soft underside shadow
        c.fillStyle = 'rgba(220, 235, 255, 0.45)';
        c.fillRect(x, y + h - 2, w, 4);

        // Billowing white puffs
        c.fillStyle = 'rgba(255, 255, 255, 0.88)';
        c.fillRect(x, y, w, h);
        this.drawCircle(c, x + Math.floor(w * 0.28), y, Math.floor(h * 0.7));
        this.drawCircle(c, x + Math.floor(w * 0.58), y - 2, Math.floor(h * 0.85));
        this.drawCircle(c, x + Math.floor(w * 0.82), y + 1, Math.floor(h * 0.6));
    }

    drawBird(c, x, y) {
        const flap = Math.floor(this.animTime / 160) % 2;
        c.fillStyle = '#26384a';
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

        // Coconuts
        c.fillStyle = '#5c4024';
        this.drawCircle(c, topX - 2, topY + 2, 2);
        this.drawCircle(c, topX + 2, topY + 2, 2);

        // Swaying multi-tone fronds
        const sway = Math.sin(this.animTime * 0.003) * 2;
        const frondCols = ['#246c28', '#348a38', '#46a44a'];
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
        c.fillStyle = '#348a38';
        c.fillRect(topX - 3, topY - 4, 7, 3);
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

    drawTetrapod(c, x, y) {
        c.fillStyle = '#5a6068';
        c.fillRect(x + 2, y, 4, 8);
        c.fillRect(x - 2, y + 4, 12, 3);
        c.fillStyle = '#7a8088';
        c.fillRect(x + 2, y, 2, 6);
        c.fillRect(x - 2, y + 4, 5, 2);
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

    drawShootingStar(c) {
        const cycle = this.animTime % 6500;
        if (cycle < 1200) {
            const p = cycle / 1200;
            const startX = VW * 0.15;
            const startY = 12;
            const endX = VW * 0.72;
            const endY = 65;
            const curX = startX + (endX - startX) * p;
            const curY = startY + (endY - startY) * p;

            c.fillStyle = '#ffffff';
            c.fillRect(Math.floor(curX), Math.floor(curY), 2, 2);
            for (let t = 1; t <= 6; t++) {
                const tx = curX - (endX - startX) * 0.015 * t;
                const ty = curY - (endY - startY) * 0.015 * t;
                const alpha = (1 - t / 7) * (1 - p);
                c.fillStyle = `rgba(210, 240, 255, ${alpha})`;
                c.fillRect(Math.floor(tx), Math.floor(ty), 1, 1);
            }
        }
    }

    drawPixelHeart(c, x, y, col, scale = 1) {
        c.fillStyle = col;
        if (scale === 1) {
            c.fillRect(x - 2, y - 2, 2, 2);
            c.fillRect(x + 1, y - 2, 2, 2);
            c.fillRect(x - 3, y - 1, 7, 2);
            c.fillRect(x - 2, y + 1, 5, 1);
            c.fillRect(x - 1, y + 2, 3, 1);
            c.fillRect(x, y + 3, 1, 1);
        } else {
            c.fillRect(x - 1, y - 1, 1, 1);
            c.fillRect(x + 1, y - 1, 1, 1);
            c.fillRect(x - 1, y, 3, 1);
            c.fillRect(x, y + 1, 1, 1);
        }
    }

    drawWalkLabel(c, label) {
        const alpha = Math.min(1, (this.stateTime - 300) / 450);
        c.fillStyle = `rgba(10, 10, 24, ${alpha * 0.65})`;
        c.fillRect(Math.floor(VW / 2) - 80, 8, 160, 15);
        c.fillStyle = `rgba(255, 235, 120, ${alpha})`;
        c.fillRect(Math.floor(VW / 2) - 80, 8, 160, 1);
        c.fillRect(Math.floor(VW / 2) - 80, 22, 160, 1);
        this.drawTinyText(c, label, VW / 2, 12, `rgba(255, 255, 255, ${alpha})`, true);
    }

    drawTinyText(c, text, cx, y, color, centered) {
        c.fillStyle = color;
        const chars = text.split('');
        const charW = 4;
        const totalW = chars.length * charW;
        let startX = centered ? Math.floor(cx - totalW / 2) : cx;

        chars.forEach((ch, i) => {
            const px = startX + i * charW;
            const patterns = this.getCharPattern(ch);
            patterns.forEach(([dx, dy]) => {
                c.fillRect(px + dx, y + dy, 1, 1);
            });
        });
    }

    getCharPattern(ch) {
        const p = {
            'A': [[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,1],[2,2],[2,3],[2,4]],
            'B': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[1,4],[2,1],[2,3]],
            'C': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,4],[2,0],[2,4]],
            'D': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,4],[2,1],[2,2],[2,3]],
            'E': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[1,4],[2,0],[2,4]],
            'F': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,0]],
            'G': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,4],[2,0],[2,2],[2,3],[2,4]],
            'H': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4]],
            'I': [[0,0],[0,4],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,4]],
            'J': [[0,3],[1,4],[2,0],[2,1],[2,2],[2,3]],
            'K': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,0],[2,1],[2,3],[2,4]],
            'L': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4]],
            'M': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,1],[2,0],[2,1],[2,2],[2,3],[2,4]],
            'N': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,1],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4]],
            'O': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,4],[2,0],[2,1],[2,2],[2,3],[2,4]],
            'P': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,0],[2,1],[2,2]],
            'Q': [[0,0],[0,1],[0,2],[0,3],[1,0],[1,4],[2,0],[2,1],[2,2],[2,4]],
            'R': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,2],[2,0],[2,1],[2,3],[2,4]],
            'S': [[0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[2,2],[2,3],[0,4],[1,4],[2,4]],
            'T': [[0,0],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0]],
            'U': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,0],[2,1],[2,2],[2,3],[2,4]],
            'V': [[0,0],[0,1],[0,2],[1,3],[1,4],[2,0],[2,1],[2,2]],
            'W': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,3],[2,0],[2,1],[2,2],[2,3],[2,4]],
            'X': [[0,0],[0,1],[0,3],[0,4],[1,2],[2,0],[2,1],[2,3],[2,4]],
            'Y': [[0,0],[0,1],[1,2],[1,3],[1,4],[2,0],[2,1]],
            'Z': [[0,0],[0,4],[1,0],[1,2],[1,4],[2,0],[2,4]],
            ' ': [],
            '.': [[1,4]],
            ',': [[1,4],[0,5]],
            '!': [[1,0],[1,1],[1,2],[1,4]],
            '?': [[0,0],[1,0],[2,1],[1,2],[1,4]],
            '-': [[0,2],[1,2],[2,2]],
            '"': [[0,0],[0,1],[2,0],[2,1]],
            '★': [[1,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2],[0,3],[2,3]],
            '❤': [[0,0],[2,0],[0,1],[1,1],[2,1],[1,2]]
        };
        return p[ch.toUpperCase()] || [[0,2],[1,2],[2,2]];
    }

    gradient(c, x, y, w, h, ...colors) {
        const steps = colors.length - 1;
        for (let i = 0; i < h; i++) {
            const t = i / h;
            const segIdx = Math.min(Math.floor(t * steps), steps - 1);
            const segT = (t * steps) - segIdx;
            const c1 = this.parseColor(colors[segIdx]);
            const c2 = this.parseColor(colors[segIdx + 1]);
            const r = Math.floor(c1[0] + (c2[0] - c1[0]) * segT);
            const g = Math.floor(c1[1] + (c2[1] - c1[1]) * segT);
            const b = Math.floor(c1[2] + (c2[2] - c1[2]) * segT);
            c.fillStyle = `rgb(${r},${g},${b})`;
            c.fillRect(x, y + i, w, 1);
        }
    }

    parseColor(str) {
        if (str.startsWith('rgb')) {
            const m = str.match(/\d+/g);
            return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
        }
        if (str.startsWith('#')) {
            const hex = str.slice(1);
            if (hex.length === 6) {
                return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
            }
        }
        return [0, 0, 0];
    }

    drawCircle(c, cx, cy, r) {
        for (let y = -r; y <= r; y++) {
            for (let x = -r; x <= r; x++) {
                if (x * x + y * y <= r * r) {
                    c.fillRect(cx + x, cy + y, 1, 1);
                }
            }
        }
    }

    wrap(val, max, min) {
        const range = max - min;
        return ((val - min) % range + range) % range + min;
    }
}

// Instantiate and start
const game = new Game();
