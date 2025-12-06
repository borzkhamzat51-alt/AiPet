import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';  // Fixed import name

describe('SoundService', () => {  // Changed from Sound to SoundService
  let service: SoundService;  // Changed from Sound to SoundService

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundService);  // Changed from Sound to SoundService
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});