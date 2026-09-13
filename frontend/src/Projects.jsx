import { useEffect, useState } from "react";
import DevEditor from "./Editor"

function Projects() {
    const [projects, setProjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("empty")
    const [openedProject, setOpenedProject] = useState(null);

    const loadProjects = async () => {
        try {
            const response = await fetch("${import.meta.env.VITE_API_URL}/api/projects");
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const createProject = async (event) => {
        event.preventDefault();

        if (!name.trim()) return;

        try {
            const response = await fetch(
                "${import.meta.env.VITE_API_URL}/api/projects",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        type,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Impossible de créer le projet");
            }

            setName("");
            setDescription("");
            setType("empty")
            setShowForm(false);

            loadProjects();
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    const deleteProject = async (id) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
                method: "DELETE",
            });

            loadProjects();
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    if (openedProject) {
        return (
            <DevEditor
            project={openedProject}
            />
        );
    }

    return (
        <div className="projects-page">
            <div className="projects-header">
                <div>
                    <h1>Projects</h1>
                    <p>Gère tes projets DevStation</p>
                </div>

                <button
                    className="create"
                    onClick={() => setShowForm(!showForm)}
                >
                    + Nouveau projet
                </button>
            </div>

            {showForm && (
                <form className="project-form" onSubmit={createProject}>
                    <input
                        type="text"
                        placeholder="Nom du projet"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                    />

                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                    >
                        <option value ="empty">projet vide</option>
                        <option value ="javascript">javascript</option>
                        <option value ="node">node.js</option>
                        <option value ="html">html/css</option>
                        <option value ="python">python</option>
                    </select>

                    <button className="create" type="submit">
                        Créer
                    </button>
                </form>
            )}

            <div className="projects-grid">
                {projects.length === 0 ? (
                    <div className="empty-projects">
                        <div>📁</div>
                        <h2>Aucun projet</h2>
                        <p>Crée ton premier projet pour commencer.</p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div 
                        className="project-card"
                        key={project.id}
                        onClick={() => setOpenedProject(project)}
                        >
                            <div className="project-icon">📁</div>

                            <div className="project-info">
                                <h2>{project.name}</h2>
                                <p>
                                    {project.description ||
                                        "Aucune description"}
                                </p>
                            </div>

                            <button
                                className="delete"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    deleteProject(project.id);
                                }}
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Projects;