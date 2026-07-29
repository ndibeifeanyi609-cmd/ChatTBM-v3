// =====================================
// ChatTBM V5.9
// Memory Ranker
// =====================================

class MemoryRanker {

    constructor() {

        this.thresholds = {

            ignore: 20,

            temporary: 40,

            longTerm: 70,

            permanent: 90

        };

    }

    // =====================================
    // Main Ranking Function
    // =====================================

    rank(memory) {

        if (!memory) return null;

        let score = 0;

        score += this.importance(memory);
        score += this.frequency(memory);
        score += this.relevance(memory);
        score += this.recency(memory);

        score = Math.min(score, 100);

        return {

            score,

            level: this.getLevel(score),

            memory

        };

    }

    // =====================================
    // Importance Score
    // =====================================

    importance(memory) {

        const text = JSON.stringify(memory).toLowerCase();

        let score = 0;

        const importantWords = [

            "name",
            "project",
            "goal",
            "task",
            "remember",
            "important",
            "chattbm",
            "backend",
            "memory",
            "engine"

        ];

        importantWords.forEach(word => {

            if (text.includes(word)) {

                score += 10;

            }

        });

        return Math.min(score, 40);

    }

    // =====================================
    // Frequency Score
    // =====================================

    frequency(memory) {

        if (!memory.count) {

            return 10;

        }

        return Math.min(memory.count * 5, 25);

    }

    // =====================================
    // Relevance Score
    // =====================================

    relevance(memory) {

        const text = JSON.stringify(memory).toLowerCase();

        let score = 0;

        if (text.includes("user")) score += 10;

        if (text.includes("project")) score += 10;

        if (text.includes("file")) score += 10;

        return score;

    }

    // =====================================
    // Recency Score
    // =====================================

    recency(memory) {

        if (!memory.timestamp) {

            return 10;

        }

        const now = Date.now();

        const created = new Date(

            memory.timestamp

        ).getTime();

        const days =

            (now - created) /

            (1000 * 60 * 60 * 24);

        if (days <= 1) return 25;

        if (days <= 7) return 20;

        if (days <= 30) return 15;

        return 5;

    }

    // =====================================
    // Rank Level
    // =====================================

    getLevel(score) {

        if (

            score >= this.thresholds.permanent

        ) {

            return "PERMANENT";

        }

        if (

            score >= this.thresholds.longTerm

        ) {

            return "LONG_TERM";

        }

        if (

            score >= this.thresholds.temporary

        ) {

            return "TEMPORARY";

        }

        return "IGNORE";

    }

    // =====================================
    // Should Save?
    // =====================================

    shouldSave(memory) {

        const result = this.rank(memory);

        return (

            result.level !== "IGNORE"

        );

    }

    // =====================================
    // Batch Ranking
    // =====================================

    rankAll(memories = []) {

        return memories.map(memory =>

            this.rank(memory)

        );

    }

}

module.exports = new MemoryRanker();
