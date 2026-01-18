// ==========================================
// 1. WIKI DATA & VARIABLES
// ==========================================

// Global Variables exported from Brume Forge
const WIKI_VARS = {
    "SERVER_IP": "play.brume.net",
    "VER": "1.21.1",
    "DISCORD": "discord.gg/brume"
};

// Database structure synced with Brume Forge
const WIKI_DATABASE = {
    "intro": {
        branch: "General",
        title: "Welcome to Brume",
        components: [
            { type: "paragraph", text: "<b>The Mist has risen.</b> Brume is a procedural dungeon crawler network on [SERVER_IP] where no two runs are identical." },
            { type: "alert", style: "tip", text: "New players should start by visiting the Tutorial NPC at spawn!" },
            { type: "infobox", title: "Server Status", image: "https://minecraft.wiki/images/Invicon_Crying_Obsidian.png", stats: { "Version": "[VER]", "Mode": "Rogue-lite", "Discord": "[DISCORD]" } }
        ]
    },
    "boss_goliath": {
        branch: "Bestiary",
        title: "The Goliath",
        components: [
            { type: "grid_2", 
              left: [
                  { type: "infobox", title: "Construct: Goliath", image: "https://minecraft.wiki/images/Invicon_Iron_Golem.png", stats: { "HP": "25,000", "Type": "Tank" } }
              ],
              right: [
                  { type: "markdown", text: "### Lore\nA relic of the Old World. Its heavy plating makes it immune to arrows.\n- Immune to KB\n- Weak to Magic" },
                  { type: "ability", trigger: "PASSIVE", name: "Heavy Plating", desc: "Reduces incoming physical damage by 40%." }
              ]
            },
            { type: "drops", items: [{name: "Core Fragment", chance: 15}, {name: "Ancient Scrap", chance: 100}] }
        ]
    }
};

