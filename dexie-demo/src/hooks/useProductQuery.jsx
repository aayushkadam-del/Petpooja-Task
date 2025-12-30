import { useQuery } from '@tanstack/react-query';
import { getProductById, getAllProducts } from '../db/db';

export function useProductQuery(id, options = {}) {
  return useQuery(['product', id], () => getProductById(id), { enabled: !!id, ...options });
}

export function useProductsQuery(options = {}) {
  return useQuery(['products'], getAllProducts, options);
}
