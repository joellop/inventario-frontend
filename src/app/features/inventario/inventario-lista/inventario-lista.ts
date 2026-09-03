import {
  AfterViewInit,
  Component,
  effect,
  inject,
  viewChild,
  computed,
  signal,
} from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Inventario } from '../../../core/services/inventario';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { Articulo } from '../../../core/models/articulo';
import { MatDialog } from '@angular/material/dialog';
import { InventarioForm } from '../inventario-form/inventario-form';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../../core/models/confirmDialogData';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    CurrencyPipe,
    MatFormFieldModule,
    MatInputModule,
    NgClass,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-inventario-lista',
  styleUrl: './inventario-lista.css',
  templateUrl: './inventario-lista.html',
})
export class InventarioLista implements AfterViewInit {
  private breakpointObserver = inject(BreakpointObserver);
  private inventarioService = inject(Inventario);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cargando = this.inventarioService.estaCargando;

  esMovil = toSignal(
    this.breakpointObserver
      .observe('(max-width: 599px)')
      .pipe(map((resultado) => resultado.matches)),
    { initialValue: false },
  );
  articulos = this.inventarioService.lista;

  paginator = viewChild.required(MatPaginator);
  dataSource = new MatTableDataSource<Articulo>([]);

  columnas = computed(() =>
    this.esMovil()
      ? ['nombre', 'cantidad', 'acciones']
      : ['nombre', 'categoria', 'ubicacion', 'cantidad', 'valorEstimado', 'acciones'],
  );

  articulosVencidos = computed(() =>
    this.articulos().filter((a) => this.obtenerEstadoCaducidad(a) === 'vencido'),
  );

  articulosPorVencer = computed(() =>
    this.articulos().filter((a) => this.obtenerEstadoCaducidad(a) === 'por-vencer'),
  );

  filtroEstado = signal<'todos' | 'vencido' | 'por-vencer'>('todos');

  constructor() {
    this.inventarioService.cargar();

    effect(() => {
      this.dataSource.data = this.articulosFiltradosPorEstado();
    });

    this.dataSource.filterPredicate = (articulo: Articulo, filtro: string) => {
      const texto = `${articulo.nombre} ${articulo.categoria} ${articulo.ubicacion}`.toLowerCase();
      return texto.includes(filtro);
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator();
  }

  aplicarFiltro(evento: Event) {
    const valor = (evento.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  abrirFormulario(articulo?: Articulo) {
    const dialogRef = this.dialog.open(InventarioForm, {
      width: this.esMovil() ? '95vw' : '500px',
      maxWidth: this.esMovil() ? '95vw' : '500px',
      data: articulo ?? null,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado === 'agregado') {
        this.mostrarAviso('Artículo agregado');
      } else if (resultado === 'editado') {
        this.mostrarAviso('Artículo actualizado');
      }
    });
  }

  onEditar(articulo: Articulo) {
    this.abrirFormulario(articulo);
  }

  onEliminar(articulo: Articulo) {
    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      width: '400px',
      data: {
        titulo: 'Eliminar artículo',
        mensaje: `¿Seguro que quieres eliminar "${articulo.nombre}" del inventario?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.inventarioService.eliminar(articulo.id).subscribe({
          next: () => this.mostrarAviso('Artículo eliminado'),
          error: () => this.mostrarAviso('Error al eliminar el artículo'),
        });
      }
    });
  }

  obtenerEstadoCaducidad(articulo: Articulo): 'vencido' | 'por-vencer' | 'normal' {
    if (!articulo.fechaCaducidad) return 'normal';

    const hoy = new Date();
    const caducidad = new Date(articulo.fechaCaducidad);
    const diasRestantes = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) return 'vencido';
    if (diasRestantes <= 30) return 'por-vencer';
    return 'normal';
  }

  private mostrarAviso(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  articulosFiltradosPorEstado = computed(() => {
    const estado = this.filtroEstado();
    if (estado === 'todos') return this.articulos();
    return this.articulos().filter((a) => this.obtenerEstadoCaducidad(a) === estado);
  });

  verVencidos() {
    this.filtroEstado.set(this.filtroEstado() === 'vencido' ? 'todos' : 'vencido');
    this.dataSource.paginator?.firstPage();
  }

  verPorVencer() {
    this.filtroEstado.set(this.filtroEstado() === 'por-vencer' ? 'todos' : 'por-vencer');
    this.dataSource.paginator?.firstPage();
  }
}
