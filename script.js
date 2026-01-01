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
            { type: "paragraph", text: "Fennel is the first inhabitant you encounter. He manages the <b>Training Grounds</b> and handles the early-game progression. He is known for 'borrowing' travelers and skipping legal paperwork." },
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
            { type: "paragraph", text: "Sliver runs the <b>Cursed Dice</b> casino. He deals in high-stakes dungeon loot and rare reagents. He is strictly business and strictly limited by the 5-roll daily void-cap." },
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
            { type: "ability_card", name: "Gale Force", trigger: "SET BONUS", desc: "5% chance on hit to launch skyward. While airborne, deal +40% increased melee damage." },
            { type: "paragraph", text: "Forged from solidified wind, the Breeze Helmet is the cornerstone of high-mobility builds." }
        ]
    },
    "item_fierce_set": {
        branch: "Equipment",
        title: "Fierce Armor Set",
        components: [
            { type: "infobox", data: {
                title: "Fierce Tunic",
                image: "https://minecraft.wiki/images/Invicon_Leather_Chestplate.png",
                stats: { "Rarity": "COMMON", "ID": "FIERCE_SET", "Bonus": "Ashen Skin", "Material": "Iron/Ash" }
            }},
            { type: "ability_card", name: "Ashen Skin", trigger: "SET BONUS", desc: "Grants complete immunity to Fire, Lava, and Fire Tick damage." },
            { type: "paragraph", text: "Essential for the volcanic sectors of the dungeons. Forged in the coldest iron mines to withstand the hottest depths." }
        ]
    },
    "item_greedy_longbow": {
        branch: "Equipment",
        title: "Greedy Longbow",
        components: [
            { type: "infobox", data: {
                title: "Greedy Longbow",
                image: "https://minecraft.wiki/images/Invicon_Bow.png",
                stats: { "Rarity": "MYTHIC", "ID": "GREEDY_BOW", "Type": "Bow", "Cooldown": "1s" }
            }},
            { type: "ability_card", name: "Goldlust", trigger: "PASSIVE", desc: "Damage scales based on the amount of coins carried in your inventory. Banked coins do not apply." },
            { type: "paragraph", text: "Fires golden projectiles that explode into coins on impact. Greed sharpens every arrow." }
        ]
    },

    "sys_dungeons": {
        branch: "Systems",
        title: "Procedural Dungeons",
        components: [
            { type: "paragraph", text: "The Brume Dungeons are generated in real-time using a schematic-stitching algorithm. Every room is scanned for <b>Marker Blocks</b> to determine its contents." },
            { type: "loot_table", title: "Marker Logic", rows: [
                ["Emerald Block", "Room Event Trigger"],
                ["Gold Block", "Loot Socket Spawn"],
                ["Lapis Block", "Physical Barrier (Door)"],
                ["Diamond Block", "Mob Spawn Point"]
            ]},
            { type: "paragraph", text: "Infinity Mode scales difficulty by 1% per room, increasing both mob HP and loot quality." }
        ]
    },
    "sys_breaking": {
        branch: "Systems",
        title: "Breaking Engine",
        components: [
            { type: "paragraph", text: "Mining in Brume uses a <b>Block HP</b> system. Blocks do not break based on vanilla timing, but rather on your <b>Mining Speed</b> NBT stat." },
            { type: "grid", items: [
                { title: "Regeneration", desc: "Ores turn to Cobblestone, then Bedrock, before restoring to their original state." },
                { title: "Fortune", desc: "NBT Fortune stats provide a chance for 2x, 3x, or 4x drops per break." }
            ]}
        ]
    }
};

