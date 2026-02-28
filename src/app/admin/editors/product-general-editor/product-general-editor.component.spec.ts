import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGeneralEditorComponent } from './product-general-editor.component';

describe('ProductGeneralEditorComponent', () => {
  let component: ProductGeneralEditorComponent;
  let fixture: ComponentFixture<ProductGeneralEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductGeneralEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductGeneralEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
