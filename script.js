const WIKI_DATABASE = {
    "intro": {
        branch: "General",
        title: "The Brume Core",
        components: [
            { type: "paragraph", text: "<b>Brume</b> is a high-performance RPG sandbox built on Minecraft 1.21.1. At its heart lies a bespoke 8,000+ LoC engine that overrides vanilla physics to provide a weighted, mechanical combat and mining experience." },
            { type: "infobox", data: {
                title: "Server Metadata",
                image: "https://minecraft.wiki/images/Invicon_Crying_Obsidian.png",
                stats: { "Developer": "HugeAdventure", "Version": "1.21.1", "Engine": "Brume v2.4", "Logic": "NBT-Driven" }
            }},
            { type: "paragraph", text: "Key innovations include a <b>Rolling Window DPS</b> tracker, <b>Client-Sided Interpolation</b> for visuals, and a <b>Master Registry</b> system that allows for real-time item balancing without player intervention." }
        ]
    },
    "npc_fennel": {
        branch: "Characters",
        title: "Fennel",
        components: [
            { type: "infobox", data: {
                title: "Fennel",
                image: "https://minotar.net/helm/Fennel/100.png",
                stats: { "Role": "The Guide", "Location": "Hub / Tutorial", "Vibe": "Chaotic Good", "Sound": "Pling / Enderman" }
            }},
            { type: "paragraph", text: "Fennel is the first inhabitant you encounter. He manages the <b>Training Grounds</b> and handles the early-game progression." },
            { type: "dialogue_box", npc: "Fennel", text: "Look at you! A regular bird! Just jump before you swing—it makes the 'crunch' sound better." }
        ]
    },
    "npc_sliver": {
        branch: "Characters",
        title: "Sliver",
        components: [
            { type: "infobox", data: {
                title: "Sliver",
                image: "https://minotar.net/helm/Sliver/100.png",
                stats: { "Role": "The Gambler", "Location": "The Hub", "Limit": "5 Rolls/Day", "Currency": "Coins" }
            }},
            { type: "paragraph", text: "Sliver runs the <b>Cursed Dice</b> casino. He deals in high-stakes dungeon loot and rare reagents." },
            { type: "dialogue_box", npc: "Sliver", text: "The void is closed for you today. Limits exist for a reason, friend." }
        ]
    },
    "item_breeze_helmet": {
        branch: "Equipment",
        title: "Breeze Helmet",
        components: [
            { type: "infobox", data: {
                title: "Breeze Helmet",
                image: "https://minecraft.wiki/images/Invicon_Leather_Helmet.png",
                stats: { "Rarity": "RARE", "ID": "BREEZE_HELMET", "Set": "Breeze", "Type": "Helmet" }
            }},
            { type: "loot_table", title: "NBT Base Stats", rows: [
                ["❤ Health", "+5"],
                ["🛡 Defense", "+25"],
                ["⚡ Speed", "+7"]
            ]},
            { type: "ability_card", name: "Gale Force", trigger: "SET BONUS", desc: "5% chance on hit to launch skyward. While airborne, deal +40% increased melee damage." }
        ]
    }
    
};


