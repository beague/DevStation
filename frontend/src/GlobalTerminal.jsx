import { useEffect, useRef, useState } from "react";
import "./GlobalTerminal.css";

function GlobalTerminal() {
    const [command, setCommand] = useState("");
    const [lines, setLines] = useState([
        {
            type: "info",
            text: "DevStation Terminal"
        },
        {
            type: "info",
            text: "Terminal global prêt."
        },
        {
            type: "info",
            text: ""
        }
    ]);

    const outputRef = useRef(null);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop =
                outputRef.current.scrollHeight;
        }
    }, [lines]);

    const executeCommand = async () => {
        const currentCommand = command.trim();

        if (!currentCommand) {
            return;
        }

        setLines((current) => [
            ...current,
            {
                type: "command",
                text: `PS> ${currentCommand}`
            }
        ]);

        setCommand("");

        try {
            const response = await fetch(
                "${import.meta.env.VITE_API_URL}/api/terminal/execute",
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
                    {
                        type: "output",
                        text: data.stdout
                    }
                ]);
            }

            if (data.stderr) {
                setLines((current) => [
                    ...current,
                    {
                        type: "error",
                        text: data.stderr
                    }
                ]);
            }

            if (!data.stdout && !data.stderr) {
                setLines((current) => [
                    ...current,
                    {
                        type: "output",
                        text: `Process terminé avec le code ${data.code ?? 0}`
                    }
                ]);
            }

            setLines((current) => [
                ...current,
                {
                    type: "output",
                    text: ""
                }
            ]);
        } catch (error) {
            setLines((current) => [
                ...current,
                {
                    type: "error",
                    text: `Erreur : ${error.message}`
                },
                {
                    type: "output",
                    text: ""
                }
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
        setLines([]);
    };

    return (
        <div className="global-terminal-page">
            <div className="global-terminal-header">
                <div>
                    <h1>💻 Terminal</h1>
                    <p>Terminal global DevStation</p>
                </div>

                <button
                    className="global-terminal-clear"
                    onClick={clearTerminal}
                >
                    🗑️ Effacer
                </button>
            </div>

            <div className="global-terminal-window">
                <div
                    className="global-terminal-output"
                    ref={outputRef}
                >
                    {lines.map((line, index) => (
                        <div
                            key={index}
                            className={`global-terminal-line global-terminal-${line.type}`}
                        >
                            {line.text}
                        </div>
                    ))}
                </div>

                <div className="global-terminal-input">
                    <span>PS&gt;</span>

                    <input
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
        </div>
    );
}

export default GlobalTerminal;