const ui = {
    notify(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="color:var(--accent)">${type === 'error' ? '✖' : '✦'}</span>
                ${message}
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.style.opacity = '0', 3000);
        setTimeout(() => toast.remove(), 3500);
    },

    setLoading(state) {
        document.getElementById('global-loader').style.display = state ? 'flex' : 'none';
    }
};

const armory = {
    async fetchPlayer() {
        const input = document.getElementById('player-search').value.trim();
        
        if (!input) {
            ui.notify("Identify a traveler first (Enter Name/UUID)", "error");
            return;
        }

        ui.setLoading(true);

        try {
            const response = await fetch(`/api/stats?uuid=${input}`);
            
            if (!response.ok) {
                throw new Error("NOT_FOUND");
            }

            const data = await response.json();
            
            setTimeout(() => {
                this.renderProfile(data);
                ui.setLoading(false);
                ui.notify(`Archive retrieved for ${data.name || input}`);
            }, 600);

        } catch (e) {
            ui.setLoading(false);
            if (e.message === "NOT_FOUND") {
                ui.notify("Traveler not found in the Brume records.", "error");
            } else {
                ui.notify("The archive link is unstable. Try again.", "error");
            }
            document.getElementById('player-profile').style.display = 'none';
        }
    },

    renderProfile(data) {
        const profile = document.getElementById('player-profile');
        profile.style.display = "block";
        
        // Map database fields to the UI
        document.getElementById('p-name').innerText = (data.name || "Unknown").toUpperCase();
        document.getElementById('p-head').src = `https://minotar.net/helm/${data.name || 'steve'}/100.png`;
        document.getElementById('p-level').innerText = `LVL ${data.level || 0}`;
        document.getElementById('p-coins').innerText = (data.coins || 0).toLocaleString();
        document.getElementById('p-xp').innerText = (data.xp || 0).toLocaleString();
        
        const status = document.getElementById('p-status');
        status.innerText = data.online ? "MANIFESTED" : "DRIFTING";
        status.style.color = data.online ? "#55FF55" : "#666";

        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = "";
        
        let items = data.inventory;
        if (typeof items === 'string') items = JSON.parse(items);

        if (items && Array.isArray(items)) {
            items.forEach(item => {
                const slot = document.createElement('div');
                slot.className = "inv-slot";
                if (item.id && item.id !== "AIR") {
                    slot.innerHTML = `
                        <img src="assets/items/${item.id.toLowerCase()}.png" 
                             onerror="this.src='https://minecraft.wiki/images/Invicon_Barrier.png'"
                             title="${item.id}">
                        <span class="amt">${item.amount > 1 ? item.amount : ''}</span>
                    `;
                }
                grid.appendChild(slot);
            });
        }
    }
};
