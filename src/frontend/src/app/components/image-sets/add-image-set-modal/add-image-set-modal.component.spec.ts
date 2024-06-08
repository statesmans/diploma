import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImageSetModalComponent } from './add-image-set-modal.component';

describe('AddImageSetModalComponent', () => {
  let component: AddImageSetModalComponent;
  let fixture: ComponentFixture<AddImageSetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddImageSetModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddImageSetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
