const express = require("express");
const { exec } = require("child_process");
const { log } = require("./logger");

const router = express.Router();

const isProduction =
    process.env.NODE_ENV === "production";

router.post("/execute", (req, res) => {
    const { command, cwd } = req.body;

    if (!command || !command.trim()) {
        return res.status(400).json({
            error: "Commande vide"
        });
    }

    // Sécurité : le terminal reste disponible en local,
    // mais il est désactivé lorsque le backend est en production.
    if (isProduction) {
        log("warn", `Commande refusée en production : ${command}`);

        return res.status(403).json({
            error: "Terminal désactivé en production"
        });
    }

    const workingDirectory =
        cwd && cwd.trim()
            ? cwd.trim()
            : process.cwd();

    log(
        "info",
        `Commande exécutée : ${command}`
    );

    exec(
        command,
        {
            cwd: workingDirectory,
            windowsHide: true,
            timeout: 30000,
            maxBuffer: 1024 * 1024
        },
        (error, stdout, stderr) => {
            if (error) {
                log(
                    "error",
                    `Erreur commande "${command}" : ${error.message}`
                );
            } else {
                log(
                    "info",
                    `Commande terminée : ${command}`
                );
            }

            if (stderr) {
                log(
                    "warn",
                    `Terminal stderr : ${stderr.trim()}`
                );
            }

            res.json({
                stdout: stdout || "",
                stderr: stderr || "",
                code: error ? error.code : 0
            });
        }
    );
});

module.exports = router;