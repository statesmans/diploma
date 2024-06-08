import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSetComponent } from './image-set.component';

describe('ImageSetComponent', () => {
  let component: ImageSetComponent;
  let fixture: ComponentFixture<ImageSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageSetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