const ui = {
    notify(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><span>${type === 'error' ? '✕' : '✦'}</span> ${message}</div>`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; }, 3000);
        setTimeout(() => toast.remove(), 3500);
    },

    setLoading(state) {
        const loader = document.getElementById('global-loader');
        if(loader) loader.style.display = state ? 'flex' : 'none';
    }
};


const engine = {
    init() {
        this.renderNav();
        this.initParallax();
        this.attachListeners();
        this.loadPage("intro"); 
        this.showView('wiki');
    },

    renderNav() {
        const nav = document.getElementById('side-navigation');
        const branches = [...new Set(Object.values(WIKI_DATABASE).map(item => item.branch))];
        
        let html = '';
        branches.forEach(branch => {
            html += `<div class="branch-label">${branch}</div>`;
            for (let key in WIKI_DATABASE) {
                if (WIKI_DATABASE[key].branch === branch) {
                    html += `<div class="nav-leaf" id="nav-${key}" onclick="engine.loadPage('${key}')">${WIKI_DATABASE[key].title}</div>`;
                }
            }
        });
        nav.innerHTML = html;
    },

    showView(viewId) {
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.innerText.toLowerCase() === viewId.toLowerCase());
        });

        if(viewId === 'leaderboard') this.loadLeaderboard();
    },

    loadPage(key) {
        const data = WIKI_DATABASE[key];
        if(!data) return;

        const header = document.getElementById('page-header');
        const render = document.getElementById('page-render');

        header.innerHTML = `<h1>${data.title}</h1>`;
        render.innerHTML = data.components.map(c => this.components[c.type](c)).join('');

        document.querySelectorAll('.nav-leaf').forEach(l => l.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${key}`);
        if(activeNav) activeNav.classList.add('active');
        
        document.getElementById('scroll-surface').scrollTop = 0;
    },

    components: {
        paragraph: (d) => `<p class="paragraph">${d.text}</p>`,
        infobox: (d) => `
            <div class="infobox">
                <div class="infobox-header">${d.data.title}</div>
                <div class="infobox-img-container"><img src="${d.data.image}"></div>
                <div class="infobox-data">
                    ${Object.entries(d.data.stats).map(([k,v]) => `
                        <div class="info-row"><span class="info-label">${k}</span><span>${v}</span></div>
                    `).join('')}
                </div>
            </div>
        `,
        ability_card: (d) => `
            <div class="ability-card" style="border: 1px solid var(--accent); padding: 15px; border-radius: 8px; margin-bottom: 20px; background: rgba(81, 85, 155, 0.1);">
                <div class="ability-header" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span class="ability-trigger" style="font-size:10px; color:var(--accent); font-weight:bold;">${d.trigger}</span>
                    <span class="ability-name" style="font-weight:bold; letter-spacing:1px;">${d.name}</span>
                </div>
                <div class="ability-desc" style="font-size:14px; color:#aaa;">${d.desc}</div>
            </div>
        `,
        loot_table: (d) => `
            <div class="loot-table-container">
                <h3 style="margin-bottom:10px; font-size: 14px; text-transform: uppercase; color: #666;">${d.title}</h3>
                <div class="wiki-table" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px;">
                    ${d.rows.map(r => `<div class="info-row"><span>${r[0]}</span><span style="color: #fff;">${r[1]}</span></div>`).join('')}
                </div>
            </div>
        `,
        dialogue_box: (d) => `
            <div class="dialogue-box" style="border-left: 3px solid var(--accent); padding-left: 20px; margin: 30px 0; font-style: italic;">
                <span class="dialogue-npc" style="display:block; color:var(--accent); font-weight:bold; font-style: normal; margin-bottom:5px;">${d.npc}:</span>
                <span class="dialogue-text">"${d.text}"</span>
            </div>
        `
    },

    initParallax() {
        const stage = document.getElementById('parallax-container');
        if(!stage) return;
        const blocks = [
            'https://minecraft.wiki/images/Invicon_Grass_Block.png',
            'https://minecraft.wiki/images/Invicon_Deepslate.png',
            'https://minecraft.wiki/images/Invicon_Crying_Obsidian.png'
        ];

        for(let i=0; i<15; i++) {
            const el = document.createElement('img');
            el.src = blocks[Math.floor(Math.random() * blocks.length)];
            el.className = 'p-block';
            el.style.position = 'absolute';
            el.style.left = Math.random() * 100 + 'vw';
            el.style.top = Math.random() * 100 + 'vh';
            el.style.width = '32px'; el.style.opacity = '0.2'; el.style.imageRendering = 'pixelated';
            el.dataset.depth = Math.random() * 0.1 + 0.02;
            stage.appendChild(el);
        }
    },

    search(val) {
        const query = val.toLowerCase();
        document.querySelectorAll('.nav-leaf').forEach(leaf => {
            const isMatch = leaf.innerText.toLowerCase().includes(query);
            leaf.style.display = isMatch ? "block" : "none";
        });
    },

    copyIP() {
        navigator.clipboard.writeText("play.brume.net");
        ui.notify("IP Copied to Clipboard!");
    },

    attachListeners() {
        document.getElementById('scroll-surface').addEventListener('scroll', (e) => {
            const top = e.target.scrollTop;
            document.querySelectorAll('.p-block').forEach(p => {
                const depth = p.dataset.depth;
                p.style.transform = `translateY(${top * depth * -1}px) rotate(${top * 0.05}deg)`;
            });
        });

        window.addEventListener('keydown', (e) => {
            if(e.key === '/') {
                e.preventDefault();
                document.getElementById('wiki-search')?.focus();
            }
        });
    }
};


const armory = {
    async fetchPlayer() {
        const input = document.getElementById('player-search').value.trim();
        if(!input) {
            ui.notify("Enter a traveler's name or UUID", "error");
            return;
        }

        ui.setLoading(true);

        try {
            // Calling your new API
            const response = await fetch(`/api/stats?uuid=${encodeURIComponent(input)}`);
            
            if (!response.ok) throw new Error("NOT_FOUND");

            const data = await response.json();
            
            // Animation delay for "feel"
            setTimeout(() => {
                this.renderProfile(data);
                ui.setLoading(false);
                ui.notify(`Archive retrieved for ${data.name}`);
            }, 600);

        } catch (e) {
            ui.setLoading(false);
            document.getElementById('player-profile').style.display = 'none';
            if(e.message === "NOT_FOUND") {
                ui.notify("Traveler not found in the archives.", "error");
            } else {
                ui.notify("Connection to the SQL database failed.", "error");
            }
        }
    },

    renderProfile(data) {
        const profile = document.getElementById('player-profile');
        profile.style.display = "block";
        
        document.getElementById('p-name').innerText = (data.name || "Unknown").toUpperCase();
        document.getElementById('p-head').src = `https://minotar.net/helm/${data.name}/100.png`;
        
        document.getElementById('p-level').innerText = `level: ${data.level || '0.0'}`;
        document.getElementById('p-coins').innerText = (data.coins || 0).toLocaleString();
        document.getElementById('p-xp').innerText = (data.xp || 0).toLocaleString();
        
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = "";
        
        if (data.inventory) {
            try {
                const items = typeof data.inventory === 'string' ? JSON.parse(data.inventory) : data.inventory;
                items.forEach(item => {
                    const slot = document.createElement('div');
                    slot.className = "inv-slot";
                    slot.innerHTML = `<img src="assets/items/${item.id.toLowerCase()}.png" 
                                       onerror="this.src='https://minecraft.wiki/images/Invicon_Barrier.png'">
                                      <span class="amt">${item.amount > 1 ? item.amount : ''}</span>`;
                    grid.appendChild(slot);
                });
            } catch(e) {
                grid.innerHTML = "<p style='color:#444; font-size:12px;'>Inventory data corrupted or empty.</p>";
            }
        }
    }
};

// Start the engine
window.onload = () => engine.init();
