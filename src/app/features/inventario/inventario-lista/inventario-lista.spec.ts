import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventarioLista } from './inventario-lista';

describe('InventarioLista', () => {
  let component: InventarioLista;
  let fixture: ComponentFixture<InventarioLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioLista],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
