// Indexed DB operations

function DBRequestOperations(store) {
    this.store = store;
}

function Operations() {
    /**
     * Add the entity into the database
     * @param payload enitity object that is to be added into the database
     * @returns Promise
     */
    this.add = function(payload) {
        return new Promise((resolve, reject) => {
            let response = this.store.add(payload);
            response.onsuccess = (_event) => {
                resolve(_event.target);
            }
            response.onerror = (_event) => {
                const { code, message, name } = _event.target.error;
                reject({ code, message, name });
            }
        })
    }

    /**
     * Get the specific entity from the database
     * @param id enitity id on which the entity object is retrieved from database.
     * @returns Promise
     */
    this.get = function(id) {
        return new Promise((resolve, reject) => {
            let response = this.store.get(id);
            response.onsuccess = (_event) => {
                resolve(_event.target.result);
            }
            response.onerror = (_event) => {
                const { code, message, name } = _event.target.error;
                reject({ code, message, name });
            }
        })
    }

    /**
     * Get all entities from the database.
     * @returns Promise
     */
    this.getAll = function() {
        return new Promise((resolve, reject) => {
            let response = this.store.getAll();
            response.onsuccess = (_event) => {
                resolve(_event.target.result);
            }
            response.onerror = (_event) => {
                const { code, message, name } = _event.target.error;
                reject({ code, message, name });
            }
        })
    }

    /**
     * Update the entity into the database
     * @param payload enitity object that is to be updated into the database
     * @returns Promise
     */
    this.update = function(payload) {
        return new Promise((resolve, reject) => {
            let response = this.store.put(payload);
            response.onsuccess = (_event) => {
                resolve(_event.target);
            }
            response.onerror = (_event) => {
                console.log(_event);
                const { code, message, name } = _event.target.error;
                reject({ code, message, name });
            }
        })
    }

    /**
     * Remove the entity from the database
     * @param id entity id on which the entity is deleted from the database.
     * @returns Promise
     */
    this.remove = function(id) {
        return new Promise((resolve, reject) => {
            let response = this.store.delete(id);
            response.onsuccess = (_event) => {
                resolve(_event.target);
            }
            response.onerror = (_event) => {
                const { code, message, name } = _event.target.error;
                reject({ code, message, name });
            }
        })
    }
}

DBRequestOperations.prototype = new Operations();
DBRequestOperations.prototype.constructor = DBRequestOperations;

export default DBRequestOperations;