const express = require("express");
const cors = require("cors");
const projectsRouter = require("./projects")
const dockerRouter = require("./docker");
const gitRouter = require("./git");
const databaseRouter = require("./database");
const terminalRouter = require("./terminal");

const { getLogs, clearLogs, log } = require("./logger");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
log("info", "Backend DevStation démarré");
log("info", "Connexion au système de logs réussie");

setTimeout(() => {
    log("info", "Test événement : API opérationnelle");
}, 2000);

setTimeout(() => {
    log("info", "Test événement : système Projects opérationnel");
}, 4000);

setTimeout(() => {
    log("warn", "Test événement : ceci est un avertissement");
}, 6000);
app.use("/api/Projects", projectsRouter)
app.use("/api/docker", dockerRouter)
app.use("/api/git", gitRouter)
app.use("/api/database", databaseRouter)
app.use("/api/terminal", terminalRouter)

app.get("/api/status", (req, res) => {
    res.json({
        status: "online",
        message: "DevStation backend op 🚀"
    });
});

app.get("/api/logs", (req, res) => {
    res.json({
        logs: getLogs()
    });
});

app.delete("/api/logs", (req, res) => {
    clearLogs();

    log("info", "Logs effacés");

    res.json({
        success: true
    });
});

app.listen(PORT, () => {
    console.log(`DevStation API demarree sur http://localhost:${PORT}`);
});