/* ============================================
   SCENE ENGINE — Interactive Love Story
   ============================================ */

const container = document.getElementById('scene-container');
let currentSceneIndex = 0;

/* ============================================
   CHARACTER HTML GENERATORS
   ============================================ */
function createEugene(walking = false, kneeling = false) {
    const walkClass = walking ? 'walking' : '';
    const kneeClass = kneeling ? 'eugene-kneeling' : '';
    return `
    <div class="character ${walkClass} ${kneeClass}">
        <div class="eugene">
            <div class="char-head">
                <div class="char-hair"></div>
                <div class="char-eyes">
                    <div class="char-eye"></div>
                    <div class="char-eye"></div>
                </div>
                <div class="char-blush left"></div>
                <div class="char-blush right"></div>
                <div class="char-mouth"></div>
            </div>
            <div class="char-body">
                <div class="char-arm left"></div>
                <div class="char-arm right"></div>
            </div>
            <div class="char-legs">
                <div class="char-leg left">
                    <div class="char-shoe"></div>
                </div>
                <div class="char-leg right">
                    <div class="char-shoe"></div>
                </div>
            </div>
        </div>
    </div>`;
}

function createAmmu(walking = false) {
    const walkClass = walking ? 'walking' : '';
    return `
    <div class="character ${walkClass}">
        <div class="ammu">
            <div class="char-head">
                <div class="char-hair"></div>
                <div class="char-hair-long left"></div>
                <div class="char-hair-long right"></div>
                <div class="char-hair-bow"></div>
                <div class="char-eyes">
                    <div class="char-eye"></div>
                    <div class="char-eye"></div>
                </div>
                <div class="char-blush left"></div>
                <div class="char-blush right"></div>
                <div class="char-mouth"></div>
            </div>
            <div class="char-body">
                <div class="char-arm left"></div>
                <div class="char-arm right"></div>
            </div>
            <div class="char-dress"></div>
            <div class="char-legs">
                <div class="char-leg left">
                    <div class="char-shoe"></div>
                </div>
                <div class="char-leg right">
                    <div class="char-shoe"></div>
                </div>
            </div>
        </div>
    </div>`;
}

/* ============================================
   BACKGROUND GENERATORS
   ============================================ */
function createCityBackground() {
    return `
    <div class="bg-city">
        <div class="city-sky">
            <div class="city-clouds">
                <div class="cloud cloud-1"></div>
                <div class="cloud cloud-2"></div>
                <div class="cloud cloud-3"></div>
            </div>
        </div>
        <div class="city-buildings">
            ${createBuilding('modern', 140)}
            ${createBuilding('colonial', 190)}
            ${createBuilding('tower', 250)}
            ${createBuilding('colonial', 175)}
            ${createBuilding('modern', 155)}
            ${createBuilding('colonial', 200)}
            ${createBuilding('modern', 130)}
        </div>
        ${createTree(8)}
        ${createTree(92)}
        ${createLampPost(20)}
        ${createLampPost(80)}
        <div class="city-sidewalk"></div>
        <div class="city-road"></div>
    </div>`;
}

function createBuilding(type, height) {
    if (type === 'colonial') {
        const windows = `
            <div class="window-row">
                <div class="arch-window"></div>
                <div class="arch-window"></div>
                <div class="arch-window"></div>
            </div>`.repeat(Math.floor(height / 55));
        return `
        <div class="building building-colonial" style="height:${height}px">
            ${windows}
        </div>`;
    } else if (type === 'tower') {
        return `
        <div class="building building-tower" style="height:${height}px">
            <div class="tower-top"></div>
            <div class="tower-clock"></div>
            <div class="window-row" style="margin-top:55px">
                <div class="arch-window"></div>
                <div class="arch-window"></div>
            </div>
            <div class="window-row">
                <div class="arch-window"></div>
                <div class="arch-window"></div>
            </div>
            <div class="window-row">
                <div class="arch-window"></div>
                <div class="arch-window"></div>
            </div>
        </div>`;
    } else {
        const gridWindows = '<div class="rect-window"></div>'.repeat(12);
        return `
        <div class="building building-modern" style="height:${height}px">
            <div class="window-grid">${gridWindows}</div>
        </div>`;
    }
}

