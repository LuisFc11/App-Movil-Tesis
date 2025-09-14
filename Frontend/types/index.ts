export interface Product {
  codeqr: string;       // Código QR único
  nombre: string;       // Nombre del producto
  descripcion: string;  // Descripción
  precio: number;       // Precio
  id?: string;          // ID opcional (puede venir del backend)
  createdAt?: Date;     // Fecha de creación opcional
  imageUrl?: string; // Campo opcional para URL de imagen
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export interface ScanResult {
  data: string;
  type: string;
}


