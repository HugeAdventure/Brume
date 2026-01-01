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
            if (!uuid) return res.status(400).json({ error: "Missing UUID/Name" });
            
            const [rows] = await pool.execute(
                'SELECT * FROM brume_players WHERE name = ? OR uuid = ? LIMIT 1', 
                [uuid, uuid]
            );

            if (rows.length > 0) return res.status(200).json(rows[0]);
            return res.status(404).json({ error: "Player not found" });
        }

        if (type === 'leaderboard') {
            const [rows] = await pool.query(
                'SELECT name, level, coins, xp FROM brume_players ORDER BY level DESC, xp DESC LIMIT 10'
            );
            return res.status(200).json(rows);
        }

        return res.status(400).json({ error: "Invalid type parameter" });

    } catch (error) {
        console.error("DB Error:", error);
        return res.status(500).json({ error: "Database connection failed" });
    }
};
