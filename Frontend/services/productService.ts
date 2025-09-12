import { Product } from '@/types';
import { products } from '@/data/products';

export class ProductService {
  public findProductByBarcode(barcode: string): Product | null {
    return products.find(product => product.barcode === barcode) || null;
  }

  public getAllProducts(): Product[] {
    return products;
  }

  public getProductsByCategory(category: string): Product[] {
    return products.filter(product => product.category === category);
  }

  public searchProducts(query: string): Product[] {
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
}