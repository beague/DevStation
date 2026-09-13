import { useEffect, useState } from "react";
import "./git.css";

function Git() {
    const [projectPath, setProjectPath] = useState("");
    const [branch, setBranch] = useState(null);
    const [changes, setChanges] = useState([]);
    const [commits, setCommits] = useState([]);

    const [isRepository, setIsRepository] = useState(false);
    const [loading, setLoading] = useState(false);

    const [commitMessage, setCommitMessage] = useState("");

    const [remote, setRemote] = useState("");
    const [remoteUrl, setRemoteUrl] = useState("");

    async function loadGit() {
        if (!projectPath.trim()) {
            return;
        }

        setLoading(true);

        try {
            const statusResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/api/git/status?path=${encodeURIComponent(
                    projectPath
                )}`
            );

            const statusData =
                await statusResponse.json();

            setIsRepository(
                statusData.isRepository
            );

            setBranch(statusData.branch);
            setChanges(statusData.changes || []);

            if (statusData.isRepository) {
                const commitsResponse =
                    await fetch(
                        `${import.meta.env.VITE_API_URL}/api/git/commits?path=${encodeURIComponent(
                            projectPath
                        )}`
                    );

                const commitsData =
                    await commitsResponse.json();

                setCommits(
                    Array.isArray(commitsData)
                        ? commitsData
                        : []
                );
            } else {
                setCommits([]);
            }

        } catch (error) {
            console.error(
                "Erreur Git :",
                error
            );
        }

        const remoteResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/api/git/remote?path=${encodeURIComponent(
        projectPath
    )}`
);

const remoteData =
    await remoteResponse.json();

setRemote(remoteData.remote || "");

        setLoading(false);
    }

    useEffect(() => {
        loadGit();
    }, []);

    async function initGit() {
        if (!projectPath.trim()) {
            alert(
                "Entre le chemin du projet."
            );
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/git/init`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        path: projectPath
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible d'initialiser Git"
                );
            }

            alert(
                "Repository Git initialisé !"
            );

            await loadGit();

        } catch (error) {
            alert(error.message);
        }
    }

    async function createCommit() {
        if (!commitMessage.trim()) {
            alert(
                "Entre un message de commit."
            );
            return;
        }

        if (!projectPath.trim()) {
            alert(
                "Entre le chemin du projet."
            );
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/git/commit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        path: projectPath,
                        message:
                            commitMessage.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de créer le commit"
                );
            }

            setCommitMessage("");

            await loadGit();

        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <div className="git-page">

            <div className="git-header">

                <div>
                    <h1>🔀 Git</h1>

                    <p>
                        Gestion Git de tes projets
                    </p>
                </div>

                <button
                    onClick={loadGit}
                >
                    🔄 Actualiser
                </button>

            </div>

            <section className="git-project">

                <h2>
                    📁 Projet
                </h2>

                <div className="git-path">

                    <input
                        type="text"
                        placeholder="C:\chemin\vers\ton\projet"
                        value={projectPath}
                        onChange={(event) =>
                            setProjectPath(
                                event.target.value
                            )
                        }
                    />

                    <button
                        onClick={loadGit}
                    >
                        Vérifier
                    </button>

                </div>

            </section>

            {projectPath && (
                <>
                    <section className="git-status">

                        <div className="git-status-card">

                            <span>
                                🌿 Branche
                            </span>

                            <strong>
                                {branch || "Aucune"}
                            </strong>

                        </div>

                        <div className="git-status-card">

                            <span>
                                📄 Modifications
                            </span>

                            <strong>
                                {changes.length}
                            </strong>

                        </div>

                        <div className="git-status-card">

                            <span>
                                🕘 Commits
                            </span>

                            <strong>
                                {commits.length}
                            </strong>

                        </div>

                    </section>

                    {!loading &&
                        !isRepository && (
                            <section className="git-init">

                                <h2>
                                    📦 Aucun repository Git
                                </h2>

                                <p>
                                    Ce projet n'est pas
                                    encore initialisé avec Git.
                                </p>

                                <button
                                    onClick={initGit}
                                >
                                    + Initialiser Git
                                </button>

                            </section>
                        )}

                    {isRepository && (
                        <>
                            <section className="git-section">

                                <div className="git-section-header">

                                    <h2>
                                        🟡 Modifications
                                    </h2>

                                </div>

                                {changes.length === 0 ? (
                                    <p className="git-empty">
                                        Aucune modification.
                                    </p>
                                ) : (
                                    <div className="git-changes">

                                        {changes.map(
                                            (change, index) => (
                                                <div
                                                    className="git-change"
                                                    key={index}
                                                >
                                                    {change}
                                                </div>
                                            )
                                        )}

                                    </div>
                                )}

                            </section>

                            <section className="git-section">

                                <h2>
                                    💾 Commit
                                </h2>

                                <div className="git-commit">

                                    <input
                                        type="text"
                                        placeholder="Message du commit..."
                                        value={
                                            commitMessage
                                        }
                                        onChange={(event) =>
                                            setCommitMessage(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key ===
                                                "Enter"
                                            ) {
                                                createCommit();
                                            }
                                        }}
                                    />

                                    <button
                                        onClick={
                                            createCommit
                                        }
                                    >
                                        💾 Commit
                                    </button>

                                </div>

                            </section>

                            <section className="git-section">

    <h2>
        ☁️ Synchronisation
    </h2>

    <div className="git-sync">

        <button
            onClick={async () => {
                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/git/pull`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                path: projectPath
                            })
                        }
                    );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            "Pull impossible"
                        );
                    }

                    alert(
                        data.output ||
                        "Pull terminé"
                    );

                    await loadGit();

                } catch (error) {
                    alert(error.message);
                }
            }}
        >
            ⬇️ Pull
        </button>


        <section className="git-section">

    <h2>
        ☁️ Remote
    </h2>

    {remote ? (
        <div className="git-remote">

            <code>
                {remote}
            </code>

        </div>
    ) : (
        <>
            <p className="git-empty">
                Aucun remote configuré.
            </p>

            <div className="git-commit">

                <input
                    type="text"
                    placeholder="https://github.com/utilisateur/projet.git"
                    value={remoteUrl}
                    onChange={(event) =>
                        setRemoteUrl(
                            event.target.value
                        )
                    }
                />

                <button
                    onClick={async () => {

                        if (!remoteUrl.trim()) {
                            alert(
                                "Entre l'URL du repository."
                            );
                            return;
                        }

                        try {
                            const response =
                                await fetch(
                                    `${import.meta.env.VITE_API_URL}/api/git/remote`,
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },
                                        body: JSON.stringify({
                                            path: projectPath,
                                            url: remoteUrl.trim()
                                        })
                                    }
                                );

                            const data =
                                await response.json();

                            if (!response.ok) {
                                throw new Error(
                                    data.error ||
                                    "Impossible d'ajouter le remote"
                                );
                            }

                            setRemoteUrl("");

                            await loadGit();

                        } catch (error) {
                            alert(
                                error.message
                            );
                        }
                    }}
                >
                    ☁️ Ajouter
                </button>

            </div>
        </>
    )}

