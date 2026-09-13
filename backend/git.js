const express = require("express");
const { execFile } = require("child_process");

const router = express.Router();

function runGit(args, cwd) {
    return new Promise((resolve, reject) => {
        execFile(
            "git",
            args,
            {
                cwd,
                windowsHide: true
            },
            (error, stdout, stderr) => {
                if (error) {
                    reject(
                        new Error(
                            stderr.trim() ||
                            stdout.trim() ||
                            error.message
                        )
                    );

                    return;
                }

                resolve(stdout.trim());
            }
        );
    });
}


// =====================================================
// INFORMATIONS DU REPOSITORY
// =====================================================

router.get("/status", async (req, res) => {
    try {
        const {
            path: projectPath
        } = req.query;

        if (!projectPath) {
            return res.status(400).json({
                error: "Chemin du projet obligatoire"
            });
        }

        const branch = await runGit(
            [
                "branch",
                "--show-current"
            ],
            projectPath
        );

        const status = await runGit(
            [
                "status",
                "--short"
            ],
            projectPath
        );

        res.json({
            isRepository: true,
            branch: branch || "HEAD",
            changes: status
                ? status.split("\n")
                : []
        });

    } catch (error) {
        res.json({
            isRepository: false,
            branch: null,
            changes: []
        });
    }
});


// =====================================================
// INITIALISER GIT
// =====================================================

router.post("/init", async (req, res) => {
    try {
        const {
            path: projectPath
        } = req.body;

        if (!projectPath) {
            return res.status(400).json({
                error: "Chemin du projet obligatoire"
            });
        }

        const output = await runGit(
            ["init"],
            projectPath
        );

        res.json({
            message: "Repository Git initialisé",
            output
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible d'initialiser Git",
            details: error.message
        });
    }
});


// =====================================================
// COMMITS
// =====================================================

router.get("/commits", async (req, res) => {
    try {
        const {
            path: projectPath
        } = req.query;

        if (!projectPath) {
            return res.status(400).json({
                error: "Chemin du projet obligatoire"
            });
        }

        const output = await runGit(
            [
                "log",
                "-10",
                "--pretty=format:%h|%an|%ad|%s",
                "--date=short"
            ],
            projectPath
        );

        const commits = output
            ? output.split("\n").map((line) => {
                const [
                    hash,
                    author,
                    date,
                    message
                ] = line.split("|");

                return {
                    hash,
                    author,
                    date,
                    message
                };
            })
            : [];

        res.json(commits);

    } catch (error) {
        res.status(500).json({
            error: "Impossible de récupérer les commits",
            details: error.message
        });
    }
});


// =====================================================
// COMMIT
// =====================================================

router.post("/commit", async (req, res) => {
    try {
        const {
            path: projectPath,
            message
        } = req.body;

        if (!projectPath || !message) {
            return res.status(400).json({
                error:
                    "Le chemin et le message sont obligatoires"
            });
        }

        await runGit(
            ["add", "."],
            projectPath
        );

        const output = await runGit(
            [
                "commit",
                "-m",
                message
            ],
            projectPath
        );

        res.json({
            message: "Commit créé",
            output
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de créer le commit",
            details: error.message
        });
    }
});


router.post("/pull", async (req, res) => {
    try {
        const { path: projectPath } = req.body;

        if (!projectPath) {
            return res.status(400).json({
                error: "Chemin du projet obligatoire"
            });
        }

        const output = await runGit(
            ["pull"],
            projectPath
        );

        res.json({
            message: "Pull terminé",
            output
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de faire le pull",
            details: error.message
        });
    }
});

router.post("/push", async (req, res) => {
    try {
        const { path: projectPath } = req.body;

        if (!projectPath) {
            return res.status(400).json({
                error: "Chemin du projet obligatoire"
            });
        }

        const output = await runGit(
            ["push"],
            projectPath
        );

        res.json({
            message: "Push terminé",
            output
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de faire le push",
            details: error.message
        });
    }
});

router.get("/remote", async (req, res) => {
    try {
        const { path: projectPath } = req.query;

        if (!projectPath) {
            return res.status(400).json({
                error: "Chemin du projet obligatoire"
            });
        }

        const output = await runGit(
            ["remote", "-v"],
            projectPath
        );

        res.json({
            remote: output
        });

    } catch (error) {
        res.status(500).json({
            error: "Impossible de récupérer le remote",
            details: error.message
        });
    }
});

router.post("/remote", async (req, res) => {
    try {
        const {
            path: projectPath,
            url
        } = req.body;

        if (!projectPath || !url) {
            return res.status(400).json({
                error:
                    "Le chemin et l'URL sont obligatoires"
            });
        }

        const output = await runGit(
            ["remote", "add", "origin", url],
            projectPath
        );

        res.json({
            message: "Remote ajouté",
            output
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible d'ajouter le remote",
            details: error.message
        });
    }
});

module.exports = router;