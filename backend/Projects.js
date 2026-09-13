const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const router = express.Router();

const PROJECTS_DIR = path.join(__dirname, "projects");

// Créer le dossier projects s'il n'existe pas
if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, {
        recursive: true
    });
}


// =====================================================
// OUTILS
// =====================================================

function sanitizeName(name) {
    return name
        .replace(/[<>:"/\\|?*]/g, "")
        .trim();
}


function getSafeProjectPath(projectId, filePath = "") {
    const projectRoot = path.resolve(
        PROJECTS_DIR,
        projectId
    );

    const targetPath = path.resolve(
        projectRoot,
        filePath
    );

    if (
        targetPath !== projectRoot &&
        !targetPath.startsWith(projectRoot + path.sep)
    ) {
        throw new Error("Chemin invalide");
    }

    return {
        projectRoot,
        targetPath
    };
}


// =====================================================
// GET /api/projects
// LISTE DES PROJETS
// =====================================================

router.get("/", (req, res) => {
    try {
        const projects = fs
            .readdirSync(PROJECTS_DIR, {
                withFileTypes: true
            })
            .filter(item => item.isDirectory())
            .map(item => ({
                id: item.name,
                name: item.name
            }));

        res.json(projects);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de récupérer les projets",
            details: error.message
        });
    }
});


// =====================================================
// POST /api/projects
// CREER UN PROJET
// =====================================================

router.post("/", (req, res) => {
    try {
        const {
            name
        } = req.body;

        if (!name) {
            return res.status(400).json({
                error: "Nom du projet obligatoire"
            });
        }

        const projectName = sanitizeName(name);

        if (!projectName) {
            return res.status(400).json({
                error: "Nom du projet invalide"
            });
        }

        const projectPath = path.join(
            PROJECTS_DIR,
            projectName
        );

        if (fs.existsSync(projectPath)) {
            return res.status(409).json({
                error: "Ce projet existe déjà"
            });
        }

        fs.mkdirSync(projectPath, {
            recursive: true
        });

        // Créer quelques fichiers de base
        fs.writeFileSync(
            path.join(projectPath, "README.md"),
            `# ${projectName}\n`
        );

        res.status(201).json({
            id: projectName,
            name: projectName
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de créer le projet",
            details: error.message
        });
    }
});


// =====================================================
// DELETE /api/projects/:id
// SUPPRIMER UN PROJET
// =====================================================

router.delete("/:id", (req, res) => {
    try {
        const {
            projectRoot
        } = getSafeProjectPath(
            req.params.id
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }

        fs.rmSync(projectRoot, {
            recursive: true,
            force: true
        });

        res.json({
            message: "Projet supprimé"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de supprimer le projet",
            details: error.message
        });
    }
});


// =====================================================
// GET /api/projects/:id/files
// RECUPERER L'ARBORESCENCE
// =====================================================

router.get("/:id/files", (req, res) => {
    try {
        const {
            projectRoot
        } = getSafeProjectPath(
            req.params.id
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }


        function readDirectory(directory, relativePath = "") {
            const items = fs.readdirSync(
                directory,
                {
                    withFileTypes: true
                }
            );

            return items.map(item => {
                const itemPath = path.join(
                    directory,
                    item.name
                );

                const itemRelativePath = path
                    .join(
                        relativePath,
                        item.name
                    )
                    .replace(/\\/g, "/");

                if (item.isDirectory()) {
                    return {
                        name: item.name,
                        path: itemRelativePath,
                        type: "folder",
                        children: readDirectory(
                            itemPath,
                            itemRelativePath
                        )
                    };
                }

                return {
                    name: item.name,
                    path: itemRelativePath,
                    type: "file"
                };
            });
        }


        const files = readDirectory(projectRoot);

        res.json(files);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de récupérer les fichiers",
            details: error.message
        });
    }
});


// =====================================================
// GET /api/projects/:id/file
// LIRE UN FICHIER
// =====================================================

