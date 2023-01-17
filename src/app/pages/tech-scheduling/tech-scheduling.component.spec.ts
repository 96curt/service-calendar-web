import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechSchedulingComponent } from './tech-scheduling.component';

describe('TechSchedulingComponent', () => {
  let component: TechSchedulingComponent;
  let fixture: ComponentFixture<TechSchedulingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TechSchedulingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TechSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
