const PRODUCTS = [
  { id: 'product4', name: 'Bronze Axe Head', price: 75.00, inStock: true }
];

function getStock(id) {
  const stored = localStorage.getItem('stock_' + id);
  return stored === null ? true : stored === 'true';
}

export async function fetchProducts() {
  return PRODUCTS.map(p => ({ ...p, inStock: getStock(p.id) }));
}

export async function fetchProduct(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return null;
  return { ...product, inStock: getStock(id) };
}

export async function updateProductStock(id, inStock) {
  localStorage.setItem('stock_' + id, String(inStock));
}
