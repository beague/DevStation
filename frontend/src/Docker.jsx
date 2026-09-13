import { useEffect, useState } from "react";
import "./Docker.css";

function Docker() {
    const [containers, setContainers] = useState([]);
    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showCreate, setShowCreate] = useState(false);

    const [containerName, setContainerName] =
        useState("");

    const [containerImage, setContainerImage] =
        useState("");

    const [containerPort, setContainerPort] =
        useState("");


    // =====================================================
    // CHARGER LES CONTENEURS
    // =====================================================

    async function loadContainers() {
        try {
            const response = await fetch(
                "http://localhost:3001/api/docker/containers"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erreur Docker"
                );
            }

            setContainers(data);

        } catch (error) {
            console.error(
                "Erreur conteneurs :",
                error
            );
        }
    }


    // =====================================================
    // CHARGER LES IMAGES
    // =====================================================

    async function loadImages() {
        try {
            const response = await fetch(
                "http://localhost:3001/api/docker/images"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erreur Docker"
                );
            }

            setImages(data);

        } catch (error) {
            console.error(
                "Erreur images :",
                error
            );
        }
    }


    // =====================================================
    // CHARGEMENT INITIAL
    // =====================================================

    async function loadDocker() {
        setLoading(true);

        await Promise.all([
            loadContainers(),
            loadImages()
        ]);

        setLoading(false);
    }


    useEffect(() => {
        loadDocker();
    }, []);


    // =====================================================
    // ACTION CONTENEUR
    // =====================================================

    async function containerAction(id, action) {
        try {
            const response = await fetch(
                `http://localhost:3001/api/docker/${id}/${action}`,
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erreur Docker"
                );
            }

            await loadDocker();

        } catch (error) {
            alert(error.message);
        }
    }


    // =====================================================
    // SUPPRIMER CONTENEUR
    // =====================================================

    async function deleteContainer(id) {
        const confirmed = window.confirm(
            "Supprimer ce conteneur ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3001/api/docker/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erreur Docker"
                );
            }

            await loadDocker();

        } catch (error) {
            alert(error.message);
        }
    }


    // =====================================================
    // CREER CONTENEUR
    // =====================================================

    async function createContainer(event) {
        event.preventDefault();

        const name = containerName.trim();
        const image = containerImage.trim();
        const port = containerPort.trim();

        if (!name || !image) {
            alert(
                "Le nom et l'image sont obligatoires."
            );

            return;
        }

        try {
            const response = await fetch(
                "http://localhost:3001/api/docker/containers",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        image,
                        port
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de créer le conteneur"
                );
            }

            setContainerName("");
            setContainerImage("");
            setContainerPort("");

            setShowCreate(false);

            if (data.container) {
    const container = data.container;

    setContainers((current) => [
        {
            ID: container.Id.substring(0, 12),
            Names: container.Name.replace("/", ""),
            Image: container.Config.Image,
            State: container.State.Status,
            Status: container.State.Status,
        },
        ...current
    ]);
}

await loadImages();

        } catch (error) {
            alert(error.message);
        }
    }


    // =====================================================
    // INTERFACE
    // =====================================================

    return (
        <div className="docker-page">

            {/* HEADER */}

            <div className="docker-header">

                <div>

                    <h1>
                        🐳 Docker
                    </h1>

                    <p>
                        Gestion de tes conteneurs et
                        images Docker
                    </p>

                </div>


                <div>

                    <button
                        onClick={() =>
                            setShowCreate(true)
                        }
                    >
                        ＋ Créer un conteneur
                    </button>

                    <button
                        onClick={loadDocker}
                    >
                        🔄 Actualiser
                    </button>

                </div>

            </div>


            {/* FORMULAIRE CREATION */}

            {showCreate && (
                <form
                    className="docker-create-form"
                    onSubmit={createContainer}
                >

                    <h2>
                        ➕ Nouveau conteneur
                    </h2>


                    <input
                        type="text"
                        placeholder="Nom du conteneur"
                        value={containerName}
                        onChange={(event) =>
                            setContainerName(
                                event.target.value
                            )
                        }
                    />


                    <input
                        type="text"
                        placeholder="Image Docker (ex: node:24)"
                        value={containerImage}
                        onChange={(event) =>
                            setContainerImage(
                                event.target.value
                            )
                        }
                    />


                    <input
                        type="text"
                        placeholder="Port (ex: 3000:3000)"
                        value={containerPort}
                        onChange={(event) =>
                            setContainerPort(
                                event.target.value
                            )
                        }
                    />


                    <div className="docker-create-actions">

                        <button type="submit">
                            🐳 Créer
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setShowCreate(false)
                            }
                        >
                            Annuler
                        </button>

                    </div>

                </form>
            )}


            {/* CONTENEURS */}

            <section className="docker-section">

                <h2>
                    📦 Conteneurs
                </h2>


                {loading ? (
                    <p>
                        Chargement...
                    </p>
                ) : containers.length === 0 ? (
                    <p>
                        Aucun conteneur.
                    </p>
                ) : (

                    <div className="docker-containers">

                        {containers.map(
                            (container) => {

                                const running =
                                    container.State ===
                                    "running";

                                return (
                                    <div
                                        className="docker-container"
                                        key={
                                            container.ID
                                        }
                                    >

                                        <div className="container-info">

                                            <div className="container-name">

                                                <span>
                                                    {running
                                                        ? "🟢"
                                                        : "🔴"}
                                                </span>

                                                <strong>
                                                    {
                                                        container.Names
                                                    }
                                                </strong>

                                            </div>


                                            <p>
                                                Image :{" "}
                                                {
                                                    container.Image
                                                }
                                            </p>


                                            <p>
                                                Statut :{" "}
                                                {
                                                    container.Status
                                                }
                                            </p>

                                        </div>


                                        <div className="container-actions">

                                            {running ? (
                                                <button
                                                    onClick={() =>
                                                        containerAction(
                                                            container.ID,
                                                            "stop"
                                                        )
                                                    }
                                                >
                                                    ■ Stop
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        containerAction(
                                                            container.ID,
                                                            "start"
                                                        )
                                                    }
                                                >
                                                    ▶ Start
                                                </button>
                                            )}


                                            <button
                                                onClick={() =>
                                                    containerAction(
                                                        container.ID,
                                                        "restart"
                                                    )
                                                }
                                            >
                                                ↻ Restart
                                            </button>


                                            <button
                                                onClick={() =>
                                                    deleteContainer(
                                                        container.ID
                                                    )
                                                }
                                            >
                                                🗑 Delete
                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </section>


            {/* IMAGES */}

            <section className="docker-section">

                <h2>
                    🖼️ Images
                </h2>


                {loading ? (
                    <p>
                        Chargement...
                    </p>
                ) : images.length === 0 ? (
                    <p>
                        Aucune image Docker.
                    </p>
                ) : (

                    <div className="docker-images">

                        {images.map((image) => (

                            <div
                                className="docker-image"
                                key={image.ID}
                            >

                                <div className="docker-image-icon">
                                    🐳
                                </div>


                                <div className="docker-image-info">

                                    <strong>
                                        {image.Repository}
                                    </strong>

                                    <span>
                                        Tag : {image.Tag}
                                    </span>

                                    <span>
                                        Taille : {image.Size}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default Docker;