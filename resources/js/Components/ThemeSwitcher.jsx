import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState("system");

    useEffect(() => {
        // Apply theme based on preference
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else if (theme === "light") {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            // System default
            localStorage.removeItem("theme");
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    }, [theme]);

    useEffect(() => {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            setTheme("system");
        }
    }, []);

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => setTheme("light")}
                className={`px-2 py-1 rounded ${theme === "light" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
            >
                ☀️
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`px-2 py-1 rounded ${theme === "dark" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
            >
                🌙
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`px-2 py-1 rounded ${theme === "system" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
            >
                💻
            </button>
        </div>
    );
}