const mysql = require('mysql2/promise');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const identifier = req.query.uuid; 

    if (!identifier) {
        return res.status(400).json({ error: "No name or UUID provided" });
    }

    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'uk01-sql.pebblehost.com:3306',
            user: 'customer_1108953_MySQL',
            password: 'MscVD=3!ISZ19xnjAUEWSiPz',
            database: 'customer_1108953_MySQL',
            port: 3306
        });

        const query = `SELECT * FROM slashup_stats WHERE name = ? OR uuid = ? LIMIT 1`;
        const [rows] = await connection.query(query, [identifier, identifier]);

        await connection.end();

        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ error: "Player not found" });
        }

    } catch (error) {
        console.error("Database Error:", error);
        if (connection) await connection.end();
        res.status(500).json({ error: error.message });
    }
};
