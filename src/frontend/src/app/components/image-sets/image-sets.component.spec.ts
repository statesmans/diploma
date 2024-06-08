import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSetsComponent } from './image-sets.component';

describe('ImageSetsComponent', () => {
  let component: ImageSetsComponent;
  let fixture: ComponentFixture<ImageSetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageSetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