</section>

        <button
            onClick={async () => {
                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/git/push`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                path: projectPath
                            })
                        }
                    );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            "Push impossible"
                        );
                    }

                    alert(
                        data.output ||
                        "Push terminé"
                    );

                    await loadGit();

                } catch (error) {
                    alert(error.message);
                }
            }}
        >
            ⬆️ Push
        </button>

    </div>

</section>

                            <section className="git-section">

                                <h2>
                                    🕘 Derniers commits
                                </h2>

                                {commits.length === 0 ? (
                                    <p className="git-empty">
                                        Aucun commit.
                                    </p>
                                ) : (
                                    <div className="git-commits">

                                        {commits.map(
                                            (commit) => (
                                                <div
                                                    className="git-commit-item"
                                                    key={
                                                        commit.hash
                                                    }
                                                >

                                                    <div>
                                                        <strong>
                                                            {
                                                                commit.message
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                commit.author
                                                            }{" "}
                                                            •{" "}
                                                            {
                                                                commit.date
                                                            }
                                                        </span>
                                                    </div>

                                                    <code>
                                                        {
                                                            commit.hash
                                                        }
                                                    </code>

                                                </div>
                                            )
                                        )}

                                    </div>
                                )}

                            </section>
                        </>
                    )}
                </>
            )}

        </div>
    );
}

export default Git;