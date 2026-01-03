// ==========================================
// 1. WIKI DATA
// ==========================================
const WIKI_DATABASE = {
    "intro": {
        branch: "General",
        title: "Welcome to Brume",
        components: [
            { type: "paragraph", text: "<b>The Mist has risen.</b> Brume is a procedural dungeon crawler network where no two runs are identical." },
            { type: "infobox", data: {
                title: "Server Status",
                image: "https://minecraft.wiki/images/Invicon_Crying_Obsidian.png",
                stats: { "Version": "1.21.1", "Mode": "Rogue-lite", "Economy": "Gold/Souls" }
            }}
        ]
    },
    "boss_goliath": {
        branch: "Bestiary",
        title: "The Goliath",
        components: [
            { type: "infobox", data: {
                title: "Construct: Goliath",
                image: "https://minecraft.wiki/images/Invicon_Iron_Golem.png",
                stats: { "HP": "25,000", "Type": "Tank", "Drop": "Core Fragment" }
            }},
            { type: "paragraph", text: "A relic of the Old World. Its heavy plating makes it immune to arrows." }
        ]
    }
};

// ==========================================
// 2. UI ENGINE
// ==========================================
const ui = {
    notify(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'error' ? '!' : '✓'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(50px)'; }, 3000);
        setTimeout(() => toast.remove(), 3500);
    },
    setLoading(state) {
        const loader = document.getElementById('global-loader');
        if(loader) loader.style.display = state ? 'flex' : 'none';
    }
};

