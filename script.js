const WIKI_DATABASE = {
    "intro": {
        branch: "General",
        title: "Welcome to Brume",
        components: [
            { type: "paragraph", text: "<b>The Mist has risen.</b> Brume is a procedural dungeon crawler network where no two runs are identical. Built on a custom NBT-driven engine, it features weighted combat, massive bosses, and infinite scaling." },
            { type: "infobox", data: {
                title: "Server Status",
                image: "https://minecraft.wiki/images/Invicon_Crying_Obsidian.png",
                stats: { "Version": "1.21.1", "Mode": "Rogue-lite", "Dungeons": "Procedural", "Economy": "Gold/Souls" }
            }},
            { type: "paragraph", text: "Explore the depths, defeat the <b>Constructs</b>, and extract with your loot before the fog consumes you." }
        ]
    },
    "mech_procgen": {
        branch: "Mechanics",
        title: "Procedural Generation",
        components: [
            { type: "paragraph", text: "Brume uses a 'Room-Tile' algorithm. Every time you enter a portal, the engine stitches together pre-built schematic fragments into a coherent layout, populating it with random loot chests and mob spawners based on the 'Danger Level'." }
        ]
    },
    "boss_goliath": {
        branch: "Bestiary",
        title: "The Goliath",
        components: [
            { type: "infobox", data: {
                title: "Construct: Goliath",
                image: "https://minecraft.wiki/images/Invicon_Iron_Golem.png",
                stats: { "HP": "25,000", "Type": "Tank", "Weakness": "Lightning", "Drop": "Core Fragment" }
            }},
            { type: "paragraph", text: "A relic of the Old World. The Goliath slumbered beneath the Cathedral until the mist woke it. Its heavy plating makes it immune to arrows." },
            { type: "ability_card", name: "Seismic Slam", trigger: "PHASE 2", desc: "Leaps into the air and crashes down, dealing massive AoE damage and slowing players." }
        ]
    },
    "item_void_blade": {
        branch: "Armory",
        title: "Voidwalker Blade",
        components: [
            { type: "infobox", data: {
                title: "Voidwalker Blade",
                image: "https://minecraft.wiki/images/Invicon_Netherite_Sword.png",
                stats: { "Rarity": "LEGENDARY", "Class": "Assassin", "Dmg": "14-18" }
            }},
            { type: "loot_table", title: "Stats", rows: [ ["⚔ Damage", "+18"], ["⚡ Atk Speed", "+1.6"], ["crit Crit Chance", "15%"] ]},
            { type: "ability_card", name: "Shadow Step", trigger: "RIGHT CLICK", desc: "Teleport 5 blocks forward and become invisible for 2 seconds. Cooldown: 10s." }
        ]
    }
};

const ui = {
    notify(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'error' ? '!' : '✓'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(50px)'; }, 3000);
        setTimeout(() => toast.remove(), 3500);
    },
    setLoading(state) {
        document.getElementById('global-loader').style.display = state ? 'flex' : 'none';
    }
};

