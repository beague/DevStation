const express = require("express");
const { execFile } = require("child_process");

const router = express.Router();

function runDocker(args) {
    return new Promise((resolve, reject) => {
        execFile("docker", args, (error, stdout, stderr) => {
            if (error) {
                reject(
                    new Error(
                        stderr.trim() ||
                        error.message
                    )
                );

                return;
            }

            resolve(stdout.trim());
        });
    });
}


// =====================================================
// CONTENEURS
// =====================================================

router.get("/containers", async (req, res) => {
    try {
        const output = await runDocker([
            "ps",
            "-a",
            "--format",
            "{{json .}}"
        ]);

        if (!output) {
            return res.json([]);
        }

        const containers = output
            .split("\n")
            .map((line) => JSON.parse(line));

        res.json(containers);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de récupérer les conteneurs",
            details: error.message
        });
    }
});


// =====================================================
// IMAGES
// =====================================================

router.get("/images", async (req, res) => {
    try {
        const output = await runDocker([
            "images",
            "--format",
            "{{json .}}"
        ]);

        if (!output) {
            return res.json([]);
        }

        const images = output
            .split("\n")
            .map((line) => JSON.parse(line));

        res.json(images);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de récupérer les images",
            details: error.message
        });
    }
});


// =====================================================
// START
// =====================================================

router.post("/:id/start", async (req, res) => {
    try {
        const output = await runDocker([
            "start",
            req.params.id
        ]);

        res.json({
            message: "Conteneur démarré",
            output
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de démarrer le conteneur",
            details: error.message
        });
    }
});


// =====================================================
// STOP
// =====================================================

router.post("/:id/stop", async (req, res) => {
    try {
        const output = await runDocker([
            "stop",
            req.params.id
        ]);

        res.json({
            message: "Conteneur arrêté",
            output
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible d'arrêter le conteneur",
            details: error.message
        });
    }
});


// =====================================================
// RESTART
// =====================================================

router.post("/:id/restart", async (req, res) => {
    try {
        const output = await runDocker([
            "restart",
            req.params.id
        ]);

        res.json({
            message: "Conteneur redémarré",
            output
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de redémarrer le conteneur",
            details: error.message
        });
    }
});


// =====================================================
// SUPPRIMER
// =====================================================

router.delete("/:id", async (req, res) => {
    try {
        const output = await runDocker([
            "rm",
            req.params.id
        ]);

        res.json({
            message: "Conteneur supprimé",
            output
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de supprimer le conteneur",
            details: error.message
        });
    }
});


// =====================================================
// CREER UN CONTENEUR
// =====================================================

router.post("/containers", async (req, res) => {
    try {
        const {
            name,
            image,
            port
        } = req.body;

        if (!name || !image) {
            return res.status(400).json({
                error: "Le nom et l'image sont obligatoires"
            });
        }

        const args = [
            "create",
            "--name",
            name
        ];

        if (port) {
            args.push(
                "-p",
                port
            );
        }

        args.push(image);

        const output = await runDocker(args);

        const container = await runDocker([
    "inspect",
    "--format",
    "{{json .}}",
    output
]);

res.json({
    message: "Conteneur créé",
    container: JSON.parse(container)
});

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Impossible de créer le conteneur",
            details: error.message
        });
    }
});

module.exports = router;