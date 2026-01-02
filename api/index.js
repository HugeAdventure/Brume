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
                        player.inventory = JSON.parse(player.inventory);
                    } catch (e) {
                        console.error("JSON PARSE CRASHED!");
                        console.error("Error:", e.message);
                        console.error("Bad Data Snippet:", player.inventory.substring(0, 100) + "...");
                        
                        player.inventory = []; 
                    }
                } else if (!player.inventory) {
                    player.inventory = [];
                }
                
                return res.status(200).json(player);
            }
            return res.status(404).json({ error: "Player not found" });
        }

    } catch (error) {
        console.error("DB Error:", error);
        return res.status(500).json({ error: "Database connection failed" });
    }
};
