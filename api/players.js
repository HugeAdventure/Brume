import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    const { uuid } = req.query;

    if (!uuid) {
        return res.status(400).json({ error: "UUID is required" });
    }
    
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        
        const [rows] = await connection.execute(
            'SELECT * FROM brume_stats WHERE uuid = ? OR name = ?', 
            [uuid, uuid]
        );

        await connection.end();

        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ error: "Player not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
