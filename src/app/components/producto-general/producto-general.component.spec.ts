import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoGeneralComponent } from './producto-general.component';

describe('ProductoGeneralComponent', () => {
  let component: ProductoGeneralComponent;
  let fixture: ComponentFixture<ProductoGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