function createTree(leftPercent) {
    return `
    <div class="tree" style="left:${leftPercent}%; bottom:18%">
        <div class="canopy"></div>
        <div class="trunk"></div>
    </div>`;
}

function createLampPost(leftPercent) {
    return `
    <div class="lamp-post" style="left:${leftPercent}%">
        <div class="lamp"></div>
        <div class="lamp-arm"></div>
        <div class="pole"></div>
    </div>`;
}

function createBeachBackground() {
    return `
    <div class="bg-beach">
        <div class="beach-sky">
            <div class="beach-sun"></div>
            <div class="city-clouds">
                <div class="cloud cloud-1" style="opacity:0.5"></div>
                <div class="cloud cloud-2" style="opacity:0.4"></div>
            </div>
        </div>
        <div class="beach-ocean">
            <div class="wave wave-1">
                <svg viewBox="0 0 1200 30" preserveAspectRatio="none">
                    <path d="M0,15 C150,0 350,30 600,15 C850,0 1050,30 1200,15 L1200,30 L0,30 Z" fill="rgba(255,255,255,0.3)"/>
                </svg>
            </div>
            <div class="wave wave-2">
                <svg viewBox="0 0 1200 30" preserveAspectRatio="none">
                    <path d="M0,15 C200,30 400,0 600,15 C800,30 1000,0 1200,15 L1200,30 L0,30 Z" fill="rgba(255,255,255,0.25)"/>
                </svg>
            </div>
            <div class="wave wave-3">
                <svg viewBox="0 0 1200 30" preserveAspectRatio="none">
                    <path d="M0,15 C100,0 300,30 500,15 C700,0 900,30 1200,15 L1200,30 L0,30 Z" fill="rgba(255,255,255,0.2)"/>
                </svg>
            </div>
            <div class="boat">
                <div class="boat-mast">
                    <div class="boat-flag"></div>
                </div>
                <div class="boat-sail"></div>
                <div class="boat-hull"></div>
            </div>
        </div>
        <div class="beach-promenade">
            <div class="railing"></div>
        </div>
        <div class="beach-sand"></div>
        <div class="palm-tree" style="left:8%;bottom:17%">
            <div class="palm-fronds">
                <div class="palm-frond" style="transform:rotate(-40deg);top:-5px;left:-20px;background:#2E7D32"></div>
                <div class="palm-frond" style="transform:rotate(10deg);top:-10px;left:5px;background:#388E3C"></div>
                <div class="palm-frond" style="transform:rotate(50deg);top:-3px;left:10px;background:#2E7D32;transform-origin:right center;border-radius:50% 50% 50% 0"></div>
            </div>
            <div class="palm-trunk"></div>
        </div>
        <div class="palm-tree" style="right:10%;bottom:17%;left:auto">
            <div class="palm-fronds">
                <div class="palm-frond" style="transform:rotate(-50deg);top:-3px;left:-25px;background:#388E3C"></div>
                <div class="palm-frond" style="transform:rotate(5deg);top:-12px;left:0;background:#2E7D32"></div>
                <div class="palm-frond" style="transform:rotate(40deg);top:-5px;left:8px;background:#388E3C;transform-origin:right center;border-radius:50% 50% 50% 0"></div>
            </div>
            <div class="palm-trunk" style="transform:rotate(-5deg)"></div>
        </div>
    </div>`;
}

