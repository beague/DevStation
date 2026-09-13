import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import "./Editor.css";
import Terminal from "./Terminal";

function DevEditor({ project }) {
    const [files, setFiles] = useState([]);
    const [openFiles, setOpenFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);

    const [showCreateFile, setShowCreateFile] = useState(false);
    const [newFileName, setNewFileName] = useState("");

    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    const [contextMenu, setContextMenu] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState({});


    // =====================================================
    // CHARGER LES FICHIERS
    // =====================================================

    useEffect(() => {
        loadFiles();
    }, [project]);


    // =====================================================
    // RACCOURCIS CLAVIER
    // =====================================================

    useEffect(() => {
        function handleKeyboard(event) {
            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "s"
            ) {
                event.preventDefault();
                saveFile();
            }

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "w"
            ) {
                event.preventDefault();

                if (activeFile) {
                    closeTab(
                        {
                            stopPropagation: () => {}
                        },
                        activeFile
                    );
                }
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyboard
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyboard
            );
        };
    }, [activeFile, content, openFiles]);


    // =====================================================
    // FERMER LE MENU CONTEXTUEL
    // =====================================================

    useEffect(() => {
        function closeContextMenu() {
            setContextMenu(null);
        }

        window.addEventListener(
            "click",
            closeContextMenu
        );

        return () => {
            window.removeEventListener(
                "click",
                closeContextMenu
            );
        };
    }, []);


    // =====================================================
    // CHARGER L'ARBORESCENCE
    // =====================================================

    async function loadFiles() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${project.id}/files`
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    data.error ||
                    "Impossible de charger les fichiers"
                );

                return;
            }

            setFiles(data);
        } catch (error) {
            console.error(
                "Erreur fichiers :",
                error
            );
        }
    }


    // =====================================================
    // OUVRIR UN FICHIER
    // =====================================================

    async function openFile(file) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${project.id}/file?path=${encodeURIComponent(
                    file.path
                )}`
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.error ||
                    "Impossible d'ouvrir le fichier"
                );

                return;
            }

            const existingFile = openFiles.find(
                (item) =>
                    item.path === file.path
            );

            if (!existingFile) {
                setOpenFiles(
                    (currentFiles) => [
                        ...currentFiles,
                        {
                            ...file,
                            content: data.content
                        }
                    ]
                );
            }

            setActiveFile(file.path);
            setContent(data.content);

        } catch (error) {
            console.error(
                "Erreur ouverture :",
                error
            );
        }

        setContextMenu(null);
    }


    // =====================================================
    // CHANGER D'ONGLET
    // =====================================================

    function switchTab(file) {
        const opened = openFiles.find(
            (item) =>
                item.path === file.path
        );

        if (!opened) {
            return;
        }

        setActiveFile(file.path);
        setContent(opened.content);
    }


    // =====================================================
    // MODIFICATION MONACO
    // =====================================================

    function handleEditorChange(value) {
        const newContent = value || "";

        setContent(newContent);

        setOpenFiles(
            (currentFiles) =>
                currentFiles.map(
                    (file) =>
                        file.path === activeFile
                            ? {
                                  ...file,
                                  content: newContent
                              }
                            : file
                )
        );
    }


    // =====================================================
    // SAUVEGARDER
    // =====================================================

    async function saveFile() {
        if (!activeFile) {
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${project.id}/file`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        path: activeFile,
                        content
                    })
                }
            );

            if (!response.ok) {
                const data =
                    await response.json();

                throw new Error(
                    data.error ||
                    "Erreur sauvegarde"
                );
            }

        } catch (error) {
            console.error(
                "Erreur sauvegarde :",
                error
            );

            alert(error.message);

        } finally {
            setSaving(false);
        }
    }


    // =====================================================
    // FERMER UN ONGLET
    // =====================================================

    function closeTab(event, filePath) {
        event.stopPropagation();

        const index =
            openFiles.findIndex(
                (file) =>
                    file.path === filePath
            );

        const newOpenFiles =
            openFiles.filter(
                (file) =>
                    file.path !== filePath
            );

        setOpenFiles(newOpenFiles);

        if (activeFile === filePath) {
            if (newOpenFiles.length === 0) {
                setActiveFile(null);
                setContent("");
            } else {
                const newIndex =
                    Math.max(0, index - 1);

                const nextFile =
                    newOpenFiles[newIndex];

                setActiveFile(
                    nextFile.path
                );

                setContent(
                    nextFile.content
                );
            }
        }
    }


    // =====================================================
    // CREER UN FICHIER
    // =====================================================

    async function createFile(event) {
        event.preventDefault();

        const filename =
            newFileName.trim();

        if (!filename) {
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${project.id}/file`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        path: filename,
                        content: ""
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.error ||
                    "Impossible de créer le fichier"
                );

                return;
            }

            setNewFileName("");
            setShowCreateFile(false);

            await loadFiles();

        } catch (error) {
            console.error(
                "Erreur création fichier :",
                error
            );
        }
    }


    // =====================================================
    // CREER UN DOSSIER
    // =====================================================

    async function createFolder(event) {
        event.preventDefault();

        const folderName =
            newFolderName.trim();

        if (!folderName) {
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${project.id}/folder`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        path: folderName
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.error ||
                    "Impossible de créer le dossier"
                );

                return;
            }

            setNewFolderName("");
            setShowCreateFolder(false);

            await loadFiles();

        } catch (error) {
            console.error(
                "Erreur création dossier :",
                error
            );
        }
    }


    // =====================================================
    // SUPPRIMER UN FICHIER
    // =====================================================

    async function deleteFile(file) {
        const confirmed =
            window.confirm(
                `Supprimer "${file.name}" ?`
            );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${project.id}/file`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        path: file.path
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.error ||
                    "Impossible de supprimer le fichier"
                );

                return;
            }

            setOpenFiles(
                (currentFiles) =>
                    currentFiles.filter(
                        (openedFile) =>
                            openedFile.path !==
                            file.path
                    )
            );

            if (
                activeFile === file.path
            ) {
                setActiveFile(null);
                setContent("");
            }

            await loadFiles();

        } catch (error) {
            console.error(
                "Erreur suppression fichier :",
                error
            );

            alert(
                "Erreur lors de la suppression"
            );
        }

        setContextMenu(null);
    }


    // =====================================================
    // SUPPRIMER UN DOSSIER
    // =====================================================

    async function deleteFolder(folder) {
        const confirmed =
            window.confirm(
                `Supprimer le dossier "${folder.name}" et tout son contenu ?`
            );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${project.id}/folder`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        path: folder.path
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.error ||
                    "Impossible de supprimer le dossier"
                );

                return;
            }

            // Fermer les fichiers qui étaient
            // dans le dossier supprimé
            setOpenFiles(
                (currentFiles) =>
                    currentFiles.filter(
                        (openedFile) =>
                            !(
                                openedFile.path ===
                                    folder.path ||
                                openedFile.path.startsWith(
                                    folder.path + "/"
                                )
                            )
                    )
            );

            if (
                activeFile === folder.path ||
                (
                    activeFile &&
                    activeFile.startsWith(
                        folder.path + "/"
                    )
                )
            ) {
                setActiveFile(null);
                setContent("");
            }

            setExpandedFolders(
                (current) => {
                    const copy = {
                        ...current
                    };

                    delete copy[folder.path];

                    return copy;
                }
            );

            await loadFiles();

        } catch (error) {
            console.error(
                "Erreur suppression dossier :",
                error
            );

            alert(
                "Erreur lors de la suppression du dossier"
            );
        }

        setContextMenu(null);
    }


    // =====================================================
    // RENOMMER UN FICHIER
    // =====================================================

    async function renameFile(file) {
        const newName =
            window.prompt(
                `Nouveau nom pour "${file.name}" :`,
                file.name
            );

        if (
            !newName ||
            !newName.trim()
        ) {
            return;
        }

        const trimmedName =
            newName.trim();

        if (
            trimmedName === file.name
        ) {
            setContextMenu(null);
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${project.id}/file/rename`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        path: file.path,
                        newName: trimmedName
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.error ||
                    "Impossible de renommer le fichier"
                );

                return;
            }

            const newPath =
                data.newPath;

            setOpenFiles(
                (currentFiles) =>
                    currentFiles.map(
                        (openedFile) =>
                            openedFile.path ===
                            file.path
                                ? {
                                      ...openedFile,
                                      name: trimmedName,
                                      path: newPath
                                  }
                                : openedFile
                    )
            );

            if (
                activeFile === file.path
            ) {
                setActiveFile(
                    newPath
                );
            }

            await loadFiles();

        } catch (error) {
            console.error(
                "Erreur renommage :",
                error
            );

            alert(
                "Erreur lors du renommage"
            );
        }

        setContextMenu(null);
    }


    // =====================================================
    // OUVRIR / FERMER UN DOSSIER
    // =====================================================

    function toggleFolder(folderPath) {
        setExpandedFolders(
            (current) => ({
                ...current,
                [folderPath]:
                    !current[folderPath]
            })
        );
    }


    // =====================================================
    // LANGUAGE MONACO
    // =====================================================

    function getLanguage(filename) {
        if (filename.endsWith(".js")) {
            return "javascript";
        }

        if (filename.endsWith(".jsx")) {
            return "javascript";
        }

        if (filename.endsWith(".ts")) {
            return "typescript";
        }

        if (filename.endsWith(".tsx")) {
            return "typescript";
        }

        if (filename.endsWith(".html")) {
            return "html";
        }

        if (filename.endsWith(".css")) {
            return "css";
        }

        if (filename.endsWith(".json")) {
            return "json";
        }

        if (filename.endsWith(".py")) {
            return "python";
        }

        if (filename.endsWith(".md")) {
            return "markdown";
        }

        if (filename.endsWith(".xml")) {
            return "xml";
        }

        return "plaintext";
    }


    // =====================================================
    // ARBORESCENCE
    // =====================================================

    function renderFiles(
        items,
        level = 0
    ) {
        return items.map((file) => {
            const isFolder =
                file.type === "folder" ||
                file.type === "directory";

            if (isFolder) {
                const expanded =
                    expandedFolders[
                        file.path
                    ];

                return (
                    <div
                        key={file.path}
                        className="file-tree-item"
                    >
                        <button
                            className="folder"
                            style={{
                                paddingLeft:
                                    `${level * 14 + 6}px`
                            }}
                            onClick={() =>
                                toggleFolder(
                                    file.path
                                )
                            }
                            onContextMenu={(
                                event
                            ) => {
                                event.preventDefault();

                                setContextMenu({
                                    x: event.clientX,
                                    y: event.clientY,
                                    file
                                });
                            }}
                        >
                            {expanded
                                ? "📂"
                                : "📁"}{" "}
                            {file.name}
                        </button>

                        {expanded &&
                            file.children && (
                                <div className="folder-children">
                                    {renderFiles(
                                        file.children,
                                        level + 1
                                    )}
                                </div>
                            )}
                    </div>
                );
            }

            return (
                <div
                    key={file.path}
                    className="file-tree-item"
                >
                    <button
                        className={`file ${
                            activeFile ===
                            file.path
                                ? "file-active"
                                : ""
                        }`}
                        style={{
                            paddingLeft:
                                `${level * 14 + 6}px`
                        }}
                        onClick={() =>
                            openFile(file)
                        }
                        onContextMenu={(
                            event
                        ) => {
                            event.preventDefault();

                            setContextMenu({
                                x: event.clientX,
                                y: event.clientY,
                                file
                            });
                        }}
                    >
                        📄 {file.name}
                    </button>
                </div>
            );
        });
    }


    // =====================================================
    // INTERFACE
    // =====================================================

    return (
        <div className="editor-page">

            {/* MENU CONTEXTUEL */}

            {contextMenu && (
                <div
                    className="context-menu"
                    style={{
                        left:
                            contextMenu.x,
                        top:
                            contextMenu.y
                    }}
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >

                    {(
                        contextMenu.file.type ===
                            "file"
                    ) ? (
                        <>
                            <button
                                onClick={() =>
                                    renameFile(
                                        contextMenu.file
                                    )
                                }
                            >
                                ✏️ Renommer
                            </button>

                            <button
                                onClick={() =>
                                    deleteFile(
                                        contextMenu.file
                                    )
                                }
                            >
                                🗑️ Supprimer
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    setNewFolderName(
                                        `${contextMenu.file.path}/`
                                    );

                                    setShowCreateFolder(
                                        true
                                    );

                                    setContextMenu(
                                        null
                                    );
                                }}
                            >
                                📁 Nouveau dossier
                            </button>

                            <button
                                onClick={() => {
                                    setNewFileName(
                                        `${contextMenu.file.path}/`
                                    );

                                    setShowCreateFile(
                                        true
                                    );

                                    setContextMenu(
                                        null
                                    );
                                }}
                            >
                                📄 Nouveau fichier
                            </button>

                            <button
                                onClick={() =>
                                    deleteFolder(
                                        contextMenu.file
                                    )
                                }
                            >
                                🗑️ Supprimer le dossier
                            </button>
                        </>
                    )}

                </div>
            )}


            {/* HEADER */}

            <div className="editor-header">

                <div className="editor-project-name">
                    ⚡ {project.name}
                </div>

                <div className="editor-actions">

                    <button
                        className="new-file-button"
                        onClick={() =>
                            setShowCreateFile(
                                !showCreateFile
                            )
                        }
                    >
                        ＋ Fichier
                    </button>

                    <button
                        className="save-button"
                        onClick={saveFile}
                        disabled={
                            !activeFile ||
                            saving
                        }
                    >
                        {saving
                            ? "Sauvegarde..."
                            : "💾 Sauvegarder"}
                    </button>

                </div>

            </div>


            {/* CONTENU */}

            <div className="editor-layout">

                {/* EXPLORATEUR */}

                <aside className="file-explorer">

                    <div className="explorer-title">
                        EXPLORATEUR
                    </div>

                    <div className="explorer-actions">

                        <button
                            className="explorer-add"
                            onClick={() => {
                                setNewFileName("");
                                setShowCreateFile(
                                    true
                                );
                            }}
                            title="Nouveau fichier"
                        >
                            📄
                        </button>

                        <button
                            className="explorer-add"
                            onClick={() => {
                                setNewFolderName("");
                                setShowCreateFolder(
                                    true
                                );
                            }}
                            title="Nouveau dossier"
                        >
                            📁
                        </button>

                    </div>


                    {/* CREATION FICHIER */}

                    {showCreateFile && (
                        <form
                            className="new-file-form"
                            onSubmit={
                                createFile
                            }
                        >

                            <input
                                autoFocus
                                type="text"
                                placeholder="nom du fichier..."
                                value={
                                    newFileName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setNewFileName(
                                        event.target
                                            .value
                                    )
                                }
                            />

                            <div className="new-file-buttons">

                                <button type="submit">
                                    Créer
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateFile(
                                            false
                                        );
                                        setNewFileName(
                                            ""
                                        );
                                    }}
                                >
                                    Annuler
                                </button>

                            </div>

                        </form>
                    )}


                    {/* CREATION DOSSIER */}

                    {showCreateFolder && (
                        <form
                            className="new-file-form"
                            onSubmit={
                                createFolder
                            }
                        >

                            <input
                                autoFocus
                                type="text"
                                placeholder="nom du dossier..."
                                value={
                                    newFolderName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setNewFolderName(
                                        event.target
                                            .value
                                    )
                                }
                            />

                            <div className="new-file-buttons">

                                <button type="submit">
                                    Créer
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateFolder(
                                            false
                                        );
                                        setNewFolderName(
                                            ""
                                        );
                                    }}
                                >
                                    Annuler
                                </button>

                            </div>

                        </form>
                    )}


                    {/* ARBORESCENCE */}

                    <div className="files">
                        {files.length > 0 ? (
                            renderFiles(files)
                        ) : (
                            <div className="empty-files">
                                Aucun fichier
                            </div>
                        )}
                    </div>

                </aside>


                {/* EDITEUR */}

                <section className="code-area">

                    {/* ONGLETS */}

                    <div className="editor-tabs">

                        {openFiles.map(
                            (file) => (
                                <div
                                    key={
                                        file.path
                                    }
                                    className={`editor-tab ${
                                        activeFile ===
                                        file.path
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        switchTab(
                                            file
                                        )
                                    }
                                >

                                    <span>
                                        📄{" "}
                                        {file.name}
                                    </span>

                                    <button
                                        onClick={(
                                            event
                                        ) =>
                                            closeTab(
                                                event,
                                                file.path
                                            )
                                        }
                                    >
                                        ×
                                    </button>

                                </div>
                            )
                        )}

                    </div>


                    {/* MONACO */}

                    <div className="monaco-container">

                        {activeFile ? (
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                language={getLanguage(
                                    activeFile
                                )}
                                value={content}
                                onChange={
                                    handleEditorChange
                                }
                                options={{
                                    minimap: {
                                        enabled: true
                                    },
                                    fontSize: 14,
                                    automaticLayout: true,
                                    scrollBeyondLastLine:
                                        false,
                                    padding: {
                                        top: 10
                                    }
                                }}
                            />
                        ) : (
                            <div className="no-file">

                                <div>⚡</div>

                                <h2>
                                    DevStation
                                </h2>

                                <p>
                                    Sélectionne un
                                    fichier pour
                                    commencer.
                                </p>

                            </div>
                        )}

                    </div>


                    {/* TERMINAL */}

                    <Terminal
                        project={project}
                    />

                </section>

            </div>

        </div>
    );
}

export default DevEditor;