// ==========================================
// 2. TEXT PROCESSOR (Variables & Markdown)
// ==========================================
const processor = {
    process(text) {
        if (!text) return "";
        // 1. Replace [VARIABLES]
        let out = text.replace(/\[(.*?)\]/g, (m, k) => WIKI_VARS[k] || m);
        // 2. Simple Markdown
        out = out.replace(/### (.*$)/gim, '<h3>$1</h3>')
                 .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
                 .replace(/^\- (.*$)/gim, '<li>$1</li>');
        return out;
    }
};

// ==========================================
// 3. UI ENGINE
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
// 4. CORE ENGINE (Renderer)
// ==========================================
const engine = {
    init() {
        this.renderNav();
        this.initParallax();
        this.loadPage("intro");
        
        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.dataset.view;
                if(targetView) this.switchView(targetView);
            });
        });

        window.addEventListener('keydown', (e) => {
            if(e.key === '/' && document.getElementById('view-wiki').classList.contains('active')) {
                e.preventDefault();
                document.getElementById('wiki-search')?.focus();
            }
        });
    },

    switchView(viewId) {
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`)?.classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.dataset.view === viewId);
        });
        if (viewId === 'leaderboard') armory.loadLeaderboard();
    },

    renderNav() {
        const nav = document.getElementById('side-navigation');
        if(!nav) return;
        const branches = [...new Set(Object.values(WIKI_DATABASE).map(i => i.branch))];
        nav.innerHTML = branches.map(branch => `
            <div class="branch-label">${branch}</div>
            ${Object.entries(WIKI_DATABASE)
                .filter(([_, v]) => v.branch === branch)
                .map(([k, v]) => `<div class="nav-leaf" onclick="engine.loadPage('${k}')">${v.title}</div>`).join('')}
        `).join('');
    },

    loadPage(key) {
        const data = WIKI_DATABASE[key];
        if(!data) return;
        const header = document.getElementById('page-header');
        const render = document.getElementById('page-render');
        
        render.classList.remove('animate-in');
        void render.offsetWidth;
        render.classList.add('animate-in');
        
        header.innerHTML = `<h1>${data.title}</h1>`;
        render.innerHTML = this.renderComponentList(data.components);
        document.getElementById('scroll-surface').scrollTop = 0;
    },

    renderComponentList(components) {
        if (!components) return "";
        return components.map(c => this.components[c.type] ? this.components[c.type](c) : '').join('');
    },

    // Component Rendering Library
    components: {
        paragraph: d => `<p class="paragraph">${processor.process(d.text)}</p>`,
        markdown: d => `<div class="md-block">${processor.process(d.text)}</div>`,
        alert: d => `<div class="wiki-alert ${d.style}"><span class="alert-icon">${d.style === 'warn' ? '⚠️' : '💡'}</span><div>${processor.process(d.text)}</div></div>`,
        
        infobox: d => `
            <div class="infobox">
                <div class="infobox-header">${d.title}</div>
                <div class="infobox-img"><img src="${d.image}"></div>
                ${Object.entries(d.stats || {}).map(([k,v]) => `<div class="info-row"><span>${k}</span><span>${processor.process(v)}</span></div>`).join('')}
            </div>`,

        ability: d => `
            <div class="ability-card">
                <div class="ab-head"><span class="ab-trigger">${d.trigger}</span> <span>${d.name}</span></div>
                <div class="ab-desc">${d.desc}</div>
            </div>`,

        crafting: d => `
            <div class="crafting-container">
                <div class="craft-grid">${d.grid.map(s => `<div class="craft-slot">${s ? `<img src="https://minecraft.wiki/images/Invicon_${s}.png">` : ''}</div>`).join('')}</div>
                <div class="craft-arrow">➜</div>
                <div class="craft-slot"><img src="https://minecraft.wiki/images/Invicon_${d.result}.png"></div>
            </div>`,

        drops: d => `
            <div class="loot-table-fancy">
                <div class="loot-label">LOOT_DROPS</div>
                ${d.items.map(it => `
                    <div class="loot-row-fancy">
                        <span class="it-name">${it.name}</span>
                        <div class="it-bar-bg"><div class="it-bar-fill" style="width:${it.chance}%"></div></div>
                        <span class="it-pct">${it.chance}%</span>
                    </div>`).join('')}
            </div>`,

        command: d => `
            <div class="command-block">
                <div class="cmd-syntax"><code>${d.syntax}</code></div>
                <div class="cmd-desc">${d.desc}</div>
                <div class="cmd-meta">PERM: ${d.perm}</div>
            </div>`,

        // Recursive Layout Components
        grid_2: d => `<div class="w-grid-2">
            <div class="grid-col">${engine.renderComponentList(d.left)}</div>
            <div class="grid-col">${engine.renderComponentList(d.right)}</div>
        </div>`,

        card: d => `<div class="glass-card" style="border-top: 2px solid ${d.color || 'var(--accent)'}">
            <h3 style="margin-bottom:15px; font-family:'JetBrains Mono'">${d.title}</h3>
            <div>${engine.renderComponentList(d.children)}</div>
        </div>`
    },

    search(val) {
        const query = val.toLowerCase();
        document.querySelectorAll('.nav-leaf').forEach(leaf => {
            leaf.style.display = leaf.innerText.toLowerCase().includes(query) ? "block" : "none";
        });
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
        navigator.clipboard.writeText(WIKI_VARS.SERVER_IP);
        ui.notify('Server IP Copied!');
    }
};

// ==========================================
// 5. ARMORY & PLAYER STATS
// ==========================================
const armory = {
    async fetchPlayer() {
        const input = document.getElementById('player-search').value.trim();
        if(!input) return ui.notify("Please enter a username", "error");
        ui.setLoading(true);
        try {
            const res = await fetch(`/api/index?type=player&uuid=${input}`);
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
        document.getElementById('player-profile').style.display = 'block'; 
        hackerText(document.getElementById('p-name'), data.name.toUpperCase());
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
                slot.className = `inv-slot filled rarity-${(item.rarity || 'common').toLowerCase()}`;
                const wikiName = "Invicon_" + item.id.replace(/\b\w/g, c => c.toUpperCase());
                slot.innerHTML = `
                    <img src="assets/items/${item.id.toLowerCase()}.png" 
                         onerror="this.src='https://minecraft.wiki/images/${wikiName}.png'; this.onerror=function(){this.src='https://minecraft.wiki/images/Invicon_Barrier.png'};">
                    <span class="qty">${item.amount > 1 ? item.amount : ''}</span>`;
                slot.onclick = () => openInspector(item);
            } else {
                slot.className = 'inv-slot empty';
            }
            grid.appendChild(slot);
        }
    },

    async loadLeaderboard() {
        const tbody = document.getElementById('lb-body');
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Summoning Spirits...</td></tr>';
        try {
            const res = await fetch(`/api/index?type=leaderboard`);
            const data = await res.json();
            tbody.innerHTML = data.map((p, i) => `
                <tr>
                    <td class="rank-col">#${i + 1}</td>
                    <td class="player-col"><img src="https://minotar.net/avatar/${p.name}/24.png"> ${p.name}</td>
                    <td>${p.level}</td>
                    <td>${p.coins.toLocaleString()} ⛃</td>
                </tr>`).join('');
        } catch(e) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ff5555;">Connection Severed.</td></tr>';
        }
    }
};

// ==========================================
// 6. INSPECTOR & HELPERS
// ==========================================
function openInspector(item) {
    if(!item) return;
    const modal = document.getElementById('item-inspector');
    const card = document.getElementById('relic-card');
    const icon = document.getElementById('insp-icon');
    
    icon.src = `assets/items/${item.id.toLowerCase()}.png`;
    icon.classList.toggle('enchanted-glint', !!item.enchanted);

    const rarityColors = { 'COMMON': '#ffffff', 'UNCOMMON': '#55FF55', 'RARE': '#55FFFF', 'EPIC': '#AA00AA', 'LEGENDARY': '#FFAA00', 'MYTHIC': '#FF5555' };
    const rColor = rarityColors[item.rarity?.toUpperCase()] || '#ffffff';
    
    document.getElementById('insp-name').style.color = rColor;
    document.getElementById('insp-name').innerHTML = parseMinecraftColors(item.name || item.id);
    document.getElementById('insp-lore').innerHTML = parseMinecraftColors((item.lore || "").replace(/\n/g, '<br>'));
    document.getElementById('insp-rarity').style.color = rColor;
    document.getElementById('insp-rarity').innerText = (item.rarity || "COMMON").toUpperCase();
    document.getElementById('insp-glow').style.backgroundColor = rColor;

    modal.style.display = 'flex';
    modal.onmousemove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 20;
        const y = (e.clientY - rect.top - rect.height / 2) / 20;
        card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
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
    const codes = { '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA', '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA', '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF', 'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF' };
    text = text.replace(/§x((?:§[0-9a-fA-F]){6})/g, (m, g) => `<span style="color:#${g.replace(/§/g,'')}">`);
    text = text.replace(/§([0-9a-f])/g, (m, c) => `</span><span style="color:${codes[c]}">`);
    return `<span>${text.replace(/§[lmnor]/g, "")}</span>`;
}

function hackerText(el, str) {
    let iterations = 0;
    const interval = setInterval(() => {
        el.innerText = str.split("").map((l, i) => i < iterations ? str[i] : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
        if(iterations >= str.length) clearInterval(interval);
        iterations += 1/3;
    }, 30);
}

window.onload = () => engine.init();
