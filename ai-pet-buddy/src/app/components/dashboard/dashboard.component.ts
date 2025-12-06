// src/app/components/dashboard/dashboard.component.ts
import { Component, Input, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PetAvatarComponent } from '../pet-avatar/pet-avatar.component';
import { MiniGameComponent } from '../mini-game/mini-game.component';
import { ChatService } from '../../services/chat.service';
import { SoundService } from '../sound/sound.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PetAvatarComponent, MiniGameComponent],
  template: `
    <div class="animate-enter max-w-6xl mx-auto">
      <!-- Sound Control in Header (minimal addition) -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 class="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Pet Dashboard</h2>
          <p class="text-slate-700 dark:text-slate-400 font-medium">Monitor and interact with your virtual companion</p>
          <div class="flex items-center gap-2 mt-2">
            <button (click)="toggleSound()"
                    class="text-xs px-2 py-1 rounded"
                    [class]="soundEnabled() ? 
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-500'">
              {{ soundEnabled() ? '🔊 Sound On' : '🔇 Sound Off' }}
            </button>
            <input type="range" 
                   min="0" 
                   max="100" 
                   [value]="volume()"
                   (input)="changeVolume($event)"
                   class="w-20 h-2 bg-slate-300 dark:bg-slate-700 rounded-lg">
          </div>
        </div>
        
        <!-- Stats Summary (unchanged) -->
        <div class="flex gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ dailyStats().interactions }}</div>
            <div class="text-xs text-slate-600 dark:text-slate-400 font-bold">Today</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ streak() }} 🔥</div>
            <div class="text-xs text-slate-600 dark:text-slate-400 font-bold">Streak</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-slate-900 dark:text-white">Lvl {{ level() }}</div>
            <div class="text-xs text-slate-600 dark:text-slate-400 font-bold">Level</div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid (unchanged) -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <!-- Pet Avatar Card -->
        <div [class]="(isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300') + ' rounded-2xl border p-6'">
          <h3 class="text-lg font-bold mb-4 text-slate-900 dark:text-white">Your Companion</h3>
          <div class="flex flex-col items-center">
            <app-pet-avatar 
              [petType]="petProfile().type"
              [petName]="petProfile().name"
              [mood]="petProfile().mood || 'happy'"
              [happiness]="petProfile().happiness || 75"
              [energy]="petProfile().energy || 90"
              [hunger]="petProfile().hunger || 40"
              [isDarkMode]="isDarkMode"
              (petClicked)="onPetInteraction()">
            </app-pet-avatar>
            
            <!-- Interaction Buttons -->
            <div class="grid grid-cols-2 gap-3 mt-6 w-full">
              <button (click)="performAction('feed')"
                      class="flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg font-bold hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors">
                <span class="text-lg">🍖</span>
                <span class="text-sm">Feed</span>
              </button>
              <button (click)="performAction('play')"
                      class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg font-bold hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors">
                <span class="text-lg">🎾</span>
                <span class="text-sm">Play</span>
              </button>
              <button (click)="performAction('groom')"
                      class="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg font-bold hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors">
                <span class="text-lg">✨</span>
                <span class="text-sm">Groom</span>
              </button>
              <button (click)="performAction('sleep')"
                      class="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-lg font-bold hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors">
                <span class="text-lg">😴</span>
                <span class="text-sm">Rest</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Daily Progress (unchanged) -->
        <div [class]="(isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300') + ' rounded-2xl border p-6'">
          <h3 class="text-lg font-bold mb-4 text-slate-900 dark:text-white">Daily Progress</h3>
          
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm font-bold mb-1">
                <span class="text-slate-700 dark:text-slate-300">Happiness Goal</span>
                <span class="text-slate-900 dark:text-white">{{ dailyGoals().happiness }}/100</span>
              </div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-green-400 to-emerald-500" [style.width.%]="(dailyGoals().happiness / 100) * 100"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between text-sm font-bold mb-1">
                <span class="text-slate-700 dark:text-slate-300">Exercise Goal</span>
                <span class="text-slate-900 dark:text-white">{{ dailyGoals().exercise }}/60 min</span>
              </div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-400 to-cyan-500" [style.width.%]="(dailyGoals().exercise / 60) * 100"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between text-sm font-bold mb-1">
                <span class="text-slate-700 dark:text-slate-300">Training Goal</span>
                <span class="text-slate-900 dark:text-white">{{ dailyGoals().training }}/5 sessions</span>
              </div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-400 to-pink-500" [style.width.%]="(dailyGoals().training / 5) * 100"></div>
              </div>
            </div>
          </div>
          
          <!-- Level Progress -->
          <div class="mt-8 pt-6 border-t" [class]="isDarkMode ? 'border-slate-800' : 'border-slate-200'">
            <div class="flex justify-between text-sm font-bold mb-1">
              <span class="text-slate-700 dark:text-slate-300">Level {{ level() }} Progress</span>
              <span class="text-slate-900 dark:text-white">{{ xp() }}/{{ level() * 100 }} XP</span>
            </div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500" [style.width.%]="(xp() / (level() * 100)) * 100"></div>
            </div>
          </div>
        </div>
        
        <!-- Quick Game -->
        <div class="md:col-span-1">
          <app-mini-game 
            [isDarkMode]="isDarkMode" 
            [petType]="petProfile().type">
          </app-mini-game>
        </div>
      </div>

      <!-- Test button (you can remove this after testing) -->
      <div class="mb-6">
        <button (click)="testSounds()" 
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Test Animal Sounds
        </button>
      </div>

      <!-- Recent Activity & Achievements (unchanged) -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- Recent Activity -->
        <div [class]="(isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300') + ' rounded-2xl border p-6'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <button (click)="clearActivities()" class="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
              Clear All
            </button>
          </div>
          
          <div class="space-y-3">
            <div *ngFor="let activity of recentActivities()" 
                 class="flex items-center gap-3 p-3 rounded-lg transition-colors"
                 [class]="isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                   [ngClass]="getActivityColor(activity.type)">
                {{ activity.emoji }}
              </div>
              <div class="flex-1">
                <div class="font-bold text-slate-900 dark:text-white">{{ activity.title }}</div>
                <div class="text-xs text-slate-600 dark:text-slate-400">{{ activity.time }}</div>
              </div>
              <div class="text-xs font-bold px-2 py-1 rounded"
                   [class]="isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'">
                +{{ activity.xp }} XP
              </div>
            </div>
            
            <div *ngIf="recentActivities().length === 0" class="text-center py-8 text-slate-500 dark:text-slate-400">
              <div class="text-4xl mb-2">📝</div>
              <p class="font-bold">No activities yet</p>
              <p class="text-sm">Interact with your pet to see activities here!</p>
            </div>
          </div>
        </div>
        
        <!-- Achievements -->
        <div [class]="(isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300') + ' rounded-2xl border p-6'">
          <h3 class="text-lg font-bold mb-4 text-slate-900 dark:text-white">Achievements</h3>
          
          <div class="grid grid-cols-2 gap-3">
            <div *ngFor="let achievement of achievements()" 
                 [class]="'p-4 rounded-lg text-center transition-all ' + (achievement.unlocked ? 
                   (isDarkMode ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200') :
                   (isDarkMode ? 'bg-slate-800 opacity-50' : 'bg-slate-100 opacity-50'))">
              <div class="text-2xl mb-2">{{ achievement.emoji }}</div>
              <div class="text-xs font-bold mb-1 text-slate-900 dark:text-white">{{ achievement.title }}</div>
              <div class="text-xs text-slate-600 dark:text-slate-400">{{ achievement.description }}</div>
              <div *ngIf="!achievement.unlocked" class="text-xs mt-2 font-bold text-amber-600 dark:text-amber-400">
                {{ achievement.progress }}/{{ achievement.requirement }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  @Input() isDarkMode = false;
  
  // Add sound signals
  soundEnabled = signal(true);
  volume = signal(70);
  
  constructor(
    private chatService: ChatService,
    private soundService: SoundService
  ) {}
  
  // Signals (unchanged)
  dailyStats = signal({
    interactions: 12,
    happiness: 85,
    exercise: 45,
    training: 3
  });
  
  dailyGoals = signal({
    happiness: 75,
    exercise: 30,
    training: 2
  });
  
  streak = signal(7);
  level = signal(3);
  xp = signal(240);
  
  recentActivities = signal<any[]>([
    { emoji: '🍖', title: 'Fed breakfast', time: '2 hours ago', type: 'feed', xp: 10 },
    { emoji: '🎾', title: 'Played fetch game', time: '4 hours ago', type: 'play', xp: 15 },
    { emoji: '💬', title: 'Chat about training', time: '1 day ago', type: 'chat', xp: 5 },
    { emoji: '✨', title: 'Grooming session', time: '2 days ago', type: 'groom', xp: 8 },
    { emoji: '😴', title: 'Bedtime routine', time: '2 days ago', type: 'sleep', xp: 12 }
  ]);
  
  achievements = signal([
    { emoji: '🥇', title: 'First Friend', description: 'Complete 10 interactions', unlocked: true, progress: 10, requirement: 10 },
    { emoji: '🔥', title: 'Hot Streak', description: '7-day login streak', unlocked: true, progress: 7, requirement: 7 },
    { emoji: '🏆', title: 'Master Trainer', description: 'Reach level 5', unlocked: false, progress: 3, requirement: 5 },
    { emoji: '❤️', title: 'Best Buddy', description: 'Max happiness for 3 days', unlocked: false, progress: 1, requirement: 3 }
  ]);
  
  get petProfile() {
    return this.chatService.getPetProfile();
  }
  
  ngOnInit() {
    // Load saved data from localStorage
    this.loadSavedData();
    
    // Set initial volume
    if (this.soundService.setVolume) {
      this.soundService.setVolume(this.volume() / 100);
    }
  }
  
  // Add the testSounds method
  testSounds() {
    console.log('Testing animal sounds...');
    
    // Test dog sound
    this.soundService.playPetSound('dog');
    
    // Test cat sound after 1 second
    setTimeout(() => {
      this.soundService.playPetSound('cat');
    }, 1000);
    
    // Test bird sound after 2 seconds
    setTimeout(() => {
      this.soundService.playPetSound('bird');
    }, 2000);
    
    // Test other sound after 3 seconds
    setTimeout(() => {
      this.soundService.playPetSound('other');
    }, 3000);
  }
  
  // Sound methods (added)
  toggleSound() {
    this.soundEnabled.update(enabled => !enabled);
    if (this.soundService.toggleSound) {
      this.soundService.toggleSound();
    }
  }
  
  changeVolume(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.volume.set(value);
    
    if (this.soundService.setVolume) {
      this.soundService.setVolume(value / 100);
    }
  }
  
  // Modified onPetInteraction to include sound
  onPetInteraction() {
    this.dailyStats.update(stats => ({
      ...stats,
      interactions: stats.interactions + 1
    }));
    
    this.addActivity('👋', 'Pet interaction', 'chat', 5);
    
    // Play pet sound
    if (this.soundEnabled()) {
      this.soundService.playPetSound(this.petProfile().type);
    }
    
    this.saveData();
  }
  
  // Modified performAction to include sounds - FIXED THE SOUND TYPES
  performAction(action: string) {
    const actions: Record<string, {emoji: string, title: string, xp: number}> = {
      'feed': { emoji: '🍖', title: 'Fed your pet', xp: 10 },
      'play': { emoji: '🎾', title: 'Played with pet', xp: 15 },
      'groom': { emoji: '✨', title: 'Grooming session', xp: 8 },
      'sleep': { emoji: '😴', title: 'Put pet to sleep', xp: 12 }
    };
    
    const actionData = actions[action];
    if (actionData) {
      this.addActivity(actionData.emoji, actionData.title, action, actionData.xp);
      
      // Play pet sound for action
      if (this.soundEnabled()) {
        this.soundService.playPetSound(this.petProfile().type);
      }
      
      // Update stats based on action
      if (action === 'play') {
        this.dailyStats.update(stats => ({
          ...stats,
          exercise: stats.exercise + 10,
          interactions: stats.interactions + 1
        }));
      } else if (action === 'feed') {
        this.dailyStats.update(stats => ({
          ...stats,
          happiness: Math.min(100, stats.happiness + 5),
          interactions: stats.interactions + 1
        }));
      }
      
      // Add XP
      this.xp.update(xp => {
        const newXp = xp + actionData.xp;
        if (newXp >= this.level() * 100) {
          this.level.update(l => l + 1);
          this.addActivity('⭐', 'Level up!', 'level', 0);
          
          // Play celebration sound - use click sound for level up
          if (this.soundEnabled()) {
            this.soundService.playSound('click');
          }
          
          return newXp - (this.level() * 100);
        }
        return newXp;
      });
      
      this.saveData();
    }
  }
  
  addActivity(emoji: string, title: string, type: string, xp: number) {
    const now = new Date();
    const time = this.formatTimeAgo(now);
    
    this.recentActivities.update(activities => [
      { emoji, title, time, type, xp },
      ...activities.slice(0, 9) // Keep only 10 most recent
    ]);
  }
  
  clearActivities() {
    this.recentActivities.set([]);
    // Play sound when clearing - use click sound
    if (this.soundEnabled()) {
      this.soundService.playSound('click');
    }
  }
  
  getActivityColor(type: string): string {
    const colors: Record<string, string> = {
      'feed': 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300',
      'play': 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300',
      'groom': 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300',
      'sleep': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-300',
      'chat': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-900 dark:text-cyan-300',
      'level': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300'
    };
    return colors[type] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-900 dark:text-slate-300';
  }
  
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  
  private saveData() {
    const data = {
      dailyStats: this.dailyStats(),
      streak: this.streak(),
      level: this.level(),
      xp: this.xp(),
      recentActivities: this.recentActivities(),
      achievements: this.achievements(),
      soundEnabled: this.soundEnabled(),
      volume: this.volume()
    };
    localStorage.setItem('petDashboardData', JSON.stringify(data));
  }
  
  private loadSavedData() {
    const saved = localStorage.getItem('petDashboardData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.dailyStats.set(data.dailyStats || this.dailyStats());
        this.streak.set(data.streak || 7);
        this.level.set(data.level || 3);
        this.xp.set(data.xp || 240);
        this.recentActivities.set(data.recentActivities || this.recentActivities());
        this.achievements.set(data.achievements || this.achievements());
        this.soundEnabled.set(data.soundEnabled !== undefined ? data.soundEnabled : true);
        this.volume.set(data.volume || 70);
        
        // Set volume in sound service
        if (this.soundService.setVolume) {
          this.soundService.setVolume(this.volume() / 100);
        }
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }
}