function createBookshopBackground() {
    return `
    <div class="bg-city">
        <div class="city-sky">
            <div class="city-clouds">
                <div class="cloud cloud-1"></div>
                <div class="cloud cloud-3"></div>
            </div>
        </div>
        <div class="city-buildings" style="justify-content:flex-start;padding-left:5%">
            ${createBuilding('colonial', 180)}
            ${createBuilding('modern', 140)}
        </div>
        <div class="bookshop">
            <div class="bookshop-building">
                <div class="bookshop-roof"></div>
                <div class="bookshop-awning"></div>
                <div class="bookshop-sign">📚 BOOKSHOP</div>
                <div class="bookshop-window left">
                    <div class="book-display">
                        <div class="mini-book" style="height:22px;background:#E53935"></div>
                        <div class="mini-book" style="height:18px;background:#1E88E5"></div>
                        <div class="mini-book" style="height:25px;background:#43A047"></div>
                        <div class="mini-book" style="height:20px;background:#FB8C00"></div>
                        <div class="mini-book" style="height:16px;background:#8E24AA"></div>
                    </div>
                </div>
                <div class="bookshop-window right">
                    <div class="book-display">
                        <div class="mini-book" style="height:20px;background:#D81B60"></div>
                        <div class="mini-book" style="height:24px;background:#00897B"></div>
                        <div class="mini-book" style="height:17px;background:#3949AB"></div>
                        <div class="mini-book" style="height:22px;background:#F4511E"></div>
                    </div>
                </div>
                <div class="bookshop-door">
                    <div class="door-handle"></div>
                </div>
            </div>
        </div>
        ${createBuilding('colonial', 160)}
        ${createLampPost(15)}
        ${createLampPost(85)}
        ${createTree(5)}
        <div class="city-sidewalk"></div>
        <div class="city-road"></div>
    </div>`;
}

function createFlowerBackground() {
    const flowers = [];
    const colors = ['#FF6B9D', '#FF4081', '#E91E63', '#F06292', '#CE93D8', '#BA68C8', '#FFB74D', '#FF8A65'];
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 100;
        const y = 40 + Math.random() * 50;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 0.6 + Math.random() * 0.6;
        const delay = Math.random() * 3;
        flowers.push(`
        <div class="flower-stem" style="left:${x}%;bottom:${100-y}%;transform:scale(${size})">
            <div class="petals" style="position:relative;width:24px;height:24px;margin:0 auto">
                <div class="petal" style="position:absolute;width:10px;height:10px;background:${color};border-radius:50%;top:0;left:7px"></div>
                <div class="petal" style="position:absolute;width:10px;height:10px;background:${color};border-radius:50%;bottom:0;left:7px"></div>
                <div class="petal" style="position:absolute;width:10px;height:10px;background:${color};border-radius:50%;left:0;top:7px"></div>
                <div class="petal" style="position:absolute;width:10px;height:10px;background:${color};border-radius:50%;right:0;top:7px"></div>
                <div class="center" style="position:absolute;width:8px;height:8px;background:#FFD54F;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1"></div>
            </div>
            <div class="stem" style="width:3px;height:${30 + Math.random()*30}px;background:#2E7D32;margin:0 auto"></div>
        </div>`);
    }

    return `
    <div style="position:absolute;top:0;left:0;width:100%;height:100%">
        <div style="position:absolute;top:0;left:0;width:100%;height:50%;background:linear-gradient(180deg,#81D4FA 0%,#B3E5FC 40%,#E8F5E9 100%)"></div>
        <div class="city-clouds">
            <div class="cloud cloud-1"></div>
            <div class="cloud cloud-2"></div>
        </div>
        <div style="position:absolute;bottom:0;left:0;width:100%;height:55%;background:linear-gradient(180deg,#A5D6A7 0%,#81C784 30%,#66BB6A 60%,#4CAF50 100%);border-radius:50% 50% 0 0 / 8% 8% 0 0">
            ${flowers.join('')}
        </div>
        <div class="garden-gate">
            <div class="gate-arch"></div>
            <div class="gate-pillar left"></div>
            <div class="gate-pillar right"></div>
        </div>
    </div>`;
}

function createFloatingHearts(count = 15) {
    const hearts = [];
    const heartEmojis = ['❤️', '💕', '💗', '💖', '🩷', '💝'];
    for (let i = 0; i < count; i++) {
        const emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = 5 + Math.random() * 5;
        const size = 0.8 + Math.random() * 1.2;
        hearts.push(`<div class="heart" style="left:${left}%;font-size:${size}rem;animation-delay:${delay}s;animation-duration:${duration}s">${emoji}</div>`);
    }
    return `<div class="floating-hearts">${hearts.join('')}</div>`;
}

function createStars(count = 60) {
    let stars = '';
    for (let i = 0; i < count; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = 1 + Math.random() * 3;
        const delay = Math.random() * 3;
        const duration = 1.5 + Math.random() * 2;
        stars += `<div class="star" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${duration}s"></div>`;
    }
    return `<div class="stars">${stars}</div>`;
}

