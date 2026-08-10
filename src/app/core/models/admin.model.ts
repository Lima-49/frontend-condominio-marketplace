/** GET /admin/metrics/users-by-condominium — todos os condominios, mesmo com 0 usuarios. */
export interface CondominiumUserCount {
  condominiumId: string;
  condominiumName: string;
  userCount: number;
}

/** GET /admin/metrics/top-categories — todas as categorias, mesmo com 0 anuncios. */
export interface CategoryProductCount {
  categoryId: string;
  categoryName: string;
  productCount: number;
}

/** Linha do ranking em GET /admin/metrics/products-per-user. */
export interface TopUser {
  userId: string;
  fullName: string;
  condominiumName: string;
  productCount: number;
}

/** GET /admin/metrics/products-per-user. `average` sempre numero (nunca NaN), 0 sem residents. */
export interface ProductsPerUserResponse {
  average: number;
  topUsers: TopUser[];
}

/** Body de POST /admin/categories. */
export interface CreateCategoryPayload {
  name: string;
}
