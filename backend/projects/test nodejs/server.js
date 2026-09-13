const express = require("express");

const app = express();
const PORT = 3002;

// Permet de recevoir du JSON
app.use(express.json());

// Route principale
app.get("/", (req, res) => {
    res.send("Serveur Node.js opérationnel !");
});

// API de test
app.get("/api/status", (req, res) => {
    res.json({
        status: "online",
        message: "Le serveur fonctionne correctement 🚀"
    });
});

// Exemple de POST
app.post("/api/message", (req, res) => {
    const { message } = req.body;

    res.json({
        success: true,
        received: message
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});