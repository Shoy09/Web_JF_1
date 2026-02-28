import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarEditorComponent } from './navbar-editor.component';

describe('NavbarEditorComponent', () => {
  let component: NavbarEditorComponent;
  let fixture: ComponentFixture<NavbarEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
