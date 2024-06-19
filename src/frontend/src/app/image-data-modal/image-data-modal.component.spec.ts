import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDataModalComponent } from './image-data-modal.component';

describe('ImageDataModalComponent', () => {
  let component: ImageDataModalComponent;
  let fixture: ComponentFixture<ImageDataModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageDataModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
