import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDefectModalComponent } from './add-defect-modal.component';

describe('AddDefectModalComponent', () => {
  let component: AddDefectModalComponent;
  let fixture: ComponentFixture<AddDefectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDefectModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDefectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
