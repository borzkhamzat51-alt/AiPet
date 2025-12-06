// src/app/components/sound/sound.service.ts
import { Injectable, signal } from '@angular/core';

export type SoundType = 'bark' | 'meow' | 'chirp' | 'click';
export type PetType = 'dog' | 'cat' | 'bird' | 'other';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private enabled = signal(true);
  private volume = signal(0.5);
  private audioElements = new Map<string, HTMLAudioElement>();

  // Update these paths to match your actual file names
  private soundFiles: Record<SoundType, string> = {
    bark: '/sounds/dog.mp3',    // Change if your file is named differently
    meow: '/sounds/cat.mp3',
    chirp: '/sounds/bird.mp3',
    click: '/sounds/click.mp3'
  };

  constructor() {
    console.log('SoundService initialized');
    // Preload immediately
    this.preloadSounds();
  }

  toggleSound() {
    this.enabled.update(e => !e);
    console.log('Sound enabled:', !this.enabled());
  }

  setVolume(volume: number) {
    const newVolume = Math.max(0, Math.min(1, volume));
    this.volume.set(newVolume);
    console.log('Volume set to:', newVolume);
  }

  playSound(sound: SoundType) {
    if (!this.enabled()) {
      console.log('Sound disabled, not playing:', sound);
      return;
    }

    const soundFile = this.soundFiles[sound];
    if (!soundFile) {
      console.error('Sound not configured:', sound);
      return;
    }

    console.log('Attempting to play:', sound, 'from:', soundFile);

    try {
      // Create new audio element every time (more reliable)
      const audio = new Audio();
      audio.src = soundFile;
      audio.volume = this.volume();
      
      // Set up event listeners for debugging
      audio.onerror = (e) => {
        console.error('Audio error for', sound, ':', e);
        console.error('Audio error details:', audio.error);
      };
      
      audio.oncanplaythrough = () => {
        console.log('Audio can play:', sound);
      };
      
      audio.onloadeddata = () => {
        console.log('Audio loaded:', sound, 'duration:', audio.duration);
      };

      // Play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Successfully playing:', sound);
          })
          .catch(error => {
            console.error('Play failed for', sound, ':', error);
            console.log('Audio error state:', audio.error);
            console.log('Audio network state:', audio.networkState);
            console.log('Audio ready state:', audio.readyState);
            
            // Try alternative approach
            this.playFallbackSound(sound);
          });
      }
    } catch (error) {
      console.error('Error in playSound:', error);
    }
  }

  playPetSound(petType: PetType) {
    console.log('Playing pet sound for:', petType);
    
    switch(petType) {
      case 'dog':
        this.playSound('bark');
        break;
      case 'cat':
        this.playSound('meow');
        break;
      case 'bird':
        this.playSound('chirp');
        break;
      default:
        this.playSound('click');
    }
  }

  playInteractionSound() {
    this.playSound('click');
  }

  private preloadSounds() {
    console.log('Preloading sounds...');
    
    Object.entries(this.soundFiles).forEach(([sound, file]) => {
      console.log('Preloading:', sound, '->', file);
      
      // Test if file exists
      this.testFileExists(file).then(exists => {
        console.log('File', file, 'exists:', exists);
      });
      
      const audio = new Audio();
      audio.src = file;
      audio.preload = 'auto';
      
      audio.onerror = () => {
        console.error('Failed to preload:', file);
      };
      
      audio.onload = () => {
        console.log('Successfully preloaded:', file);
      };
      
      // Store for later use
      this.audioElements.set(file, audio);
    });
  }

  private async testFileExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking file:', url, error);
      return false;
    }
  }

  private playFallbackSound(sound: SoundType) {
    console.log('Using fallback sound for:', sound);
    
    // Create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different sounds
      let frequency = 440;
      switch(sound) {
        case 'bark': frequency = 200; break;   // Low for dog
        case 'meow': frequency = 500; break;   // Medium for cat
        case 'chirp': frequency = 1000; break; // High for bird
        case 'click': frequency = 800; break;  // Click
      }
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.value = this.volume();
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.2
      );
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      console.log('Fallback sound played successfully');
    } catch (error) {
      console.error('Fallback sound also failed:', error);
      // Last resort: log to console
      console.log(`[Sound: ${sound}]`);
    }
  }

  // Debug method to check all sounds
  debugAllSounds() {
    console.log('=== Sound Service Debug ===');
    console.log('Enabled:', this.enabled());
    console.log('Volume:', this.volume());
    console.log('Sound files config:', this.soundFiles);
    
    Object.entries(this.soundFiles).forEach(([sound, file]) => {
      console.log(`Testing ${sound}: ${file}`);
      this.testFileExists(file).then(exists => {
        console.log(`  ${exists ? '✓' : '✗'} File exists`);
        
        if (exists) {
          const audio = new Audio(file);
          audio.onerror = () => console.log(`  ✗ Cannot load ${file}`);
          audio.oncanplaythrough = () => console.log(`  ✓ Can play ${file}`);
          audio.load();
        }
      });
    });
  }
}