function createFinaleFlowers() {
    let flowers = '';
    const colors = [
        ['#FF6B9D','#FF4081'], ['#CE93D8','#BA68C8'], ['#FFB74D','#FF8A65'],
        ['#EF5350','#E53935'], ['#F06292','#EC407A'], ['#AB47BC','#9C27B0'],
        ['#FFAB91','#FF8A65'], ['#F48FB1','#F06292'], ['#E1BEE7','#CE93D8'],
        ['#FFCDD2','#EF9A9A']
    ];
    for (let i = 0; i < 35; i++) {
        const x = Math.random() * 95;
        const y = Math.random() * 90;
        const [c1, c2] = colors[Math.floor(Math.random() * colors.length)];
        const size = 0.5 + Math.random() * 0.8;
        const delay = Math.random() * 4;
        const stemH = 25 + Math.random() * 35;

        flowers += `
        <div class="finale-flower" style="left:${x}%;top:${y}%;transform:scale(${size});animation-delay:${delay}s">
            <div class="f-petals">
                <div class="f-petal" style="background:${c1};transform:translate(-50%,-100%) rotate(0deg)"></div>
                <div class="f-petal" style="background:${c2};transform:translate(0%,-50%) rotate(90deg)"></div>
                <div class="f-petal" style="background:${c1};transform:translate(-50%,0%) rotate(180deg)"></div>
                <div class="f-petal" style="background:${c2};transform:translate(-100%,-50%) rotate(270deg)"></div>
                <div class="f-center"></div>
            </div>
            <div class="f-stem" style="height:${stemH}px"></div>
        </div>`;
    }
    return flowers;
}

/* ============================================
   SCENE DEFINITIONS
   ============================================ */
