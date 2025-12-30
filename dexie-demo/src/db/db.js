import Dexie from "dexie";

const db = new Dexie("UserDatabase");

// Bump version → from 2 → 3
db.version(3).stores({
  users: '++id, email, role',
  products: '++id, category, quantity, userId, name, price, discountPercentage', // ← added
  cart: '++id, userId, productId',
  orders: '++id, userId, createdAt'
});

// If you already have data, you can add a migration (optional but recommended):
db.version(3).stores().upgrade(async tx => {
  // Set default 0% for existing products
  await tx.products.toCollection().modify(product => {
    if (product.discountPercentage === undefined) {
      product.discountPercentage = 0;
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