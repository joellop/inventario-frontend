import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Articulo } from '../../../core/models/articulo';
import { Inventario } from '../../../core/services/inventario';

@Component({
  selector: 'app-inventario-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './inventario-form.html',
  styleUrl: './inventario-form.css',
})
export class InventarioForm {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<InventarioForm>);
  private inventarioService = inject(Inventario);
  data = inject<Articulo | null>(MAT_DIALOG_DATA);

  guardando = signal(false);
  error = signal<string | null>(null);

  fechaMinima = new Date(new Date().getFullYear() - 5, 0, 1);
  fechaMaxima = new Date(new Date().getFullYear() + 20, 11, 31);

  form = this.fb.group({
    nombre: [this.data?.nombre ?? '', Validators.required],
    categoria: [this.data?.categoria ?? '', Validators.required],
    ubicacion: [this.data?.ubicacion ?? '', Validators.required],
    cantidad: [this.data?.cantidad ?? 1, [Validators.required, Validators.min(1)]],
    valorEstimado: [this.data?.valorEstimado ?? null, [Validators.min(0)]],
    fechaCaducidad: [this.data?.fechaCaducidad ?? null],
    notas: [this.data?.notas ?? ''],
  });

  get esEdicion(): boolean {
    return !!this.data;
  }

  guardar() {
    if (this.form.invalid) return;

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.form.value as Omit<Articulo, 'id'>;

    if (this.esEdicion) {
      this.inventarioService.editar(this.data!.id, { ...this.data!, ...valores }).subscribe({
        next: () => this.dialogRef.close('editado'),
        error: () => this.manejarError(),
      });
    } else {
      this.inventarioService.agregar(valores).subscribe({
        next: () => this.dialogRef.close('agregado'),
        error: () => this.manejarError(),
      });
    }
  }

  private manejarError() {
    this.guardando.set(false);
    this.error.set('Ocurrió un error al guardar. Intenta de nuevo.');
  }

  cancelar() {
    this.dialogRef.close();
  }
}
