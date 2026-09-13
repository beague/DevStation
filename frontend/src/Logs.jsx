import { useEffect, useState } from "react";
import "./Logs.css";

function Logs() {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    const loadLogs = async () => {
        try {
            const response = await fetch(
                "${import.meta.env.VITE_API_URL}/api/logs"
            );

            if (!response.ok) {
                throw new Error("Impossible de récupérer les logs");
            }

            const data = await response.json();

            setLogs(
                Array.isArray(data.logs)
                    ? data.logs.map((line) => {
                        const match = line.match(
                            /^\[(.*?)\]\s+\[(.*?)\]\s+(.*)$/
                        );

                        if (match) {
                            return {
                                time: new Date(match[1]).toLocaleTimeString(),
                                level: match[2].toUpperCase(),
                                message: match[3]
                            };
                        }

                        return {
                            time: "",
                            level: "INFO",
                            message: line
                        };
                    })
                    : []
            );
        } catch (error) {
            console.error("Erreur logs :", error);

            setLogs([
                {
                    time: new Date().toLocaleTimeString(),
                    level: "ERROR",
                    message: error.message
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const clearLogs = async () => {
        try {
            const response = await fetch(
                "${import.meta.env.VITE_API_URL}/api/logs",
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error("Impossible de vider les logs");
            }

            setLogs([]);
        } catch (error) {
            console.error("Erreur suppression logs :", error);
        }
    };

    useEffect(() => {
        loadLogs();

        const interval = setInterval(() => {
            loadLogs();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const filteredLogs =
        filter === "ALL"
            ? logs
            : logs.filter(
                (log) => log.level === filter
            );

    return (
        <div className="logs-page">
            <div className="logs-header">
                <div>
                    <h1>📋 Logs</h1>
                    <p>
                        Journal des événements de DevStation
                    </p>
                </div>

                <div className="logs-actions">
                    <select
                        value={filter}
                        onChange={(e) =>
                            setFilter(e.target.value)
                        }
                    >
                        <option value="ALL">Tous</option>
                        <option value="INFO">Info</option>
                        <option value="WARN">Warn</option>
                        <option value="ERROR">Error</option>
                    </select>

                    <button onClick={loadLogs}>
                        🔄 Actualiser
                    </button>

                    <button onClick={clearLogs}>
                        🗑️ Vider
                    </button>
                </div>
            </div>

            <div className="logs-container">
                {loading ? (
                    <div className="logs-empty">
                        Chargement des logs...
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="logs-empty">
                        Aucun log à afficher
                    </div>
                ) : (
                    filteredLogs.map((log, index) => (
                        <div
                            className={`log-line log-${log.level.toLowerCase()}`}
                            key={`${index}-${log.time}-${log.message}`}
                        >
                            <span className="log-time">
                                {log.time
                                    ? `[${log.time}]`
                                    : ""}
                            </span>

                            <span className="log-level">
                                {log.level}
                            </span>

                            <span className="log-message">
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Logs;