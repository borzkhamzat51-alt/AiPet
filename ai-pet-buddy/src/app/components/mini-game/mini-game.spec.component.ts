// src/app/components/mini-game/mini-game.component.ts
import { Component, Input, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mini-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="(isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300') + ' rounded-xl p-6 border shadow-sm'">
      <!-- Game Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">🎮 Quick Game</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 font-medium">Click the falling treats to feed your pet!</p>
        </div>
        
        <!-- Score & Timer -->
        <div class="flex gap-4">
          <div class="text-center">
            <div class="text-xs text-slate-600 dark:text-slate-400 font-bold">SCORE</div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ score() }}</div>
          </div>
          <div class="text-center">
            <div class="text-xs text-slate-600 dark:text-slate-400 font-bold">TIME</div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ timeLeft() }}</div>
          </div>
        </div>
      </div>
      
      <!-- Game Area -->
      <div class="relative h-64 mb-6 rounded-lg overflow-hidden border-2 border-dashed" 
           [class]="isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-300 bg-slate-50'">
        
        <!-- Pet at bottom -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-5xl z-10">
          {{ getPetEmoji() }}
        </div>
        
        <!-- Falling Treats -->
        <div *ngFor="let treat of treats()" 
             [style.left.px]="treat.x"
             [style.top.px]="treat.y"
             class="absolute text-3xl cursor-pointer transition-transform duration-200 hover:scale-125 z-20"
             [class.animate-bounce]="!gameActive()"
             (click)="catchTreat(treat)">
          {{ getTreatEmoji(treat.type) }}
        </div>
        
        <!-- Missed Treats Counter -->
        <div *ngIf="missedTreats() > 0" 
             class="absolute top-4 left-4 text-sm font-bold px-3 py-1 rounded-full"
             [class]="isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'">
          Missed: {{ missedTreats() }}
        </div>
        
        <!-- Game Status -->
        <div *ngIf="!gameActive() && !gameEnded()" class="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-30">
          <div class="text-center p-6 rounded-xl"
               [class]="isDarkMode ? 'bg-slate-800' : 'bg-white'">
            <div class="text-4xl mb-4">{{ getPetEmoji() }}</div>
            <h4 class="text-xl font-bold mb-2 text-slate-900 dark:text-white">Ready to play?</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Click treats to feed your pet!</p>
          </div>
        </div>
        
        <!-- Game Over Screen -->
        <div *ngIf="gameEnded()" class="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-30">
          <div class="text-center p-8 rounded-2xl shadow-xl"
               [class]="isDarkMode ? 'bg-slate-800' : 'bg-white'">
            <div class="text-5xl mb-4">🏆</div>
            <h4 class="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Game Over!</h4>
            <div class="text-4xl font-bold mb-4 text-cyan-600 dark:text-cyan-400">{{ score() }} points</div>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">You fed {{ score() / 10 }} treats!</p>
            <button (click)="startGame()"
                    class="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors">
              Play Again
            </button>
          </div>
        </div>
      </div>
      
      <!-- Game Controls -->
      <div class="flex gap-3">
        <button (click)="startGame()" 
                [disabled]="gameActive()"
                [class]="(gameActive() ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500') + 
                         ' flex-1 py-3 rounded-lg text-white font-bold text-sm transition-colors'">
          {{ gameActive() ? 'Game Running...' : '🎮 Start Game' }}
        </button>
        <button (click)="endGame()"
                [class]="'px-4 py-3 rounded-lg font-bold text-sm transition-colors ' +
                        (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700')">
          Reset
        </button>
      </div>
    </div>
  `
})
export class MiniGameComponent implements OnInit, OnDestroy {
  @Input() isDarkMode = false;
  @Input() petType: 'dog' | 'cat' | 'bird' | 'other' = 'dog';
  
  treats = signal<any[]>([]);
  score = signal(0);
  missedTreats = signal(0);
  timeLeft = signal(30);
  gameActive = signal(false);
  gameEnded = signal(false);
  
  private gameInterval: any;
  private timerInterval: any;
  private treatInterval: any;
  
  ngOnInit() {
    // Pre-populate some treats for demo
    this.treats.set(this.generateTreats(5));
  }
  
  ngOnDestroy() {
    this.cleanup();
  }
  
  startGame() {
    this.score.set(0);
    this.missedTreats.set(0);
    this.timeLeft.set(30);
    this.treats.set([]);
    this.gameActive.set(true);
    this.gameEnded.set(false);
    
    // Start timer
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(t => {
        if (t <= 1) {
          this.endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    // Generate treats
    this.treatInterval = setInterval(() => {
      if (this.gameActive()) {
        this.treats.update(treats => [
          ...treats,
          ...this.generateTreats(2)
        ]);
      }
    }, 1000);
    
    // Move treats down
    this.gameInterval = setInterval(() => {
      if (this.gameActive()) {
        this.treats.update(treats => {
          const newTreats = treats.map(t => ({ ...t, y: t.y + 4 }));
          
          // Count missed treats
          const missed = newTreats.filter(t => t.y > 240).length;
          if (missed > 0) {
            this.missedTreats.update(m => m + missed);
          }
          
          return newTreats.filter(t => t.y <= 240);
        });
      }
    }, 100);
  }
  
  catchTreat(treat: any) {
    this.score.update(s => s + 10);
    this.treats.update(treats => treats.filter(t => t.id !== treat.id));
  }
  
  endGame() {
    this.gameActive.set(false);
    this.gameEnded.set(true);
    this.cleanup();
  }
  
  private cleanup() {
    if (this.gameInterval) clearInterval(this.gameInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.treatInterval) clearInterval(this.treatInterval);
  }
  
  private generateTreats(count: number): any[] {
    const treats = [];
    const treatTypes = this.petType === 'dog' ? ['bone', 'meat', 'paw'] :
                       this.petType === 'cat' ? ['fish', 'mouse', 'milk'] :
                       this.petType === 'bird' ? ['seed', 'worm', 'berry'] :
                       ['heart', 'star', 'diamond'];
    
    for (let i = 0; i < count; i++) {
      treats.push({
        id: Date.now() + i,
        x: Math.random() * 280,
        y: -30,
        type: treatTypes[Math.floor(Math.random() * treatTypes.length)]
      });
    }
    return treats;
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
  
  getTreatEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'bone': '🦴',
      'meat': '🍖',
      'paw': '🐾',
      'fish': '🐟',
      'mouse': '🐭',
      'milk': '🥛',
      'seed': '🌱',
      'worm': '🪱',
      'berry': '🫐',
      'heart': '❤️',
      'star': '⭐',
      'diamond': '💎'
    };
    return emojis[type] || '🍖';
  }
}