import Dexie from "dexie";

const db = new Dexie("UserDatabase");

// Bump version → from 3 → 4
db.version(4).stores({
  users: '++id, email, role',
  products: '++id, category, quantity, userId, name, price, discountPercentage, country', // ← added country
  cart: '++id, userId, productId',
  orders: '++id, userId, createdAt'
});

// Migration for version 4
db.version(4).stores().upgrade(async tx => {
  await tx.products.toCollection().modify(product => {
    if (!product.country) {
      product.country = "India";
    }
  });
});

// Helpers (unchanged for now)
export async function getProductById(id) {
  if (id == null) return null;
  const pid = Number(id);
  return db.products.get(pid);
}

export async function getAllProducts() {
  return db.products.toArray();
}

export default db;