// ==========================================
// 3. CORE ENGINE
// ==========================================
const engine = {
    init() {
        this.renderNav();
        this.initParallax();
        this.loadPage("intro");
        
        // Navigation Logic
        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.dataset.view;
                if(targetView) {
                    this.switchView(targetView);
                }
            });
        });

        // Search Key Listener
        window.addEventListener('keydown', (e) => {
            if(e.key === '/') {
                if(document.getElementById('view-wiki').classList.contains('active')) {
                    e.preventDefault();
                    document.getElementById('wiki-search')?.focus();
                }
            }
        });
    },

    switchView(viewId) {
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        
        const targetElement = document.getElementById(`view-${viewId}`);
        if (targetElement) {
            targetElement.classList.add('active');
        }
        
        document.querySelectorAll('.nav-link').forEach(l => {
            if(l.dataset.view === viewId) l.classList.add('active');
            else l.classList.remove('active');
        });

        if (viewId === 'leaderboard') armory.loadLeaderboard();
    },

    renderNav() {
        const nav = document.getElementById('side-navigation');
        if(!nav) return;
        
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
        
        const header = document.getElementById('page-header');
        const render = document.getElementById('page-render');
        
        if(header) header.innerHTML = `<h1>${data.title}</h1>`;
        if(render) render.innerHTML = data.components.map(c => this.components[c.type](c)).join('');
        
        const scrollSurface = document.getElementById('scroll-surface');
        if(scrollSurface) scrollSurface.scrollTop = 0;
    },

    search(val) {
        const query = val.toLowerCase();
        document.querySelectorAll('.nav-leaf').forEach(leaf => {
            const isMatch = leaf.innerText.toLowerCase().includes(query);
            leaf.style.display = isMatch ? "block" : "none";
        });
    },

    components: {
        paragraph: d => `<p class="paragraph">${d.text}</p>`,
        infobox: d => `
            <div class="infobox">
                <div class="infobox-header">${d.data.title}</div>
                <div class="infobox-img"><img src="${d.data.image}"></div>
                ${Object.entries(d.data.stats).map(([k,v]) => `<div class="info-row"><span>${k}</span><span style="color:#fff">${v}</span></div>`).join('')}
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
        if(!container) return;
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

// ==========================================
// 4. ARMORY & STATS
// ==========================================
const armory = {
    async fetchPlayer() {
        const input = document.getElementById('player-search').value.trim();
        if(!input) return ui.notify("Please enter a username", "error");

        ui.setLoading(true);
        try {
            const res = await fetch(`/api/index?type=player&uuid=${input}`);
            const text = await res.text();
            
            let data;
            try { data = JSON.parse(text); } 
            catch(e) { throw new Error("Server Error (HTML Response)"); }
            
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
        document.getElementById('player-profile').style.display = 'block'; 
        document.getElementById('p-name').innerText = data.name;
        document.getElementById('p-head').src = `https://minotar.net/helm/${data.name}/128.png`;
        document.getElementById('p-level').innerText = `LVL ${data.level || 1}`;
        document.getElementById('p-coins').innerText = (data.coins || 0).toLocaleString();
        
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';
        
        const items = Array.isArray(data.inventory) ? data.inventory : [];
        
        for(let i=0; i<27; i++) {
            const item = items[i]; 
            const slot = document.createElement('div');
            
            if(item && item.id) {
                slot.className = 'inv-slot filled';
                
                const rarity = item.rarity ? item.rarity.toLowerCase() : 'common';
                slot.classList.add(`rarity-${rarity}`);
                
                // Wiki Image Formatter
                const wikiName = "Invicon_" + item.id.replace(/_/g, '_').replace(/\b\w/g, c => c.toUpperCase());
                
                slot.innerHTML = `
                    <img src="assets/items/${item.id.toLowerCase()}.png" 
                         onerror="this.src='https://minecraft.wiki/images/${wikiName}.png'; this.onerror=function(){this.src='https://minecraft.wiki/images/Invicon_Barrier.png'};">
                    <span class="qty">${item.amount > 1 ? item.amount : ''}</span>
                `;
                
                // Add Click Handler for Inspector
                slot.onclick = () => openInspector(item);
                slot.style.cursor = "pointer";
                
            } else {
                slot.className = 'inv-slot empty';
            }
            grid.appendChild(slot);
        }
    },

    async loadLeaderboard() {
        const tbody = document.getElementById('lb-body');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Summoning Spirits...</td></tr>';
        
        try {
            const res = await fetch(`/api/index?type=leaderboard`);
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

// ==========================================
// 5. INSPECTOR & HELPERS
// ==========================================

function openInspector(item) {
    if(!item) return;
    
    const modal = document.getElementById('item-inspector');
    const card = document.getElementById('relic-card');
    
    // 1. Icon
    const icon = document.getElementById('insp-icon');
    const wikiName = "Invicon_" + item.id.replace(/_/g, '_').replace(/\b\w/g, c => c.toUpperCase());
    icon.src = `assets/items/${item.id.toLowerCase()}.png`;
    icon.onerror = () => icon.src = `https://minecraft.wiki/images/${wikiName}.png`; 
    
    // Enchant Glint
    if (item.enchanted) icon.classList.add('enchanted-glint');
    else icon.classList.remove('enchanted-glint');

    // 2. Data
    const nameEl = document.getElementById('insp-name');
    const loreEl = document.getElementById('insp-lore');
    const rarityEl = document.getElementById('insp-rarity');
    const glowEl = document.getElementById('insp-glow');

    const rarityColors = {
        'COMMON': '#ffffff', 'UNCOMMON': '#55FF55', 'RARE': '#55FFFF', 
        'EPIC': '#AA00AA', 'LEGENDARY': '#FFAA00', 'MYTHIC': '#FF5555'
    };
    
    const rColor = rarityColors[item.rarity?.toUpperCase()] || '#ffffff';
    
    nameEl.style.color = rColor;
    // Parse Colors for Name
    nameEl.innerHTML = parseMinecraftColors(item.name || item.id);
    
    // Parse Colors for Lore
    const rawLore = item.lore || "No description available.";
    const htmlLore = rawLore.replace(/\n/g, '<br>');
    loreEl.innerHTML = parseMinecraftColors(htmlLore);
    
    rarityEl.style.color = rColor;
    rarityEl.innerText = (item.rarity || "COMMON").toUpperCase();
    
    glowEl.style.backgroundColor = rColor;

    // 3. Show
    modal.style.display = 'flex';
    
    // 4. Tilt Effect
    modal.onmousemove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        card.style.transform = `perspective(1000px) rotateY(${x / 20}deg) rotateX(${-y / 20}deg)`;
    };
}

function closeInspector(e) {
    if (e.target.id === 'item-inspector') {
        document.getElementById('item-inspector').style.display = 'none';
        document.getElementById('relic-card').style.transform = 'none';
    }
}

function parseMinecraftColors(text) {
    if (!text) return "";
    
    // Hex (§x§R§R§G§G§B§B)
    text = text.replace(/§x((?:§[0-9a-fA-F]){6})/g, (match, hexGroup) => {
        const hex = hexGroup.replace(/§/g, "");
        return `<span style="color: #${hex}">`;
    });

    // Standard Codes
    const codes = {
        '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
        '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
        '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
        'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF'
    };

    text = text.replace(/§([0-9a-f])/g, (match, code) => {
        return `</span><span style="color: ${codes[code]}">`;
    });

    // Strip Formatting codes (l, m, n, o, r)
    text = text.replace(/§[lmnor]/g, "");

    return `<span>${text}</span>`;
}

// 6. START
window.onload = () => engine.init();