router.get("/:id/file", (req, res) => {
    try {
        const {
            path: filePath
        } = req.query;

        if (!filePath) {
            return res.status(400).json({
                error: "Chemin du fichier obligatoire"
            });
        }

        const {
            projectRoot,
            targetPath
        } = getSafeProjectPath(
            req.params.id,
            filePath
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }

        if (!fs.existsSync(targetPath)) {
            return res.status(404).json({
                error: "Fichier introuvable"
            });
        }

        if (
            !fs.statSync(targetPath).isFile()
        ) {
            return res.status(400).json({
                error: "Ce chemin n'est pas un fichier"
            });
        }

        const content = fs.readFileSync(
            targetPath,
            "utf8"
        );

        res.json({
            path: filePath,
            content
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de lire le fichier",
            details: error.message
        });
    }
});


// =====================================================
// PUT /api/projects/:id/file
// MODIFIER UN FICHIER
// =====================================================

router.put("/:id/file", (req, res) => {
    try {
        const {
            path: filePath,
            content
        } = req.body;

        if (!filePath) {
            return res.status(400).json({
                error: "Chemin du fichier obligatoire"
            });
        }

        const {
            projectRoot,
            targetPath
        } = getSafeProjectPath(
            req.params.id,
            filePath
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }

        if (!fs.existsSync(targetPath)) {
            return res.status(404).json({
                error: "Fichier introuvable"
            });
        }

        if (
            !fs.statSync(targetPath).isFile()
        ) {
            return res.status(400).json({
                error: "Ce chemin n'est pas un fichier"
            });
        }

        fs.writeFileSync(
            targetPath,
            content ?? "",
            "utf8"
        );

        res.json({
            message: "Fichier sauvegardé"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de sauvegarder le fichier",
            details: error.message
        });
    }
});


// =====================================================
// POST /api/projects/:id/file
// CREER UN FICHIER
// =====================================================

router.post("/:id/file", (req, res) => {
    try {
        const {
            path: filePath,
            content = ""
        } = req.body;

        if (!filePath) {
            return res.status(400).json({
                error: "Chemin du fichier obligatoire"
            });
        }

        const {
            projectRoot,
            targetPath
        } = getSafeProjectPath(
            req.params.id,
            filePath
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }

        if (fs.existsSync(targetPath)) {
            return res.status(409).json({
                error: "Ce fichier existe déjà"
            });
        }

        const parentDirectory = path.dirname(
            targetPath
        );

        fs.mkdirSync(parentDirectory, {
            recursive: true
        });

        fs.writeFileSync(
            targetPath,
            content,
            "utf8"
        );

        res.status(201).json({
            message: "Fichier créé",
            path: filePath
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de créer le fichier",
            details: error.message
        });
    }
});


// =====================================================
// POST /api/projects/:id/folder
// CREER UN DOSSIER
// =====================================================

router.post("/:id/folder", (req, res) => {
    try {
        const {
            path: folderPath
        } = req.body;

        if (!folderPath) {
            return res.status(400).json({
                error: "Chemin du dossier obligatoire"
            });
        }

        const {
            projectRoot,
            targetPath
        } = getSafeProjectPath(
            req.params.id,
            folderPath
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }

        if (fs.existsSync(targetPath)) {
            return res.status(409).json({
                error: "Ce dossier existe déjà"
            });
        }

        fs.mkdirSync(
            targetPath,
            {
                recursive: true
            }
        );

        res.status(201).json({
            message: "Dossier créé",
            path: folderPath
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de créer le dossier",
            details: error.message
        });
    }
});


// =====================================================
// POST /api/projects/:id/terminal
// TERMINAL DU PROJET
// =====================================================

router.post("/:id/terminal", (req, res) => {
    try {
        const {
            command
        } = req.body;

        if (!command) {
            return res.status(400).json({
                error: "Commande obligatoire"
            });
        }

        const {
            projectRoot
        } = getSafeProjectPath(
            req.params.id
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }

        const child = spawn(
            command,
            {
                cwd: projectRoot,
                shell: true
            }
        );

        let output = "";
        let errorOutput = "";

        child.stdout.on(
            "data",
            data => {
                output += data.toString();
            }
        );

        child.stderr.on(
            "data",
            data => {
                errorOutput += data.toString();
            }
        );

        child.on(
            "close",
            code => {
                res.json({
                    output,
                    error: errorOutput,
                    code
                });
            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible d'exécuter la commande",
            details: error.message
        });
    }
});


