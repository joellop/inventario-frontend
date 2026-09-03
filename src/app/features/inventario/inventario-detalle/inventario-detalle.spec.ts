import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventarioDetalle } from './inventario-detalle';

describe('InventarioDetalle', () => {
  let component: InventarioDetalle;
  let fixture: ComponentFixture<InventarioDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
