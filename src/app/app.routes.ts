import { Routes } from '@angular/router';
import { InventarioLista } from './features/inventario/inventario-lista/inventario-lista';

export const routes: Routes = [
    {path: 'inventario', component: InventarioLista},
    {path: '', redirectTo: 'inventario', pathMatch: 'full'}
];
