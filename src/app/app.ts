import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  imports: [RouterOutlet, MatSnackBarModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private swUpdate = inject(SwUpdate);
  private snackBar = inject(MatSnackBar);

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evento): evento is VersionReadyEvent => evento.type === 'VERSION_READY'))
        .subscribe(() => {
          this.avisarActualizacionDisponible();
        });

      // Revisa si hay actualizaciones cada 6 horas mientras la app está abierta
      this.revisarActualizacionesPeriodicamente();
    }
  }

  private avisarActualizacionDisponible() {
    const referencia = this.snackBar.open(
      'Hay una nueva versión disponible',
      'Actualizar',
      { duration: undefined }, // undefined = no se cierra solo, espera acción del usuario
    );

    referencia.onAction().subscribe(() => {
      document.location.reload();
    });
  }

  private async revisarActualizacionesPeriodicamente() {
    const SEIS_HORAS = 6 * 60 * 60 * 1000;
    setInterval(() => {
      this.swUpdate.checkForUpdate();
    }, SEIS_HORAS);
  }
}
