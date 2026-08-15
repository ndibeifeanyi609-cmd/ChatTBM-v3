// =====================================
// ChatTBM REG-086.41.7
// Forecast Registry
//
// Purpose:
// - Register canonical forecast objects
// - Protect forecast identity
// - Coordinate validation
// - Coordinate lifecycle transitions
// - Provide controlled forecast lookup
// - Isolate storage through persistence adapter
// - Protect persistence boundary
// - Isolate forecasting from intelligence/memory systems
// =====================================
const {
    isValidForecastType
} = require("./ForecastTypes");
const {
    validateForecast
} = require("./ForecastValidator");
const {
    transitionForecast
} = require("./ForecastLifecycle");
const ForecastRegistryPersistence =
    require("./ForecastRegistryPersistence");
// =====================================
// REGISTRY ERROR CODES
// =====================================
const ForecastRegistryErrors =
    Object.freeze({
        FORECAST_REQUIRED:
            "FORECAST_REQUIRED",
        FORECAST_INVALID:
            "FORECAST_INVALID",
        FORECAST_NOT_FOUND:
            "FORECAST_NOT_FOUND",
        FORECAST_ALREADY_REGISTERED:
            "FORECAST_ALREADY_REGISTERED",
        FORECAST_ID_CONFLICT:
            "FORECAST_ID_CONFLICT",
        FORECAST_TYPE_INVALID:
            "FORECAST_TYPE_INVALID",
        FORECAST_LIFECYCLE_INVALID:
            "FORECAST_LIFECYCLE_INVALID",
        FORECAST_UPDATE_INVALID:
            "FORECAST_UPDATE_INVALID",
        PERSISTENCE_ERROR:
            "PERSISTENCE_ERROR"
    });
