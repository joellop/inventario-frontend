export interface Articulo {
  id: number;
  nombre: string;
  categoria: string;       // ej. "Cocina", "Electrónica", "Muebles", "Ropa"
  ubicacion: string;       // ej. "Cocina", "Cuarto principal", "Garage"
  cantidad: number;
  valorEstimado?: number;  // opcional, para saber cuánto vale tu inventario total
  fechaAdquisicion?: Date;
  fechaCaducidad?: Date;
  notas?: string;
}