import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasInfoComponent } from './mas-info.component';

describe('MasInfoComponent', () => {
  let component: MasInfoComponent;
  let fixture: ComponentFixture<MasInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