// =====================================
// REGISTRY
// =====================================
class ForecastRegistry {
    constructor(options = {}) {
        this.persistence =
            options.persistence ||
            new ForecastRegistryPersistence();
    }
    // =====================================
    // CREATE SUCCESS RESULT
    // =====================================
    success(
        forecast,
        extra = {}
    ) {
        return {
            success: true,
            forecast,
            ...extra
        };
    }
    // =====================================
    // CREATE FAILURE RESULT
    // =====================================
    failure(
        code,
        error,
        forecast = null
    ) {
        return {
            success: false,
            code,
            error,
            forecast
        };
    }
    // =====================================
    // REGISTER FORECAST
    // =====================================
    register(forecast) {
        if (!forecast) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_REQUIRED,
                "Forecast object is required."
            );
        }
        // =================================
        // VALIDATE CANONICAL OBJECT
        // =================================
        const validation =
            validateForecast(
                forecast
            );
        if (!validation.valid) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_INVALID,
                "Invalid forecast object.",
                forecast
            );
        }
        // =================================
        // CHECK EXISTING ID
        // =================================
        let existing;
        try {
            existing =
                this.persistence.getById(
                    forecast.id
                );
        }
        catch (error) {
            return this.failure(
                ForecastRegistryErrors
                    .PERSISTENCE_ERROR,
                error.message ||
                "Forecast lookup failed."
            );
        }
        if (existing) {
            // =============================
            // IDEMPOTENT REGISTRATION
            // =============================
            if (
                this.areEquivalent(
                    existing,
                    forecast
                )
            ) {
                return this.success(
                    existing,
                    {
                        registered:
                            false,
                        idempotent:
                            true,
                        code:
                            ForecastRegistryErrors
                                .FORECAST_ALREADY_REGISTERED
                    }
                );
            }
            // =============================
            // IDENTITY CONFLICT
            // =============================
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_ID_CONFLICT,
                `Forecast ID conflict: ${forecast.id}`,
                existing
            );
        }
        // =================================
        // PERSIST
        // =================================
        try {
            const stored =
                this.persistence.save(
                    forecast
                );
            return this.success(
                stored,
                {
                    registered:
                        true,
                    idempotent:
                        false
                }
            );
        }
        catch (error) {
            return this.failure(
                ForecastRegistryErrors
                    .PERSISTENCE_ERROR,
                error.message ||
                "Forecast persistence failed."
            );
        }
    }
    // =====================================
    // GET BY ID
    // =====================================
    getById(id) {
        if (!id) {
            return null;
        }
        try {
            return this.persistence.getById(
                id
            );
        }
        catch (error) {
            console.error(
                "Forecast Registry Lookup Error:",
                error
            );
            return null;
        }
    }
    // =====================================
    // EXISTS
    // =====================================
    exists(id) {
        if (!id) {
            return false;
        }
        try {
            return this.persistence.exists(
                id
            );
        }
        catch (error) {
            console.error(
                "Forecast Registry Exists Error:",
                error
            );
            return false;
        }
    }
    // =====================================
    // GET BY USER
    // =====================================
    getByUser(userId) {
        if (!userId) {
            return [];
        }
        try {
            return this.persistence.getByUser(
                userId
            );
        }
        catch (error) {
            console.error(
                "Forecast Registry User Lookup Error:",
                error
            );
            return [];
        }
    }
    // =====================================
    // GET BY TYPE
    // =====================================
    getByType(type) {
        if (
            !isValidForecastType(
                type
            )
        ) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_TYPE_INVALID,
                `Invalid forecast type: ${type}`
            );
        }
        try {
            return this.persistence.getByType(
                type
            );
        }
        catch (error) {
            return this.failure(
                ForecastRegistryErrors
                    .PERSISTENCE_ERROR,
                error.message ||
                "Forecast type lookup failed."
            );
        }
    }
    // =====================================
    // GET ALL
    // =====================================
    getAll() {
        try {
            return this.persistence.getAll();
        }
        catch (error) {
            console.error(
                "Forecast Registry Get All Error:",
                error
            );
            return [];
        }
    }
    // =====================================
    // COUNT
    // =====================================
    count() {
        try {
            return this.persistence.count();
        }
        catch (error) {
            return 0;
        }
    }
    // =====================================
    // UPDATE FORECAST
    // =====================================
    update(
        id,
        updates = {}
    ) {
        const existing =
            this.getById(id);
        if (!existing) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_NOT_FOUND,
                `Forecast not found: ${id}`
            );
        }
        // =================================
        // PROTECT CANONICAL IDENTITY
        // =================================
        if (
            updates.id !== undefined &&
            updates.id !== existing.id
        ) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_UPDATE_INVALID,
                "Forecast ID cannot be changed.",
                existing
            );
        }
        // =================================
        // PROTECT OWNERSHIP
        // =================================
        if (
            updates.userId !== undefined &&
            updates.userId !== existing.userId
        ) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_UPDATE_INVALID,
                "Forecast userId cannot be changed.",
                existing
            );
        }
        // =================================
        // PROTECT LIFECYCLE
        //
        // Status changes MUST go through
        // transition().
        // =================================
        if (
            updates.status !== undefined &&
            updates.status !== existing.status
        ) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_LIFECYCLE_INVALID,
                "Forecast lifecycle status cannot be changed through update(). Use transition().",
                existing
            );
        }
        // =================================
        // BUILD UPDATED OBJECT
        // =================================
        const updated = {
            ...existing,
            ...updates,
            id:
                existing.id,
            userId:
                existing.userId,
            status:
                existing.status,
            updatedAt:
                new Date().toISOString()
        };
        // =================================
        // VALIDATE RESULT
        // =================================
        const validation =
            validateForecast(
                updated
            );
        if (!validation.valid) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_UPDATE_INVALID,
                "Updated forecast is invalid.",
                existing
            );
        }
        // =================================
        // PERSIST
        // =================================
        try {
            const stored =
                this.persistence.update(
                    id,
                    updated
                );
            return this.success(
                stored
            );
        }
        catch (error) {
            return this.failure(
                ForecastRegistryErrors
                    .PERSISTENCE_ERROR,
                error.message ||
                "Forecast update failed.",
                existing
            );
        }
    }
    // =====================================
    // TRANSITION FORECAST
    // =====================================
    transition(
        id,
        nextState
    ) {
        const existing =
            this.getById(id);
        if (!existing) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_NOT_FOUND,
                `Forecast not found: ${id}`
            );
        }
        // =================================
        // USE CANONICAL LIFECYCLE ENGINE
        // =================================
        const result =
            transitionForecast(
                existing,
                nextState
            );
        if (!result.success) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_LIFECYCLE_INVALID,
                result.error,
                existing
            );
        }
        // =================================
        // VALIDATE RESULT
        // =================================
        const validation =
            validateForecast(
                result.forecast
            );
        if (!validation.valid) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_LIFECYCLE_INVALID,
                "Lifecycle transition produced an invalid forecast.",
                existing
            );
        }
        // =================================
        // PERSIST
        // =================================
        try {
            const stored =
                this.persistence.update(
                    id,
                    result.forecast
                );
            return this.success(
                stored,
                {
                    previousState:
                        result.previousState,
                    currentState:
                        result.currentState
                }
            );
        }
        catch (error) {
            return this.failure(
                ForecastRegistryErrors
                    .PERSISTENCE_ERROR,
                error.message ||
                "Forecast lifecycle persistence failed.",
                existing
            );
        }
    }
    // =====================================
    // DELETE
    // =====================================
    delete(id) {
        if (
            !this.exists(id)
        ) {
            return this.failure(
                ForecastRegistryErrors
                    .FORECAST_NOT_FOUND,
                `Forecast not found: ${id}`
            );
        }
        try {
            this.persistence.delete(
                id
            );
            return {
                success: true,
                deleted: true,
                id
            };
        }
        catch (error) {
            return this.failure(
                ForecastRegistryErrors
                    .PERSISTENCE_ERROR,
                error.message ||
                "Forecast deletion failed."
            );
        }
    }
    // =====================================
    // CLEAR REGISTRY
    // =====================================
    clear() {
        try {
            this.persistence.clear();
            return {
                success: true,
                cleared: true
            };
        }
        catch (error) {
            return this.failure(
                ForecastRegistryErrors
                    .PERSISTENCE_ERROR,
                error.message ||
                "Forecast registry clear failed."
            );
        }
    }
    // =====================================
    // FORECAST EQUIVALENCE
    // =====================================
    areEquivalent(
        first,
        second
    ) {
        if (
            !first ||
            !second
        ) {
            return false;
        }
        // =================================
        // CANONICAL IDENTITY
        // =================================
        if (
            first.id !==
            second.id
        ) {
            return false;
        }
        if (
            first.userId !==
            second.userId
        ) {
            return false;
        }
        // =================================
        // COMPARE STABLE CONTENT
        //
        // Timestamps are intentionally
        // excluded from equivalence.
        // =================================
        const normalize =
            forecast => ({
                id:
                    forecast.id,
                version:
                    forecast.version,
                type:
                    forecast.type,
                userId:
                    forecast.userId,
                input:
                    forecast.input,
                prediction:
                    forecast.prediction,
                signals:
                    forecast.signals,
                status:
                    forecast.status,
                evaluation:
                    forecast.evaluation,
                learning:
                    forecast.learning,
                provenance:
                    forecast.provenance
            });
        return (
            JSON.stringify(
                normalize(first)
            ) ===
            JSON.stringify(
                normalize(second)
            )
        );
    }
}
// =====================================
// EXPORTS
// =====================================
module.exports = {
    ForecastRegistry,
    ForecastRegistryErrors
};
