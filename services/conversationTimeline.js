// =====================================
// ChatTBM V5.9
// Conversation Timeline Engine
// =====================================

class ConversationTimeline {
    constructor() {
        this.timeline = [];
        this.maxEvents = 1000;
    }

    // ============================
    // Add a conversation event
    // ============================
    addEvent({
        userId = "guest",
        role,
        message,
        intent = "general",
        emotion = "neutral",
        topic = "general",
        metadata = {}
    }) {

        const event = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 8),

            timestamp: new Date().toISOString(),

            userId,

            role,

            message,

            intent,

            emotion,

            topic,

            metadata
        };

        this.timeline.push(event);

        if (this.timeline.length > this.maxEvents) {
            this.timeline.shift();
        }

        return event;
    }

    // ============================
    // Get entire timeline
    // ============================
    getTimeline(userId = null) {

        if (!userId) return this.timeline;

        return this.timeline.filter(
            event => event.userId === userId
        );
    }

    // ============================
    // Recent events
    // ============================
    getRecentEvents(userId = null, limit = 20) {

        return this.getTimeline(userId)
            .slice(-limit);
    }

    // ============================
    // Search timeline
    // ============================
    search(keyword, userId = null) {

        keyword = keyword.toLowerCase();

        return this.getTimeline(userId).filter(event =>

            event.message.toLowerCase().includes(keyword) ||

            event.topic.toLowerCase().includes(keyword) ||

            event.intent.toLowerCase().includes(keyword)
        );
    }

    // ============================
    // Events by topic
    // ============================
    getByTopic(topic, userId = null) {

        return this.getTimeline(userId).filter(

            event => event.topic === topic
        );
    }

    // ============================
    // Events by intent
    // ============================
    getByIntent(intent, userId = null) {

        return this.getTimeline(userId).filter(

            event => event.intent === intent
        );
    }

    // ============================
    // Clear user timeline
    // ============================
    clear(userId = null) {

        if (!userId) {
            this.timeline = [];
            return;
        }

        this.timeline = this.timeline.filter(

            event => event.userId !== userId
        );
    }

    // ============================
    // Timeline statistics
    // ============================
    getStats(userId = null) {

        const events = this.getTimeline(userId);

        return {

            totalEvents: events.length,

            userMessages: events.filter(
                e => e.role === "user"
            ).length,

            assistantMessages: events.filter(
                e => e.role === "assistant"
            ).length,

            firstConversation:
                events[0]?.timestamp || null,

            latestConversation:
                events[events.length - 1]?.timestamp || null
        };
    }
}

module.exports = new ConversationTimeline();