const scenes = [
    // 0 — Intro
    {
        id: 'intro',
        render: () => `
            <div class="scene scene-intro active" id="scene-intro">
                ${createFloatingHearts(20)}
                <div class="intro-content">
                    <div class="intro-sun"></div>
                    <h1 class="intro-title">Good Morning Pookie</h1>
                    <p class="intro-subtitle">A little story, just for you ☀️</p>
                    <button class="btn btn-primary" onclick="nextScene()" style="animation: fadeIn 1s ease-out 1.5s both">
                        Continue 💕
                    </button>
                </div>
            </div>`
    },
    // 1 — Walking in the city, date ask
    {
        id: 'city-date',
        render: () => `
            <div class="scene active" id="scene-city-date">
                ${createCityBackground()}
                <div class="characters-container" id="walk-chars-1">
                    ${createEugene(true)}
                    ${createAmmu(true)}
                </div>
            </div>`,
        onEnter: () => {
            setTimeout(() => {
                // Stop walking
                const chars = document.querySelectorAll('#walk-chars-1 .character');
                chars.forEach(c => c.classList.remove('walking'));

                // Show dialogue
                const bubble = document.createElement('div');
                bubble.className = 'speech-bubble-container';
                bubble.innerHTML = `
                    <div class="speech-bubble">
                        <div class="speaker-name">Eugene</div>
                        <div class="dialogue-text">Would you like to go on a date? 🌸</div>
                        <div class="btn-group">
                            <button class="btn btn-yes" onclick="handleChoice('yes','Yay! Let\\'s go! 💕')">Yes! 💕</button>
                            <button class="btn btn-no" onclick="handleChoice('shy','Hehe, let\\'s go anyway! 😊')">No 😅</button>
                        </div>
                    </div>`;
                document.getElementById('scene-city-date').appendChild(bubble);
            }, 2500);
        }
    },
    // 2 — Walk transition to bookshop
    {
        id: 'walk-to-bookshop',
        render: () => `
            <div class="scene active walk-transition" id="scene-walk-bookshop">
                <div class="walk-bg-scroll">
                    <div class="walk-bg-half">${createCityBackground()}</div>
                    <div class="walk-bg-half">${createCityBackground()}</div>
                </div>
                <div class="characters-container" style="left:50%;transform:translateX(-50%)">
                    ${createEugene(true)}
                    ${createAmmu(true)}
                </div>
                <div class="walk-overlay-text">🚶‍♂️ Walking to the bookshop... 📚</div>
            </div>`,
        onEnter: () => {
            setTimeout(() => nextScene(), 3500);
        }
    },
    // 3 — Bookshop scene
    {
        id: 'bookshop',
        render: () => `
            <div class="scene active" id="scene-bookshop">
                ${createBookshopBackground()}
                <div class="characters-container" style="bottom:95px">
                    ${createEugene(false)}
                    ${createAmmu(false)}
                </div>
            </div>`,
        onEnter: () => {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = 'speech-bubble-container';
                bubble.innerHTML = `
                    <div class="speech-bubble">
                        <div class="speaker-name">Eugene</div>
                        <div class="dialogue-text">Look at this beautiful bookshop! Want a book, Rapunzel? 📖</div>
                        <div class="btn-group">
                            <button class="btn btn-yes" onclick="handleChoice('book-yes','📚 A lovely book for my love!')">Yes! 📖</button>
                            <button class="btn btn-no" onclick="handleChoice('book-no','That\\'s okay, let\\'s keep walking! 💛')">No thanks 😊</button>
                        </div>
                    </div>`;
                document.getElementById('scene-bookshop').appendChild(bubble);
            }, 1200);
        }
    },
    // 4 — Walk to flower garden
    {
        id: 'walk-to-flowers',
        render: () => `
            <div class="scene active walk-transition" id="scene-walk-flowers">
                <div class="walk-bg-scroll">
                    <div class="walk-bg-half">${createCityBackground()}</div>
                    <div class="walk-bg-half" style="background:linear-gradient(180deg,#B3E5FC 0%,#E8F5E9 100%)">
                        ${createFlowerBackground()}
                    </div>
                </div>
                <div class="characters-container" style="left:50%;transform:translateX(-50%)">
                    ${createEugene(true)}
                    ${createAmmu(true)}
                </div>
                <div class="walk-overlay-text">🌷 Walking to the flower garden... 🌸</div>
            </div>`,
        onEnter: () => {
            setTimeout(() => nextScene(), 3500);
        }
    },
    // 5 — Flower / Jasmine scene (no question)
    {
        id: 'flowers',
        render: () => `
            <div class="scene active" id="scene-flowers">
                ${createFlowerBackground()}
                <div class="characters-container" style="bottom:100px">
                    ${createEugene(false)}
                    ${createAmmu(false)}
                </div>
            </div>`,
        onEnter: () => {
            setTimeout(() => {
                // Show jasmine giving
                const jasmine = document.createElement('div');
                jasmine.className = 'jasmine-container jasmine-gift';
                jasmine.innerHTML = `
                    <div style="text-align:center;font-size:3rem;margin-bottom:5px">🌼</div>
                    <div class="jasmine-sparkles">
                        <div class="j-sparkle" style="left:0;top:0;animation-delay:0s">✨</div>
                        <div class="j-sparkle" style="right:0;top:5px;animation-delay:0.5s">✨</div>
                        <div class="j-sparkle" style="left:10px;bottom:0;animation-delay:1s">✨</div>
                        <div class="j-sparkle" style="right:10px;bottom:5px;animation-delay:1.5s">✨</div>
                    </div>
                `;
                document.getElementById('scene-flowers').appendChild(jasmine);

                setTimeout(() => {
                    const bubble = document.createElement('div');
                    bubble.className = 'speech-bubble-container';
                    bubble.style.bottom = '240px';
                    bubble.innerHTML = `
                        <div class="speech-bubble">
                            <div class="speaker-name">Eugene</div>
                            <div class="dialogue-text">Here is a jasmine for you, my love 🌼💕</div>
                        </div>`;
                    document.getElementById('scene-flowers').appendChild(bubble);

                    setTimeout(() => {
                        const ammuBubble = document.createElement('div');
                        ammuBubble.className = 'speech-bubble-container';
                        ammuBubble.style.bottom = '140px';
                        ammuBubble.style.animation = 'fadeInUp 0.6s ease-out';
                        ammuBubble.innerHTML = `
                            <div class="speech-bubble" style="border-color:rgba(255,64,129,0.3)">
                                <div class="speaker-name" style="color:#E91E63">Rapunzel</div>
                                <div class="dialogue-text">It's beautiful, Eugene! Thank you! 🥰</div>
                                <div class="btn-group" style="margin-top:15px">
                                    <button class="btn btn-primary" onclick="nextScene()">Continue 🌸</button>
                                </div>
                            </div>`;
                        document.getElementById('scene-flowers').appendChild(ammuBubble);
                    }, 2000);
                }, 800);
            }, 1000);
        }
    },
    // 6 — Walk to Marine Drive
    {
        id: 'walk-to-beach',
        render: () => `
            <div class="scene active walk-transition" id="scene-walk-beach">
                <div class="walk-bg-scroll" style="animation-duration:4.5s">
                    <div class="walk-bg-half">${createFlowerBackground()}</div>
                    <div class="walk-bg-half">${createBeachBackground()}</div>
                </div>
                <div class="characters-container" style="left:50%;transform:translateX(-50%)">
                    ${createEugene(true)}
                    ${createAmmu(true)}
                </div>
                <div class="walk-overlay-text">🌊 Walking to Marine Drive... 🌅</div>
            </div>`,
        onEnter: () => {
            setTimeout(() => nextScene(), 4000);
        }
    },
    // 7 — Marine Drive / Tea scene
    {
        id: 'beach-tea',
        render: () => `
            <div class="scene active" id="scene-beach">
                ${createBeachBackground()}
                <div class="characters-container" style="bottom:90px">
                    ${createEugene(false)}
                    ${createAmmu(false)}
                </div>
                <div class="tea-cup" style="bottom:115px;left:calc(50% + 50px)">
                    <div class="tea-steam">
                        <div class="steam-line"></div>
                        <div class="steam-line"></div>
                        <div class="steam-line"></div>
                    </div>
                    <div class="tea-cup-body">
                        <div class="tea-inside"></div>
                    </div>
                </div>
                <div class="tea-cup" style="bottom:115px;left:calc(50% - 70px)">
                    <div class="tea-steam">
                        <div class="steam-line"></div>
                        <div class="steam-line"></div>
                        <div class="steam-line"></div>
                    </div>
                    <div class="tea-cup-body">
                        <div class="tea-inside"></div>
                    </div>
                </div>
            </div>`,
        onEnter: () => {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = 'speech-bubble-container';
                bubble.innerHTML = `
                    <div class="speech-bubble">
                        <div class="speaker-name">Eugene</div>
                        <div class="dialogue-text">The sunset is gorgeous! Wanna drink some tea? ☕🌅</div>
                        <div class="btn-group">
                            <button class="btn btn-yes" onclick="handleChoice('tea-yes','☕ Cheers to us! 🥰')">Yes! ☕</button>
                            <button class="btn btn-no" onclick="handleChoice('tea-no','That\\'s alright! The view is enough 🌅')">No thanks 😊</button>
                        </div>
                    </div>`;
                document.getElementById('scene-beach').appendChild(bubble);
            }, 1500);
        }
    },
    // 8 — Romantic message
    {
        id: 'romantic-message',
        render: () => `
            <div class="scene active message-scene" id="scene-message">
                ${createStars(80)}
                ${createFloatingHearts(10)}
                <div class="message-box">
                    <div style="text-align:center;font-size:2rem;margin-bottom:15px">💫</div>
                    <div class="msg-text" id="typed-message"></div>
                    <div class="btn-group" id="msg-continue" style="margin-top:20px;display:none">
                        <button class="btn btn-primary" onclick="nextScene()">Continue 💕</button>
                    </div>
                </div>
            </div>`,
        onEnter: () => {
            const msg = `You know, Rapunzel, every moment with you is special, and being with you is the happiest part of my life. I want to be with you forever. 💕`;
            typeText('typed-message', msg, 40, () => {
                document.getElementById('msg-continue').style.display = 'flex';
                document.getElementById('msg-continue').style.animation = 'fadeInUp 0.5s ease-out';
            });
        }
    },
    // 9 — Hug & Proposal
    {
        id: 'proposal',
        render: () => `
            <div class="scene active proposal-scene" id="scene-proposal">
                ${createStars(60)}
                <div class="spotlight"></div>
                ${createFloatingHearts(8)}
                <div class="hug-container" id="hug-container">
                    <div class="hug-hearts" id="hug-hearts">💕💗💖</div>
                    <div class="hug-characters" id="hug-chars" style="gap:30px">
                        ${createEugene(false)}
                        ${createAmmu(false)}
                    </div>
                </div>
            </div>`,
        onEnter: () => {
            // Step 1: Hug
            setTimeout(() => {
                const chars = document.getElementById('hug-chars');
                chars.style.gap = '2px';
                chars.style.transition = 'gap 1s ease-in-out';
                document.getElementById('hug-hearts').classList.add('visible');

                const hugLabel = document.createElement('div');
                hugLabel.className = 'speech-bubble-container';
                hugLabel.style.bottom = '260px';
                hugLabel.innerHTML = `
                    <div class="speech-bubble">
                        <div class="dialogue-text" style="font-style:italic;color:#E91E63">*Eugene hugs Rapunzel tightly* 🤗💕</div>
                    </div>`;
                document.getElementById('scene-proposal').appendChild(hugLabel);
            }, 1000);

            // Step 2: Go on knee with rose
            setTimeout(() => {
                // Clear hug label
                const existing = document.querySelectorAll('#scene-proposal .speech-bubble-container');
                existing.forEach(e => e.remove());

                const hugContainer = document.getElementById('hug-container');
                hugContainer.innerHTML = `
                    <div class="hug-hearts visible" style="font-size:2.5rem">🌹</div>
                    <div class="hug-characters" style="gap:20px;align-items:flex-end">
                        ${createEugene(false, true)}
                        ${createAmmu(false)}
                    </div>`;

                const proposalBubble = document.createElement('div');
                proposalBubble.className = 'speech-bubble-container';
                proposalBubble.style.bottom = '280px';
                proposalBubble.innerHTML = `
                    <div class="speech-bubble">
                        <div class="speaker-name">Eugene</div>
                        <div class="dialogue-text">
                            <span class="rose-emoji">🌹</span><br>
                            <strong style="font-size:1.2rem;color:#E91E63">I love you, Ammu</strong> 💕
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-yes" onclick="handleProposalResponse('yes')">Yes! I love you too! 💕</button>
                            <button class="btn btn-no" onclick="handleProposalResponse('shy')">😳💕</button>
                        </div>
                    </div>`;
                document.getElementById('scene-proposal').appendChild(proposalBubble);
            }, 4500);
        }
    },
    // 10 — Continue to finale
    {
        id: 'pre-finale',
        render: () => `
            <div class="scene active message-scene" id="scene-pre-finale">
                ${createStars(50)}
                ${createFloatingHearts(12)}
                <div style="text-align:center;z-index:10;animation:fadeInUp 1s ease-out">
                    <div style="font-size:4rem;margin-bottom:20px">💖</div>
                    <h2 style="font-family:var(--font-script);font-size:2.5rem;color:var(--pink-light);margin-bottom:30px;text-shadow:0 0 20px rgba(255,107,157,0.4)">
                        One last thing...
                    </h2>
                    <button class="btn btn-primary" onclick="nextScene()" style="font-size:1.2rem;padding:16px 50px">
                        Open 💌
                    </button>
                </div>
            </div>`
    },
    // 11 — Finale with flower animation and love letter
    {
        id: 'finale',
        render: () => `
            <div class="scene active finale-scene" id="scene-finale">
                ${createStars(40)}
                <div class="finale-flowers-container">
                    ${createFinaleFlowers()}
                </div>
                <div class="finale-letter-container">
                    <h1 class="finale-title">Dear Ammu 💌</h1>
                    <div class="finale-text">
                        Hi Ammu, <span class="highlight">I love you a lot</span> and will love you forever — till the sun explodes and takes over the world, hehe. ☀️💥
                        <br><br>
                        You know, talking like this feels like sending you letters via pigeon, hahaha — I love it. 🐦💌
                        <br><br>
                        Every moment, I think of you and want to talk with you. Your smile, your laugh, your voice, your way of thinking, your writing, your stories, your interests, your talks — <span class="highlight">I LOVE IT ALL. I LOVE YOU.</span> 💕
                        <br><br>
                        I will never make you upset or make you cry. I will always be there, right next to you. You can share anything you want, and <span class="highlight">my shoulder and a bigggg hug are always there</span>. 🤗
                        <br><br>
                        I want to explore the whole world with you and spend every single moment with you. I want to <span class="highlight">open a café in Kerala</span> with you, where books written by you can sit on our shelves and my eyes can treasure every moment of it — a shelf where I can put every memory of ours. ☕📚🌿
                        <br><br>
                        <span class="highlight" style="font-size:1.3rem">I love you, Ammu. Forever and always. 💕</span>
                    </div>
                    <div class="finale-signature">— Your Eugene 🌹</div>
                    <div class="finale-hearts">❤️ 💕 💖 💗 💝 ❤️</div>
                </div>
            </div>`
    }
];

