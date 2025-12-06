// src/app/components/pet-avatar/pet-avatar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pet-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <!-- Pet Container -->
      <div class="relative w-32 h-32 cursor-pointer group" (click)="onPetClick()">
        <!-- Mood Indicator -->
        <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-md z-10"
             [ngClass]="getMoodColor()">
          {{ getMoodEmoji() }}
        </div>
        
        <!-- Pet Emoji -->
        <div class="w-full h-full rounded-full flex items-center justify-center text-7xl transition-all duration-300 group-hover:scale-110"
             [ngClass]="getPetBackground()"
             [class.animate-bounce]="mood === 'playful'"
             [class.animate-pulse]="mood === 'hungry'"
             [class.opacity-80]="mood === 'tired'">
          {{ getPetEmoji() }}
        </div>
        
        <!-- Pet Name -->
        <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div class="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
               [ngClass]="isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700'">
            {{ petName }}
          </div>
        </div>
      </div>
      
      <!-- Stats Bars -->
      <div class="mt-8 space-y-3">
        <div>
          <div class="flex justify-between text-xs font-bold mb-1">
            <span class="text-slate-700 dark:text-slate-300">Happiness</span>
            <span class="text-slate-900 dark:text-white">{{ happiness }}%</span>
          </div>
          <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" [style.width.%]="happiness"></div>
          </div>
        </div>
        
        <div>
          <div class="flex justify-between text-xs font-bold mb-1">
            <span class="text-slate-700 dark:text-slate-300">Energy</span>
            <span class="text-slate-900 dark:text-white">{{ energy }}%</span>
          </div>
          <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-500" [style.width.%]="energy"></div>
          </div>
        </div>
        
        <div>
          <div class="flex justify-between text-xs font-bold mb-1">
            <span class="text-slate-700 dark:text-slate-300">Hunger</span>
            <span class="text-slate-900 dark:text-white">{{ hunger }}%</span>
          </div>
          <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" [style.width.%]="hunger"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PetAvatarComponent {
  @Input() petType: 'dog' | 'cat' | 'bird' | 'other' = 'dog';
  @Input() petName: string = 'Buddy';
  @Input() mood: 'happy' | 'sad' | 'playful' | 'hungry' | 'tired' = 'happy';
  @Input() happiness: number = 75;
  @Input() energy: number = 90;
  @Input() hunger: number = 40;
  @Input() isDarkMode: boolean = false;
  @Output() petClicked = new EventEmitter<void>();
  
  onPetClick() {
    this.petClicked.emit();
    // Animate on click
    this.happiness = Math.min(100, this.happiness + 5);
  }
  
  getPetEmoji(): string {
    const emojis: Record<string, string> = {
      'dog': '🐕',
      'cat': '🐈',
      'bird': '🦜',
      'other': '🐾'
    };
    return emojis[this.petType] || '🐾';
  }
  
  getMoodEmoji(): string {
    const emojis: Record<string, string> = {
      'happy': '😊',
      'sad': '😢',
      'playful': '😄',
      'hungry': '🍖',
      'tired': '😴'
    };
    return emojis[this.mood] || '😊';
  }
  
  getMoodColor(): string {
    const colors: Record<string, string> = {
      'happy': 'bg-green-100 text-green-800 border-green-300',
      'sad': 'bg-blue-100 text-blue-800 border-blue-300',
      'playful': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'hungry': 'bg-orange-100 text-orange-800 border-orange-300',
      'tired': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[this.mood] || 'bg-green-100 text-green-800 border-green-300';
  }
  
  getPetBackground(): string {
    const backgrounds: Record<string, string> = {
      'dog': 'bg-amber-100 dark:bg-amber-900/20',
      'cat': 'bg-gray-100 dark:bg-gray-900/20',
      'bird': 'bg-sky-100 dark:bg-sky-900/20',
      'other': 'bg-purple-100 dark:bg-purple-900/20'
    };
    return backgrounds[this.petType] || 'bg-amber-100 dark:bg-amber-900/20';
  }
}