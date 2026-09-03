import { Service, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { Articulo } from '../models/articulo';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/Articulos`;
const CLAVE_CACHE = 'inventario-hogar-cache';

function cargarCache(): Articulo[] {
  const guardado = localStorage.getItem(CLAVE_CACHE);
  if (!guardado) return [];

  try {
    const datos = JSON.parse(guardado) as Articulo[];
    return datos.map((a) => ({
      ...a,
      fechaAdquisicion: a.fechaAdquisicion ? new Date(a.fechaAdquisicion) : undefined,
      fechaCaducidad: a.fechaCaducidad ? new Date(a.fechaCaducidad) : undefined,
    }));
  } catch {
    return [];
  }
}

function guardarCache(articulos: Articulo[]) {
  localStorage.setItem(CLAVE_CACHE, JSON.stringify(articulos));
}

@Service()
export class Inventario {
  private http = inject(HttpClient);

  private articulos = signal<Articulo[]>(cargarCache());
  readonly lista = this.articulos.asReadonly();

  private cargando = signal(false);
  readonly estaCargando = this.cargando.asReadonly();

  cargar() {
    this.cargando.set(true);

    this.http
      .get<Articulo[]>(API_URL)
      .pipe(
        catchError(() => {
          console.warn('No se pudo conectar con la API, usando datos locales');
          return of(this.articulos());
        }),
      )
      .subscribe({
        next: (datos) => {
          this.articulos.set(datos);
          guardarCache(datos);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }

  agregar(articulo: Omit<Articulo, 'id'>) {
    this.cargando.set(true);

    return this.http.post<Articulo>(API_URL, articulo).pipe(
      tap((creado) => {
        this.articulos.update((lista) => {
          const nuevaLista = [...lista, creado];
          guardarCache(nuevaLista);
          this.cargando.set(false);
          return nuevaLista;
        });
      }),
    );
  }

  editar(id: number, articulo: Articulo) {
    this.cargando.set(true);

    return this.http.put<boolean>(`${API_URL}/${id}`, articulo).pipe(
      tap(() => {
        this.articulos.update((lista) => {
          const nuevaLista = lista.map((a) => (a.id === id ? { ...a, ...articulo } : a));
          guardarCache(nuevaLista);
          this.cargando.set(false);
          return nuevaLista;
        });
      }),
    );
  }

  eliminar(id: number) {
    this.cargando.set(true);

    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => {
        this.articulos.update((lista) => {
          const nuevaLista = lista.filter((a) => a.id !== id);
          guardarCache(nuevaLista);
          this.cargando.set(false);
          return nuevaLista;
        });
      }),
    );
  }
}
