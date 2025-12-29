import Dexie from "dexie"
const db = new Dexie("UserDatabase")
db.version(1).stores({
  users: '++id, email',
  cart: '++id, userId, productId',
  orders: '++id, userId, createdAt'
});

export default db