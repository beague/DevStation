const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const router = express.Router();

const DB_DIR = path.join(__dirname, "database");

const fs = require("fs");

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, {
        recursive: true
    });
}

const db = new Database(
    path.join(DB_DIR, "devstation.db")
);

db.pragma("journal_mode = WAL");

router.get("/tables", (req, res) => {
    try {
        const tables = db.prepare(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
            AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `).all();

        res.json(tables);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de récupérer les tables",
            details: error.message
        });
    }
});

router.get("/table/:name", (req, res) => {
    try {
        const tableName = req.params.name;

        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            return res.status(400).json({
                error: "Nom de table invalide"
            });
        }

        const rows = db.prepare(
            `SELECT * FROM "${tableName}"`
        ).all();

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de lire la table",
            details: error.message
        });
    }
});

router.post("/query", (req, res) => {
    try {
        const { sql } = req.body;

        if (!sql || !sql.trim()) {
            return res.status(400).json({
                error: "Requête SQL obligatoire"
            });
        }

        const statement = db.prepare(sql);

        if (statement.reader) {
            const rows = statement.all();

            return res.json({
                type: "rows",
                rows
            });
        }

        const result = statement.run();

        res.json({
            type: "result",
            changes: result.changes,
            lastInsertRowid:
                result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            error: "Erreur SQL",
            details: error.message
        });
    }
});

router.post("/table", (req, res) => {
    try {
        const { name, columns } = req.body;

        if (!name || !columns) {
            return res.status(400).json({
                error: "Nom et colonnes obligatoires"
            });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(name)) {
            return res.status(400).json({
                error: "Nom de table invalide"
            });
        }

        const columnList = columns
            .map((column) => {
                if (
                    !column.name ||
                    !/^[a-zA-Z0-9_]+$/.test(
                        column.name
                    )
                ) {
                    throw new Error(
                        "Nom de colonne invalide"
                    );
                }

                const type =
                    column.type || "TEXT";

                return `"${column.name}" ${type}`;
            })
            .join(", ");

        db.prepare(
            `CREATE TABLE "${name}" (${columnList})`
        ).run();

        res.json({
            message: "Table créée",
            name
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            error: "Impossible de créer la table",
            details: error.message
        });
    }
});

router.delete("/table/:name", (req, res) => {
    try {
        const tableName = req.params.name;

        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            return res.status(400).json({
                error: "Nom de table invalide"
            });
        }

        db.prepare(
            `DROP TABLE "${tableName}"`
        ).run();

        res.json({
            message: "Table supprimée"
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            error: "Impossible de supprimer la table",
            details: error.message
        });
    }
});
module.exports = router;