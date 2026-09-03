import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogData } from '../../core/models/confirmDialogData';

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.css',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
   private dialogRef = inject(MatDialogRef<ConfirmDialog>);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  confirmar() {
    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