/* ============================================
   SCENE MANAGEMENT
   ============================================ */
function renderScene(index) {
    const scene = scenes[index];
    container.innerHTML = scene.render();

    // Small delay to trigger CSS transitions
    requestAnimationFrame(() => {
        const sceneEl = container.querySelector('.scene');
        if (sceneEl) sceneEl.classList.add('active');
    });

    // Call onEnter hook
    if (scene.onEnter) {
        setTimeout(() => scene.onEnter(), 300);
    }
}

function nextScene() {
    const currentEl = container.querySelector('.scene');
    if (currentEl) {
        currentEl.classList.add('fade-out');
        currentEl.classList.remove('active');
    }

    setTimeout(() => {
        currentSceneIndex++;
        if (currentSceneIndex < scenes.length) {
            renderScene(currentSceneIndex);
        }
    }, 600);
}

/* ============================================
   CHOICE HANDLERS
   ============================================ */
function handleChoice(type, responseText) {
    // Remove existing bubble
    const bubbles = document.querySelectorAll('.speech-bubble-container');
    bubbles.forEach(b => b.remove());

    // Show response
    const response = document.createElement('div');
    response.className = 'response-display';
    const emoji = type.includes('yes') || type === 'shy' || type === 'book-yes' || type === 'tea-yes' ? '💕' : '💛';
    response.innerHTML = `
        <div class="response-emoji">${emoji}</div>
        <div class="response-text">${responseText}</div>`;

    const activeScene = document.querySelector('.scene.active') || document.querySelector('.scene');
    if (activeScene) activeScene.appendChild(response);

    // Continue to next scene
    setTimeout(() => nextScene(), 2200);
}

