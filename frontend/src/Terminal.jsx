import { useEffect, useRef, useState } from "react";
import "./Terminal.css";

function Terminal() {
    const [command, setCommand] = useState("");
    const [lines, setLines] = useState([
        "DevStation Terminal",
        "Tape une commande pour commencer.",
        ""
    ]);

    const outputRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop =
                outputRef.current.scrollHeight;
        }
    }, [lines]);

    const executeCommand = async () => {
        const currentCommand = command.trim();

        if (!currentCommand) return;

        setLines((current) => [
            ...current,
            `PS> ${currentCommand}`
        ]);

        setCommand("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/terminal/execute`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        command: currentCommand
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erreur du terminal"
                );
            }

            if (data.stdout) {
                setLines((current) => [
                    ...current,
                    ...data.stdout.replace(/\r/g, "").split("\n")
                ]);
            }

            if (data.stderr) {
                setLines((current) => [
                    ...current,
                    ...data.stderr.replace(/\r/g, "").split("\n")
                ]);
            }

            setLines((current) => [
                ...current,
                ""
            ]);
        } catch (error) {
            setLines((current) => [
                ...current,
                `Erreur : ${error.message}`,
                ""
            ]);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            executeCommand();
        }
    };

    const clearTerminal = () => {
        setLines([
            "DevStation Terminal",
            "Terminal effacé.",
            ""
        ]);

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <div className="terminal">
            <div className="terminal-header">
                <span>TERMINAL</span>

                <button
                    onClick={clearTerminal}
                    title="Effacer le terminal"
                >
                    🗑️ Effacer
                </button>
            </div>

            <div
                className="terminal-output"
                ref={outputRef}
            >
                {lines.map((line, index) => (
                    <div key={index}>
                        {line}
                    </div>
                ))}
            </div>

            <div className="terminal-input">
                <span>PS&gt;</span>

                <input
                    ref={inputRef}
                    type="text"
                    value={command}
                    onChange={(event) =>
                        setCommand(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Tape une commande..."
                    autoFocus
                />
            </div>
        </div>
    );
}

export default Terminal;