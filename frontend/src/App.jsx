import { useEffect, useState } from "react";
import "./App.css";
import Projects from "./Projects";
import Docker from "./Docker";
import Git from "./git";
import Database from "./Database";
import Logs from "./Logs";
import GlobalTerminal from "./GlobalTerminal";

function App() {
    const [backendStatus, setBackendStatus] =
        useState("connexion...");

    const [page, setPage] =
        useState("dashboard");


    // =====================================================
    // VERIFICATION BACKEND
    // =====================================================

    useEffect(() => {
        fetch("http://localhost:3001/api/status")
            .then((response) => response.json())
            .then((data) => {
                setBackendStatus(data.status);
            })
            .catch(() => {
                setBackendStatus("offline");
            });
    }, []);


    // =====================================================
    // INTERFACE
    // =====================================================

    return (
        <div className="app">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="sidebar">

                <div className="logo">
                    ⚡ DevStation
                </div>


                <nav>

                    <button
                        className={
                            page === "dashboard"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("dashboard")
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        className={
                            page === "projects"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("projects")
                        }
                    >
                        📁 Projects
                    </button>


                    <button
                        className={
                            page === "terminal"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("terminal")
                        }
                    >
                        💻 Terminal
                    </button>


                    <button
                        className={
                            page === "docker"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("docker")
                        }
                    >
                        🐳 Docker
                    </button>


                    <button
                        className={
                            page === "git"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("git")
                        }
                    >
                        🔀 Git
                    </button>


                    <button
                        className={
                            page === "database"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("database")
                        }
                    >
                        🗄️ Database
                    </button>


                    <button
                        className={
                            page === "logs"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("logs")
                        }
                    >
                        📋 Logs
                    </button>

                </nav>


                <button
                    className="settings"
                    onClick={() =>
                        setPage("settings")
                    }
                >
                    ⚙️ Settings
                </button>

            </aside>


            {/* =====================================================
                CONTENU
            ===================================================== */}

            <main className="content">


                {/* =================================================
                    DASHBOARD
                ================================================= */}

                {page === "dashboard" && (
                    <>

                        <header>

                            <div>

                                <h1>
                                    Dashboard
                                </h1>

                                <p>
                                    Bienvenue sur DevStation
                                </p>

                            </div>


                            <div className="status">

                                <span></span>

                                Backend :{" "}
                                {backendStatus}

                            </div>

                        </header>


                        <section className="cards">


                            <div className="card">

                                <h3>
                                    📁 Projects
                                </h3>

                                <strong>
                                    0
                                </strong>

                                <p>
                                    Projets créés
                                </p>

                            </div>


                            <button
                                className="card"
                                onClick={() =>
                                    setPage("docker")
                                }
                            >

                                <h3>
                                    🐳 Docker
                                </h3>

                                <strong>
                                    →
                                </strong>

                                <p>
                                    Gérer les conteneurs
                                </p>

                            </button>


                            <div className="card">

                                <h3>
                                    🔀 Git
                                </h3>

                                <strong>
                                    0
                                </strong>

                                <p>
                                    Repositories
                                </p>

                            </div>


                            <div className="card">

                                <h3>
                                    💻 System
                                </h3>

                                <strong>
                                    Online
                                </strong>

                                <p>
                                    DevStation fonctionne
                                </p>

                            </div>

                        </section>


                        <section className="welcome">

                            <h2>
                                🚀 DevStation est prêt
                            </h2>

                            <p>
                                Ton environnement de
                                développement centralisé.
                            </p>


                            <button
                                className="create"
                                onClick={() =>
                                    setPage("projects")
                                }
                            >
                                + Créer un projet
                            </button>

                        </section>

                    </>
                )}


                {/* =================================================
                    PROJECTS
                ================================================= */}

                {page === "projects" && (
                    <Projects />
                )}


                {/* =================================================
                    TERMINAL
                ================================================= */}

                {page === "terminal" && <GlobalTerminal />}


                {/* =================================================
                    DOCKER
                ================================================= */}

                {page === "docker" && (
                    <Docker />
                )}


                {/* =================================================
                    GIT
                ================================================= */}

                {page === "git" && <Git />}


                {/* =================================================
                    DATABASE
                ================================================= */}

                {page === "database" && <Database />}

                {/* =================================================
                    LOGS
                ================================================= */}

                {page === "logs" && <Logs />}


                {/* =================================================
                    LOGS
                ================================================= */}

                {page === "logs" && (
                    <section className="devstation-page">

                        <h1>
                            📋 Logs
                        </h1>

                        <p>
                            Journaux de DevStation.
                        </p>

                    </section>
                )}


                {/* =================================================
                    SETTINGS
                ================================================= */}

                {page === "settings" && (
                    <section className="devstation-page">

                        <h1>
                            ⚙️ Settings
                        </h1>

                        <p>
                            Paramètres de DevStation.
                        </p>

                    </section>
                )}

            </main>

        </div>
    );
}

export default App;