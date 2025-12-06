import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetAvatarComponent } from './pet-avatar.component';  // Fixed import name

describe('PetAvatarComponent', () => {  // Changed from PetAvatar to PetAvatarComponent
  let component: PetAvatarComponent;  // Changed from PetAvatar to PetAvatarComponent
  let fixture: ComponentFixture<PetAvatarComponent>;  // Changed from PetAvatar to PetAvatarComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetAvatarComponent]  // Changed from PetAvatar to PetAvatarComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetAvatarComponent);  // Changed from PetAvatar to PetAvatarComponent
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});