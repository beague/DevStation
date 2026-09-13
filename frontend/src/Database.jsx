import { useEffect, useState } from "react";
import "./Database.css";

function Database() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] =
        useState(null);
    const [rows, setRows] = useState([]);

    const [sql, setSql] = useState(
        "SELECT * FROM "
    );

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const [showCreateTable, setShowCreateTable] = useState(false);

const [tableName, setTableName] = useState("");

const [columns, setColumns] = useState([
    {
        name: "id",
        type: "INTEGER PRIMARY KEY AUTOINCREMENT"
    }
]);

    async function loadTables() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/database/tables`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de récupérer les tables"
                );
            }

            setTables(data);

        } catch (error) {
            console.error(
                "Erreur Database :",
                error
            );
        }
    }

    async function loadTable(name) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/database/table/${encodeURIComponent(
                    name
                )}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de lire la table"
                );
            }

            setSelectedTable(name);
            setRows(data);

            setSql(
                `SELECT * FROM ${name}`
            );

        } catch (error) {
            alert(error.message);
        }
    }

    async function createTable() {
    if (!tableName.trim()) {
        alert("Entre un nom de table.");
        return;
    }

    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/database/table`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: tableName.trim(),
                    columns
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.details ||
                data.error ||
                "Impossible de créer la table"
            );
        }

        setTableName("");

        setColumns([
            {
                name: "id",
                type: "INTEGER PRIMARY KEY AUTOINCREMENT"
            }
        ]);

        setShowCreateTable(false);

        await loadTables();

    } catch (error) {
        alert(error.message);
    }
}

    async function executeQuery() {
        if (!sql.trim()) {
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/database/query`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        sql
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.details ||
                    data.error ||
                    "Erreur SQL"
                );
            }

            setResult(data);

            await loadTables();

        } catch (error) {
            setResult({
                error: error.message
            });
        }

        setLoading(false);
    }

    useEffect(() => {
        loadTables();
    }, []);

    return (
        <div className="database-page">

            <div className="database-header">

                <div>
                    <h1>🗄️ Database</h1>

                    <p>
                        Gestion de la base SQLite
                        de DevStation
                    </p>
                </div>

                <button
                    onClick={loadTables}
                >
                    🔄 Actualiser
                </button>

            </div>

            <div className="database-layout">

                <aside className="database-sidebar">

                    <h2>
                        📋 Tables
                    </h2>

                    <button
                        className="daatabase-create-table"
                        onClick={() => setShowCreateTable(true)}
                    >
                        ➕ Créer une table
                    </button>

                    {tables.length === 0 ? (
                        <p className="database-empty">
                            Aucune table
                        </p>
                    ) : (
                        <div className="database-tables">

                            {tables.map((table) => (

                                <button
                                    key={table.name}
                                    className={
                                        selectedTable ===
                                        table.name
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() =>
                                        loadTable(
                                            table.name
                                        )
                                    }
                                >
                                    📋 {table.name}
                                </button>

                            ))}

                        </div>
                    )}

                </aside>

                {showCreateTable && (
    <div className="database-modal">

        <div className="database-modal-content">

            <h2>
                ＋ Nouvelle table
            </h2>

            <input
                type="text"
                placeholder="Nom de la table"
                value={tableName}
                onChange={(event) =>
                    setTableName(
                        event.target.value
                    )
                }
            />

            <h3>
                Colonnes
            </h3>

            {columns.map((column, index) => (
                <div
                    className="database-column"
                    key={index}
                >

                    <input
                        type="text"
                        placeholder="Nom"
                        value={column.name}
                        onChange={(event) => {

                            const newColumns =
                                [...columns];

                            newColumns[index] = {
                                ...newColumns[index],
                                name:
                                    event.target.value
                            };

                            setColumns(
                                newColumns
                            );
                        }}
                    />

                    <select
                        value={column.type}
                        onChange={(event) => {

                            const newColumns =
                                [...columns];

                            newColumns[index] = {
                                ...newColumns[index],
                                type:
                                    event.target.value
                            };

                            setColumns(
                                newColumns
                            );
                        }}
                    >
                        <option value="TEXT">
                            TEXT
                        </option>

                        <option value="INTEGER">
                            INTEGER
                        </option>

                        <option value="REAL">
                            REAL
                        </option>

                        <option value="BLOB">
                            BLOB
                        </option>

                        <option value="INTEGER PRIMARY KEY AUTOINCREMENT">
                            INTEGER PRIMARY KEY
                        </option>
                    </select>

                    <button
                        onClick={() => {

                            if (columns.length === 1) {
                                return;
                            }

                            setColumns(
                                columns.filter(
                                    (_, i) =>
                                        i !== index
                                )
                            );
                        }}
                    >
                        🗑
                    </button>

                </div>
            ))}

            <button
                className="database-add-column"
                onClick={() =>
                    setColumns([
                        ...columns,
                        {
                            name: "",
                            type: "TEXT"
                        }
                    ])
                }
            >
                ＋ Ajouter une colonne
            </button>

            <div className="database-modal-actions">

                <button
                    onClick={createTable}
                >
                    ✅ Créer
                </button>

                <button
                    onClick={() =>
                        setShowCreateTable(false)
                    }
                >
                    Annuler
                </button>

            </div>

        </div>

    </div>
)}

                <main className="database-main">

                    <section className="sql-editor">

                        <div className="sql-header">

                            <h2>
                                💻 SQL Editor
                            </h2>

                            <button
                                onClick={
                                    executeQuery
                                }
                                disabled={loading}
                            >
                                ▶ Exécuter
                            </button>

                        </div>

                        <textarea
                            value={sql}
                            onChange={(event) =>
                                setSql(
                                    event.target.value
                                )
                            }
                            spellCheck="false"
                        />

                    </section>

                    {result?.error && (
                        <section className="database-result error">

                            <h2>
                                ❌ Erreur
                            </h2>

                            <p>
                                {result.error}
                            </p>

                        </section>
                    )}

                    {result &&
                        !result.error &&
                        result.type === "result" && (
                            <section className="database-result">

                                <h2>
                                    ✅ Requête exécutée
                                </h2>

                                <p>
                                    Modifications :{" "}
                                    <strong>
                                        {result.changes}
                                    </strong>
                                </p>

                            </section>
                        )}

                    {result &&
                        !result.error &&
                        result.type === "rows" && (
                            <section className="database-result">

                                <div className="database-result-header">

                                    <h2>
                                        📊 Résultats
                                    </h2>

                                    <span>
                                        {result.rows.length} ligne(s)
                                    </span>

                                </div>

                                {result.rows.length ===
                                0 ? (
                                    <p className="database-empty">
                                        Aucun résultat.
                                    </p>
                                ) : (
                                    <div className="database-table-wrapper">

                                        <table>

                                            <thead>
                                                <tr>
                                                    {Object.keys(
                                                        result.rows[0]
                                                    ).map(
                                                        (
                                                            column
                                                        ) => (
                                                            <th
                                                                key={
                                                                    column
                                                                }
                                                            >
                                                                {
                                                                    column
                                                                }
                                                            </th>
                                                        )
                                                    )}
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {result.rows.map(
                                                    (
                                                        row,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                index
                                                            }
                                                        >
                                                            {Object.keys(
                                                                result.rows[0]
                                                            ).map(
                                                                (
                                                                    column
                                                                ) => (
                                                                    <td
                                                                        key={
                                                                            column
                                                                        }
                                                                    >
                                                                        {String(
                                                                            row[
                                                                                column
                                                                            ]
                                                                        )}
                                                                    </td>
                                                                )
                                                            )}
                                                        </tr>
                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>
                                )}

                            </section>
                        )}

                    {selectedTable &&
                        rows.length > 0 && (
                            <section className="database-result">

                                <div className="database-result-header">

                                    <div className="database-result-header">

    <h2>
        📋 {selectedTable}
    </h2>

    <button
        className="database-delete-table"
        onClick={async () => {

            const confirmed = window.confirm(
                `Supprimer la table "${selectedTable}" ?`
            );

            if (!confirmed) {
                return;
            }

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/database/table/${encodeURIComponent(
                        selectedTable
                    )}`,
                    {
                        method: "DELETE"
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.details ||
                        data.error ||
                        "Impossible de supprimer la table"
                    );
                }

                setSelectedTable(null);
                setRows([]);

                await loadTables();

            } catch (error) {
                alert(error.message);
            }
        }}
    >
        🗑️ Supprimer
    </button>

</div>

                                    <span>
                                        {rows.length} ligne(s)
                                    </span>

                                </div>

                                <div className="database-table-wrapper">

                                    <table>

                                        <thead>
                                            <tr>
                                                {Object.keys(
                                                    rows[0]
                                                ).map(
                                                    (
                                                        column
                                                    ) => (
                                                        <th
                                                            key={
                                                                column
                                                            }
                                                        >
                                                            {
                                                                column
                                                            }
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {rows.map(
                                                (
                                                    row,
                                                    index
                                                ) => (
                                                    <tr
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {Object.keys(
                                                            rows[0]
                                                        ).map(
                                                            (
                                                                column
                                                            ) => (
                                                                <td
                                                                    key={
                                                                        column
                                                                    }
                                                                >
                                                                    {String(
                                                                        row[
                                                                            column
                                                                        ]
                                                                    )}
                                                                </td>
                                                            )
                                                        )}
                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </section>
                        )}

                </main>

            </div>

        </div>
    );
}

export default Database;