const engine = {
    () {
        this.renderNav();
        this.initParallax();
        this.loadPage("intro");
        
        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.view;
                this.switchView(target);
            });
        });
    },

    switchView(viewId) {
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        
        const targetElement = document.getElementById(`view-${viewId}`);
        if (targetElement) {
            targetElement.classList.add('active');
        } else {
            console.error(`View not found: view-${viewId}`);
            return;
        }
        
        document.querySelectorAll('.nav-link').forEach(l => {
            if(l.dataset.view === viewId) {
                l.classList.add('active');
            } else {
                l.classList.remove('active');
            }
        });

        if (viewId === 'leaderboard') armory.loadLeaderboard();
    },

    renderNav() {
        const nav = document.getElementById('side-navigation');
        const branches = [...new Set(Object.values(WIKI_DATABASE).map(i => i.branch))];
        let html = '';
        branches.forEach(branch => {
            html += `<div class="branch-label">${branch}</div>`;
            Object.entries(WIKI_DATABASE).filter(([_, v]) => v.branch === branch).forEach(([k, v]) => {
                html += `<div class="nav-leaf" onclick="engine.loadPage('${k}')">${v.title}</div>`;
            });
        });
        nav.innerHTML = html;
    },

    loadPage(key) {
        const data = WIKI_DATABASE[key];
        if(!data) return;
        document.getElementById('page-header').innerHTML = `<h1>${data.title}</h1>`;
        document.getElementById('page-render').innerHTML = data.components.map(c => this.components[c.type](c)).join('');
        document.getElementById('scroll-surface').scrollTop = 0;
    },

    components: {
        paragraph: d => `<p class="paragraph">${d.text}</p>`,
        infobox: d => `
            <div class="infobox">
                <div class="infobox-header">${d.data.title}</div>
                <div class="infobox-img"><img src="${d.data.image}"></div>
                ${Object.entries(d.data.stats).map(([k,v]) => `<div class="info-row"><span>${k}</span><span style="color:var(--text-highlight)">${v}</span></div>`).join('')}
            </div>`,
        ability_card: d => `
            <div class="ability-card">
                <div class="ab-head"><span class="ab-trigger">${d.trigger}</span> <span>${d.name}</span></div>
                <div class="ab-desc">${d.desc}</div>
            </div>`,
        loot_table: d => `
            <div class="loot-table">
                <h3>${d.title}</h3>
                ${d.rows.map(r => `<div class="info-row"><span>${r[0]}</span><span class="stat-val">${r[1]}</span></div>`).join('')}
            </div>`
    },

    initParallax() {
        const container = document.getElementById('parallax-container');
        for(let i=0; i<20; i++) {
            const d = document.createElement('div');
            d.className = 'mist-particle';
            d.style.left = Math.random() * 100 + '%';
            d.style.top = Math.random() * 100 + '%';
            d.style.animationDuration = (Math.random() * 20 + 10) + 's';
            container.appendChild(d);
        }
    },
    
    copyIP() {
        navigator.clipboard.writeText('play.brume.net');
        ui.notify('Server IP Copied!');
    }
};


const armory = {
    async fetchPlayer() {
        const input = document.getElementById('player-search').value.trim();
        if(!input) return ui.notify("Please enter a username", "error");

        ui.setLoading(true);
        try {
            const res = await fetch(`/api?type=player&uuid=${input}`);
            const data = await res.json();
            
            if(data.error) throw new Error(data.error);

            this.renderProfile(data);
            ui.notify(`Loaded data for ${data.name}`);
        } catch(e) {
            ui.notify(e.message, "error");
            document.getElementById('player-profile').style.display = 'none';
        } finally {
            ui.setLoading(false);
        }
    },

    renderProfile(data) {
        document.getElementById('player-profile').style.display = 'flex';
        document.getElementById('p-name').innerText = data.name;
        document.getElementById('p-head').src = `https://minotar.net/helm/${data.name}/128.png`;
        document.getElementById('p-level').innerText = `LVL ${data.level}`;
        document.getElementById('p-coins').innerText = data.coins.toLocaleString();
        
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';
        
        let items = [];
        try { items = typeof data.inventory === 'string' ? JSON.parse(data.inventory) : data.inventory; } catch(e){}
        
        for(let i=0; i<27; i++) {
            const item = items && items[i] ? items[i] : null;
            const slot = document.createElement('div');
            slot.className = `inv-slot ${item ? 'filled' : ''}`;
            
            if(item) {
                const rarity = item.rarity ? item.rarity.toLowerCase() : 'common';
                slot.classList.add(`rarity-${rarity}`);
                
                slot.innerHTML = `
                    <img src="assets/items/${item.id.toLowerCase()}.png" onerror="this.src='https://minecraft.wiki/images/Invicon_Barrier.png'">
                    <span class="qty">${item.amount > 1 ? item.amount : ''}</span>
                    <div class="tooltip">${item.name || item.id}</div>
                `;
            }
            grid.appendChild(slot);
        }
    },

    async loadLeaderboard() {
        const tbody = document.getElementById('lb-body');
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Summoning Spirits...</td></tr>';
        
        try {
            const res = await fetch(`/api?type=leaderboard`);
            const data = await res.json();
            
            tbody.innerHTML = '';
            data.forEach((p, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="rank-col">#${index + 1}</td>
                    <td class="player-col"><img src="https://minotar.net/avatar/${p.name}/24.png"> ${p.name}</td>
                    <td class="level-col"><span>${p.level}</span></td>
                    <td class="coin-col">${p.coins.toLocaleString()} ⛃</td>
                `;
                tbody.appendChild(tr);
            });
        } catch(e) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ff5555;">Connection Severed.</td></tr>';
        }
    }
};

window.onload = () => engine.init() {
        this.renderNav();
        this.initParallax();
        
        this.loadPage("intro");
        
        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.dataset.view;
                if(targetView) {
                    this.switchView(targetView);
                }
            });
        });

        this.attachListeners();
    },
