import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterEditorComponent } from './footer-editor.component';

describe('FooterEditorComponent', () => {
  let component: FooterEditorComponent;
  let fixture: ComponentFixture<FooterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
