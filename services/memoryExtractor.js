// =====================================
// ChatTBM V5.9
// Memory Extraction Engine
// =====================================

class MemoryExtractor {

    constructor() {

        this.memory = {
            names: [],
            projects: [],
            preferences: [],
            goals: [],
            files: [],
            tasks: [],
            facts: []
        };

    }

    // =====================================
    // Main Memory Extraction
    // =====================================

    extract(event) {

        if (!event || !event.message) return;

        const text = event.message.trim();

        this.extractName(text);
        this.extractProjects(text);
        this.extractPreferences(text);
        this.extractGoals(text);
        this.extractFiles(text);
        this.extractTasks(text);

    }

    // =====================================
    // Name Detection
    // =====================================

    extractName(text) {

        const match = text.match(
            /my name is (.+)|i am (.+)|i'm (.+)/i
        );

        if (match) {

            const name = (
                match[1] ||
                match[2] ||
                match[3]
            ).trim();

            this.saveUnique("names", name);

        }

    }

    // =====================================
    // Project Detection
    // =====================================

    extractProjects(text) {

        const keywords = [
            "project",
            "build",
            "develop",
            "app",
            "website",
            "system",
            "chattbm"
        ];

        keywords.forEach(word => {

            if (text.toLowerCase().includes(word)) {

                this.saveUnique("projects", text);

            }

        });

    }

    // =====================================
    // Preference Detection
    // =====================================

    extractPreferences(text) {

        const keywords = [

            "i like",

            "i love",

            "i prefer",

            "my favorite"

        ];

        keywords.forEach(word => {

            if (text.toLowerCase().includes(word)) {

                this.saveUnique("preferences", text);

            }

        });

    }

    // =====================================
    // Goal Detection
    // =====================================

    extractGoals(text) {

        const keywords = [

            "i want",

            "my goal",

            "my plan",

            "i hope"

        ];

        keywords.forEach(word => {

            if (text.toLowerCase().includes(word)) {

                this.saveUnique("goals", text);

            }

        });

    }

    // =====================================
    // File Detection
    // =====================================

    extractFiles(text) {

        const files = text.match(

            /\b[\w-]+\.(js|json|html|css|env)\b/gi

        );

        if (files) {

            files.forEach(file =>

                this.saveUnique("files", file)

            );

        }

    }

    // =====================================
    // Task Detection
    // =====================================

    extractTasks(text) {

        const keywords = [

            "todo",

            "next",

            "later",

            "continue",

            "fix",

            "upgrade"

        ];

        keywords.forEach(word => {

            if (text.toLowerCase().includes(word)) {

                this.saveUnique("tasks", text);

            }

        });

    }

    // =====================================
    // Save Unique Memory
    // =====================================

    saveUnique(type, value) {

        if (!this.memory[type].includes(value)) {

            this.memory[type].push(value);

        }

    }

    // =====================================
    // Get All Memories
    // =====================================

    getMemory() {

        return this.memory;

    }

    // =====================================
    // Clear Memory
    // =====================================

    clear() {

        this.memory = {

            names: [],
            projects: [],
            preferences: [],
            goals: [],
            files: [],
            tasks: [],
            facts: []

        };

    }

}

module.exports = new MemoryExtractor();
