import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryEditorComponent } from './history-editor.component';

describe('HistoryEditorComponent', () => {
  let component: HistoryEditorComponent;
  let fixture: ComponentFixture<HistoryEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
