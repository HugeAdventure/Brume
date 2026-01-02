const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'uk01-sql.pebblehost.com',
    user: 'customer_1108953_MySQL',
    password: 'MscVD=3!ISZ19xnjAUEWSiPz', 
    database: 'customer_1108953_MySQL',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { type, uuid } = req.query;

    try {
        // --- 1. LEADERBOARD ---
        if (type === 'leaderboard') {
            const [rows] = await pool.query(
                'SELECT name, level, coins, xp FROM brume_stats ORDER BY level DESC, xp DESC LIMIT 10'
            );
            return res.status(200).json(rows);
        }

        // --- 2. PLAYER ---
        if (type === 'player') {
            if (!uuid) return res.status(400).json({ error: "Missing Name" });
            
            const [rows] = await pool.execute(
                'SELECT * FROM brume_stats WHERE name = ? OR uuid = ? LIMIT 1', 
                [uuid, uuid]
            );

            if (rows.length > 0) {
                const player = rows[0];
                
                // --- ROBUST INVENTORY PARSING ---
                if (player.inventory && typeof player.inventory === 'string') {
                    try {
                        // FIX: Aggressively escape control characters
                        // 1. Replace Backslashes first (to avoid double escaping later)
                        let clean = player.inventory.replace(/\\/g, "\\\\");
                        
                        // 2. Escape Newlines, Tabs, Returns (CRITICAL FIX)
                        clean = clean.replace(/\n/g, "\\n")
                                     .replace(/\r/g, "\\r")
                                     .replace(/\t/g, "\\t");

                        // 3. Remove any other weird non-printable characters (0-31)
                        // But keep the escaped ones we just made
                        clean = clean.replace(/[\x00-\x1F\x7F]/g, "");

                        player.inventory = JSON.parse(clean);
                        
                    } catch (e) {
                        console.error("JSON Error:", e.message);
                        // Fallback: Try stripping ALL Minecraft colors (§x...) and trying again
                        try {
                            // Removes § followed by any character
                            const noColor = player.inventory.replace(/§./g, "")
                                                            .replace(/\n/g, "\\n")
                                                            .replace(/[\x00-\x1F\x7F]/g, "");
                            player.inventory = JSON.parse(noColor);
                        } catch (e2) {
                            console.error("Fatal JSON Parse Fail");
                            player.inventory = [];
                        }
                    }
                } else {
                    player.inventory = [];
                }
                
                return res.status(200).json(player);
            }
            return res.status(404).json({ error: "Player not found" });
        }

        return res.status(400).json({ error: "Invalid Request Type" });

    } catch (error) {
        console.error("DB Error:", error);
        return res.status(500).json({ error: "Database connection failed", details: error.message });
    }
};