const engine = {
    init() {
        this.renderNav();
        this.initParallax();
        this.loadPage("intro"); 
        this.showView('wiki');
    },

    showView(viewId) {
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.innerText.toLowerCase() === viewId);
        });

        if(viewId === 'leaderboard') this.loadLeaderboard();
    },

    async loadLeaderboard() {
        const response = await fetch('data/global_leaderboard.json');
        const data = await response.json();
        const body = document.getElementById('lb-body');
        body.innerHTML = data.map((p, i) => `
            <tr>
                <td style="color: var(--accent)">#${i+1}</td>
                <td><img src="https://minotar.net/helm/${p.name}/24.png" style="margin-right:10px"> ${p.name}</td>
                <td>${p.level}</td>
                <td style="color: #E6DB43">${p.coins.toLocaleString()}</td>
            </tr>
        `).join('');
    },

    loadPage(key) {
        const data = WIKI_DATABASE[key];
        const header = document.getElementById('page-header');
        const render = document.getElementById('page-render');

        header.innerHTML = `<h1>${data.title}</h1>`;
        render.innerHTML = data.components.map(c => this.components[c.type](c)).join('');

        document.querySelectorAll('.nav-leaf').forEach(l => l.classList.remove('active'));
        document.getElementById(`nav-${key}`).classList.add('active');
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
            <div class="ability-card">
                <div class="ability-header">
                    <span class="ability-trigger">${d.trigger}</span>
                    <span class="ability-name">${d.name}</span>
                </div>
                <div class="ability-desc">${d.desc}</div>
            </div>
        `,
        loot_table: (d) => `
            <div class="loot-table-container">
                <h3 style="margin-bottom:10px; font-size: 14px; text-transform: uppercase; color: #666;">${d.title}</h3>
                <div class="wiki-table">
                    ${d.rows.map(r => `<div class="info-row"><span>${r[0]}</span><span style="color: #fff;">${r[1]}</span></div>`).join('')}
                </div>
            </div>
        `,
        dialogue_box: (d) => `
            <div class="dialogue-box">
                <span class="dialogue-npc">${d.npc}</span>
                <span class="dialogue-text">"${d.text}"</span>
            </div>
        `,
        grid: (d) => `
            <div class="wiki-grid">
                ${d.items.map(i => `<div class="card"><h3>${i.title}</h3><p>${i.desc}</p></div>`).join('')}
            </div>
        `
    },

    initParallax() {
        const stage = document.getElementById('parallax-container');
        const blocks = [
            'https://minecraft.wiki/images/Invicon_Grass_Block.png',
            'https://minecraft.wiki/images/Invicon_Deepslate.png',
            'https://minecraft.wiki/images/Invicon_Crying_Obsidian.png'
        ];

        for(let i=0; i<15; i++) {
            const el = document.createElement('img');
            el.src = blocks[Math.floor(Math.random() * blocks.length)];
            el.className = 'p-block';
            el.style.left = Math.random() * 100 + 'vw';
            el.style.top = Math.random() * 100 + 'vh';
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
        alert("IP Copied to Clipboard!");
    },

    attachListeners() {
        document.getElementById('scroll-surface').addEventListener('scroll', (e) => {
            const top = e.target.scrollTop;
            document.querySelectorAll('.p-block').forEach(p => {
                const depth = p.dataset.depth;
                p.style.transform = `translateY(${top * depth * -1}px) rotate(${top * 0.05}deg)`;
            });
        });
    }
};

const armory = {
    async fetchPlayer() {
        const name = document.getElementById('player-search').value;
        const uuid = "YOUR_TEST_UUID"; 
        
        try {
            const response = await fetch(`data/${uuid}.json`);
            const data = await response.json();
            this.renderProfile(data);
        } catch (e) {
            alert("Player not found or data not exported yet!");
        }
    },

    renderProfile(data) {
        const profile = document.getElementById('player-profile');
        profile.style.display = "block";
        
        document.getElementById('p-name').innerText = data.name;
        document.getElementById('p-head').src = `https://minotar.net/helm/${data.name}/100.png`;
        document.getElementById('p-level').innerText = `LVL ${data.stats.level}`;
        document.getElementById('p-coins').innerText = data.stats.coins.toLocaleString();
        document.getElementById('p-xp').innerText = data.stats.xp.toLocaleString();

        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = "";
        
        data.inventory.forEach(item => {
            const slot = document.createElement('div');
            slot.className = "inv-slot";
            if (item.id !== "AIR") {
                slot.innerHTML = `
                    <img src="assets/items/${item.id}.png" title="${item.id}">
                    <span class="amt">${item.amount > 1 ? item.amount : ''}</span>
                `;
                slot.onclick = () => this.showItemDetails(item.id);
            }
            grid.appendChild(slot);
        });
    }
};



window.onload = () => engine.init();
