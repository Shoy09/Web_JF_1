import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasInfoEditorComponent } from './mas-info-editor.component';

describe('MasInfoEditorComponent', () => {
  let component: MasInfoEditorComponent;
  let fixture: ComponentFixture<MasInfoEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasInfoEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasInfoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
