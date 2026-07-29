// =====================================
// ChatTBM V5.9
// Relationship Engine
// =====================================

class RelationshipEngine {

    constructor() {

        this.relationships = [];

    }

    // =====================================
    // Create Relationship
    // =====================================

    addRelationship({

        source,

        relation,

        target,

        confidence = 1.0

    }) {

        const exists = this.relationships.find(

            item =>

                item.source === source &&

                item.relation === relation &&

                item.target === target

        );

        if (exists) return exists;

        const relationship = {

            id:

                Date.now().toString() +

                Math.random().toString(36).slice(2, 8),

            source,

            relation,

            target,

            confidence,

            createdAt: new Date().toISOString()

        };

        this.relationships.push(relationship);

        return relationship;

    }

    // =====================================
    // Auto Learn From Event
    // =====================================

    learn(event) {

        if (!event || !event.message) return;

        const text = event.message.toLowerCase();

        // User owns project

        if (text.includes("chattbm")) {

            this.addRelationship({

                source: event.userId,

                relation: "owns",

                target: "ChatTBM"

            });

        }

        // File editing

        const files = event.message.match(

            /\b[\w-]+\.(js|json|html|css|env)\b/gi

        );

        if (files) {

            files.forEach(file => {

                this.addRelationship({

                    source: event.userId,

                    relation: "editing",

                    target: file

                });

            });

        }

        // Building

        if (

            text.includes("build") ||

            text.includes("develop")

        ) {

            this.addRelationship({

                source: event.userId,

                relation: "building",

                target: event.topic || "project"

            });

        }

        // Continue task

        if (

            text.includes("continue")

        ) {

            this.addRelationship({

                source: event.userId,

                relation: "continuing",

                target: event.topic || "conversation"

            });

        }

    }

    // =====================================
    // Find Relationships
    // =====================================

    find(source) {

        return this.relationships.filter(

            item => item.source === source

        );

    }

    // =====================================
    // Find By Relation
    // =====================================

    findRelation(relation) {

        return this.relationships.filter(

            item => item.relation === relation

        );

    }

    // =====================================
    // Find Connected Node
    // =====================================

    connectedTo(target) {

        return this.relationships.filter(

            item => item.target === target

        );

    }

    // =====================================
    // All Relationships
    // =====================================

    getAll() {

        return this.relationships;

    }

    // =====================================
    // Statistics
    // =====================================

    getStats() {

        return {

            totalRelationships:

                this.relationships.length,

            relationshipTypes:

                [

                    ...new Set(

                        this.relationships.map(

                            r => r.relation

                        )

                    )

                ]

        };

    }

    // =====================================
    // Clear
    // =====================================

    clear() {

        this.relationships = [];

    }

}

module.exports = new RelationshipEngine();