// =====================================================
// DELETE /api/projects/:id/folder
// SUPPRIMER UN DOSSIER
// =====================================================

router.delete("/:id/folder", (req, res) => {
    try {
        const {
            path: folderPath
        } = req.body;

        if (!folderPath) {
            return res.status(400).json({
                error: "Chemin du dossier obligatoire"
            });
        }

        const {
            projectRoot,
            targetPath
        } = getSafeProjectPath(
            req.params.id,
            folderPath
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }

        if (!fs.existsSync(targetPath)) {
            return res.status(404).json({
                error: "Dossier introuvable"
            });
        }

        if (
            !fs.statSync(targetPath).isDirectory()
        ) {
            return res.status(400).json({
                error: "Ce chemin n'est pas un dossier"
            });
        }

        // Empêcher la suppression du dossier racine du projet
        if (
            path.resolve(targetPath) ===
            path.resolve(projectRoot)
        ) {
            return res.status(400).json({
                error: "Impossible de supprimer le dossier du projet"
            });
        }

        fs.rmSync(
            targetPath,
            {
                recursive: true,
                force: true
            }
        );

        res.json({
            message: "Dossier supprimé",
            path: folderPath
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de supprimer le dossier",
            details: error.message
        });
    }
});


// =====================================================
// DELETE /api/projects/:id/file
// SUPPRIMER UN FICHIER
// =====================================================

router.delete("/:id/file", (req, res) => {
    try {
        const {
            path: filePath
        } = req.body;

        if (!filePath) {
            return res.status(400).json({
                error: "Chemin du fichier obligatoire"
            });
        }

        const {
            projectRoot,
            targetPath
        } = getSafeProjectPath(
            req.params.id,
            filePath
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }

        if (!fs.existsSync(targetPath)) {
            return res.status(404).json({
                error: "Fichier introuvable"
            });
        }

        if (
            !fs.statSync(targetPath).isFile()
        ) {
            return res.status(400).json({
                error: "Ce chemin n'est pas un fichier"
            });
        }

        fs.unlinkSync(targetPath);

        res.json({
            message: "Fichier supprimé",
            path: filePath
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de supprimer le fichier",
            details: error.message
        });
    }
});


// =====================================================
// PUT /api/projects/:id/file/rename
// RENOMMER UN FICHIER
// =====================================================

router.put("/:id/file/rename", (req, res) => {
    try {
        const {
            path: filePath,
            newName
        } = req.body;

        if (!filePath || !newName) {
            return res.status(400).json({
                error: "Chemin et nouveau nom obligatoires"
            });
        }

        const {
            projectRoot,
            targetPath
        } = getSafeProjectPath(
            req.params.id,
            filePath
        );

        if (!fs.existsSync(projectRoot)) {
            return res.status(404).json({
                error: "Projet introuvable"
            });
        }

        if (!fs.existsSync(targetPath)) {
            return res.status(404).json({
                error: "Fichier introuvable"
            });
        }

        if (
            !fs.statSync(targetPath).isFile()
        ) {
            return res.status(400).json({
                error: "Ce chemin n'est pas un fichier"
            });
        }

        const safeName = sanitizeName(newName);

        if (!safeName) {
            return res.status(400).json({
                error: "Nouveau nom invalide"
            });
        }

        const newPath = path.join(
            path.dirname(targetPath),
            safeName
        );

        if (fs.existsSync(newPath)) {
            return res.status(409).json({
                error: "Un fichier avec ce nom existe déjà"
            });
        }

        fs.renameSync(
            targetPath,
            newPath
        );

        const newRelativePath = path
            .relative(
                projectRoot,
                newPath
            )
            .replace(/\\/g, "/");

        res.json({
            message: "Fichier renommé",
            oldPath: filePath,
            newPath: newRelativePath
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de renommer le fichier",
            details: error.message
        });
    }
});


// =====================================================
// EXPORT
// =====================================================

module.exports = router;