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
        if (type === 'leaderboard') {
            const [rows] = await pool.query(
                'SELECT name, level, coins, xp FROM brume_stats ORDER BY level DESC, xp DESC LIMIT 10'
            );
            return res.status(200).json(rows);
        }

        if (type === 'player') {
            if (!uuid) return res.status(400).json({ error: "Missing Name" });
            
            const [rows] = await pool.execute(
                'SELECT * FROM brume_stats WHERE name = ? OR uuid = ? LIMIT 1', 
                [uuid, uuid]
            );

            if (rows.length > 0) {
                const player = rows[0];
                
                if (player.inventory && typeof player.inventory === 'string') {
                    try {
                        const cleanString = player.inventory.replace(/[\x00-\x1F\x7F]/g, (char) => {
                            if (char === '\n' || char === '\t' || char === '\r') return char; 
                            return ''; 
                        });

                        player.inventory = JSON.parse(cleanString);
                        
                    } catch (e) {
                        console.error("JSON Error:", e.message);
                        try {
                            const noColor = player.inventory.replace(/§./g, ""); 
                            player.inventory = JSON.parse(noColor);
                        } catch (e2) {
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
