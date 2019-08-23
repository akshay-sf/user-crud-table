// This file used Web based IndexedDB for underlying database.
import DBRequestOperations from './db.operations.js';

class DatabaseConfig {
    
    open = (dbName, version) => {
        this.response = window.indexedDB.open(dbName, version);
        return this;
    }

    generateInstance = () => {
        return new Promise((resolve, reject) => {
            var userStore, transaction;

            this.response.onupgradeneeded = (_event) => {
                this.db = _event.target.result;
                // Create an objectStore to hold information about our users.
                userStore = this.db.createObjectStore('users', { keyPath: 'id' });

                // Create an index to search users by name.
                // nameIndex = userStore.createIndex('first_name', 'first_name', { unique: false });

                // Create an index to search users by email. We want to ensure that
                // no two users have the same email, so use a unique index.
                // emailIndex = userStore.createIndex('email', 'email', { unique: true });

                // Use transaction oncomplete to make sure the objectStore creation is 
                // finished before adding data into it.
                userStore.transaction.oncomplete = function (_event) {
                    console.log('objectStore creation successful');
                }
            }

            this.response.onerror = function (_event) {
                console.log('DB Request Error -> ', _event.target.error);
                reject(new Error(_event.target.error));
            }

            this.response.onsuccess = (_event) => {
                this.db = this.response.result;
                transaction = this.db.transaction(['users'], 'readwrite');
                userStore = transaction.objectStore('users');
                let dbReqOperations = new DBRequestOperations(userStore);
                resolve(dbReqOperations);

                userStore.transaction.oncomplete = function (_event) {
                    console.log('Transaction finished', _event);
                }
                // nameIndex = userStore.index('first_name');
                // emailIndex = userStore.index('email');
            }
        });
    }

    createTransaction = () => {
        let transaction = this.db.transaction(['users'], 'readwrite');
        let store = transaction.objectStore('users');
        store.transaction.oncomplete = function (_event) {
            console.log('Transaction finished', _event);
        }
        return new DBRequestOperations(store);
    }
}

export default new DatabaseConfig();