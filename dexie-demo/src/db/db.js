import Dexie from "dexie"
 const db = new Dexie("UserDatabase")
db.version(1).stores({
    users:"++id, name, email"
});
// ✔ Creates IndexedDB named UserDatabase
// ✔ Table: users
export default db