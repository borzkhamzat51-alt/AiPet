import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';  // Fixed import name

describe('DashboardComponent', () => {  // Changed from Dashboard to DashboardComponent
  let component: DashboardComponent;  // Changed from Dashboard to DashboardComponent
  let fixture: ComponentFixture<DashboardComponent>;  // Changed from Dashboard to DashboardComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent]  // Changed from Dashboard to DashboardComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);  // Changed from Dashboard to DashboardComponent
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});