function handleProposalResponse(type) {
    const bubbles = document.querySelectorAll('.speech-bubble-container');
    bubbles.forEach(b => b.remove());

    // Confetti burst
    createConfetti();

    const response = document.createElement('div');
    response.className = 'response-display';
    response.innerHTML = `
        <div class="response-emoji" style="font-size:5rem">💖</div>
        <div class="response-text" style="font-size:2.2rem">${type === 'yes' ? 'I love you too, Eugene! 💕' : 'Hehe... I love you! 💕'}</div>`;

    document.getElementById('scene-proposal').appendChild(response);

    setTimeout(() => nextScene(), 3000);
}

/* ============================================
   TEXT ANIMATION
   ============================================ */
function typeText(elementId, text, speed = 40, callback) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let i = 0;
    el.innerHTML = '';

    function type() {
        if (i < text.length) {
            el.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

/* ============================================
   CONFETTI EFFECT
   ============================================ */
function createConfetti() {
    const colors = ['#FF6B9D', '#FFD54F', '#FF4081', '#E91E63', '#CE93D8', '#FF8A65', '#81D4FA', '#A5D6A7'];
    const scene = document.getElementById('scene-proposal');
    if (!scene) return;

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            top: -10px;
            left: ${Math.random() * 100}%;
            width: ${6 + Math.random() * 8}px;
            height: ${6 + Math.random() * 8}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            z-index: 60;
            animation: confetti ${2 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards;
            pointer-events: none;
        `;
        scene.appendChild(confetti);
    }
}

/* ============================================
   SPARKLE CURSOR EFFECT
   ============================================ */
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.92) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }
});

/* ============================================
   INITIALIZE
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    renderScene(0);
});
