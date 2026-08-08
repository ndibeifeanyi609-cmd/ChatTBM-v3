// =====================================
// ChatTBM REG-086.38.8
// Forecast Registry Persistence Adapter
//
// Purpose:
// - Provide isolated forecast storage
// - Keep storage mechanics outside Registry
// - Protect stored forecast references
// - Prepare future database adapters
// =====================================
// =====================================
// CLONE FORECAST
// =====================================
function cloneForecast(forecast) {
    if (forecast === null || forecast === undefined) {
        return forecast;
    }
    return JSON.parse(
        JSON.stringify(forecast)
    );
}
// =====================================
// FORECAST REGISTRY PERSISTENCE
// =====================================
class ForecastRegistryPersistence {
    constructor() {
        this.storage = new Map();
    }
    // =====================================
    // SAVE
    // =====================================
    save(forecast) {
        if (!forecast || !forecast.id) {
            throw new Error(
                "Forecast with valid ID is required."
            );
        }
        if (this.storage.has(forecast.id)) {
            throw new Error(
                `Forecast already exists: ${forecast.id}`
            );
        }
        this.storage.set(
            forecast.id,
            cloneForecast(forecast)
        );
        return cloneForecast(forecast);
    }
    // =====================================
    // GET BY ID
    // =====================================
    getById(id) {
        if (!id) {
            return null;
        }
        const forecast =
            this.storage.get(id);
        if (!forecast) {
            return null;
        }
        return cloneForecast(forecast);
    }
    // =====================================
    // EXISTS
    // =====================================
    exists(id) {
        return this.storage.has(id);
    }
    // =====================================
    // GET BY USER
    // =====================================
    getByUser(userId) {
        if (!userId) {
            return [];
        }
        const results = [];
        for (
            const forecast of this.storage.values()
        ) {
            if (
                forecast.userId === userId
            ) {
                results.push(
                    cloneForecast(forecast)
                );
            }
        }
        return results;
    }
    // =====================================
    // GET BY TYPE
    // =====================================
    getByType(type) {
        if (!type) {
            return [];
        }
        const results = [];
        for (
            const forecast of this.storage.values()
        ) {
            if (
                forecast.type === type
            ) {
                results.push(
                    cloneForecast(forecast)
                );
            }
        }
        return results;
    }
    // =====================================
    // GET ALL
    // =====================================
    getAll() {
        return Array.from(
            this.storage.values()
        ).map(
            forecast =>
                cloneForecast(forecast)
        );
    }
    // =====================================
    // COUNT
    // =====================================
    count() {
        return this.storage.size;
    }
    // =====================================
    // UPDATE
    // =====================================
    update(id, forecast) {
        if (!id) {
            throw new Error(
                "Forecast ID is required."
            );
        }
        if (!this.storage.has(id)) {
            throw new Error(
                `Forecast not found: ${id}`
            );
        }
        if (
            !forecast ||
            forecast.id !== id
        ) {
            throw new Error(
                "Forecast identity does not match update ID."
            );
        }
        this.storage.set(
            id,
            cloneForecast(forecast)
        );
        return cloneForecast(forecast);
    }
    // =====================================
    // DELETE
    // =====================================
    delete(id) {
        return this.storage.delete(id);
    }
    // =====================================
    // CLEAR
    // =====================================
    clear() {
        this.storage.clear();
    }
}
// =====================================
// EXPORT
// =====================================
module.exports =
    ForecastRegistryPersistence;
