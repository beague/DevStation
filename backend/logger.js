const fs = require("fs");
const path = require("path");

const LOGS_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOGS_DIR, "devstation.log");

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function log(type, message) {
    const date = new Date().toISOString();

    const line = `[${date}] [${type.toUpperCase()}] ${message}\n`;

    fs.appendFileSync(LOG_FILE, line, "utf8");

    console.log(line.trim());
}

function getLogs() {
    if (!fs.existsSync(LOG_FILE)) {
        return [];
    }

    return fs
        .readFileSync(LOG_FILE, "utf8")
        .split(/\r?\n/)
        .filter(Boolean)
        .reverse();
}

function clearLogs() {
    fs.writeFileSync(LOG_FILE, "", "utf8");
}

module.exports = {
    log,
    getLogs,
    clearLogs,
    LOG_FILE
};