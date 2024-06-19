import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectClassesComponent } from './defect-classes.component';

describe('DefectClassesComponent', () => {
  let component: DefectClassesComponent;
  let fixture: ComponentFixture<DefectClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefectClassesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefectClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
