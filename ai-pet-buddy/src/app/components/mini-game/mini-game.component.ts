import { Component, Input, signal, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  speedY: number;
  rotation: number;
  points: number;
  emoji: string;
}

@Component({
  selector: 'app-mini-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="(isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300') + ' rounded-xl p-6 border shadow-sm'">
      <!-- Game Header -->
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">🎮 Pet Adventure</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">Catch falling treats!</p>
        </div>
        
        <!-- Game Stats -->
        <div class="flex gap-4">
          <div class="text-center">
            <div class="text-xs text-slate-600 dark:text-slate-400">SCORE</div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">{{ score() }}</div>
          </div>
          <div class="text-center">
            <div class="text-xs text-slate-600 dark:text-slate-400">LIVES</div>
            <div class="text-2xl font-bold" 
                 [class]="lives() >= 3 ? 'text-green-600' : lives() === 2 ? 'text-yellow-600' : 'text-red-600'">
              {{ lives() }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Game Canvas -->
      <div class="relative bg-gradient-to-b from-sky-100 to-emerald-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-700">
        <canvas #gameCanvas 
                class="block w-full h-96"
                (mousemove)="onMouseMove($event)"
                (click)="onCanvasClick($event)">
        </canvas>
        
        <!-- Start Screen -->
        <div *ngIf="!gameActive()" class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div class="text-center p-8 rounded-2xl shadow-2xl"
               [class]="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'">
            <div class="text-6xl mb-6">{{ getPetEmoji() }}</div>
            <h4 class="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Pet Adventure</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Move your pet to catch falling treats!<br>
              Avoid the bombs!<br>
              Use mouse or arrow keys.
            </p>
            <button (click)="startGame()"
                    class="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg transition-all">
              START GAME
            </button>
          </div>
        </div>
        
        <!-- Game Over Screen -->
        <div *ngIf="gameEnded()" class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div class="text-center p-8 rounded-2xl shadow-2xl"
               [class]="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'">
            <div class="text-6xl mb-4">🏆</div>
            <h4 class="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Game Over!</h4>
            <div class="text-4xl font-bold mb-6 text-cyan-600 dark:text-cyan-400">{{ score() }}</div>
            <button (click)="startGame()"
                    class="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all">
              PLAY AGAIN
            </button>
          </div>
        </div>
      </div>
      
      <!-- Game Controls -->
      <div class="mt-4 grid grid-cols-3 gap-2">
        <button (click)="startGame()" 
                [disabled]="gameActive()"
                [class]="(gameActive() ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500') + 
                         ' py-2 rounded-lg text-white font-bold text-sm transition-colors'">
          {{ gameActive() ? 'Playing...' : 'Start' }}
        </button>
        <button (click)="togglePause()"
                [class]="(isPaused ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500') + 
                         ' py-2 rounded-lg text-white font-bold text-sm transition-colors'">
          {{ isPaused ? 'Resume' : 'Pause' }}
        </button>
        <button (click)="endGame()"
                [class]="'py-2 rounded-lg font-bold text-sm transition-colors ' +
                        (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700')">
          Restart
        </button>
      </div>
      
      <!-- Instructions -->
      <div class="mt-4 text-xs text-slate-600 dark:text-slate-400">
        <div class="grid grid-cols-3 gap-2">
          <div class="flex items-center gap-1">
            <span class="text-lg">🍖</span> +10
          </div>
          <div class="flex items-center gap-1">
            <span class="text-lg">💎</span> +50
          </div>
          <div class="flex items-center gap-1">
            <span class="text-lg">💣</span> -1 life
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    canvas {
      display: block;
      background: transparent;
    }
  `]
})
export class MiniGameComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isDarkMode = false;
  @Input() petType: 'dog' | 'cat' | 'bird' | 'other' = 'dog';
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: any;
  private lastTime = 0;
  
  // Game state
  score = signal(0);
  lives = signal(3);
  gameActive = signal(false);
  gameEnded = signal(false);
  isPaused = false;
  
  // Player
  player = {
    x: 200,
    y: 350,
    width: 60,
    height: 60,
    speed: 5,
    direction: 0
  };
  
  // Game objects
  objects = signal<GameObject[]>([]);
  
  // Object types
  objectTypes = [
    { type: 'treat', emoji: '🍖', points: 10, width: 40, height: 40, speedY: 2 },
    { type: 'gem', emoji: '💎', points: 50, width: 35, height: 35, speedY: 3 },
    { type: 'bomb', emoji: '💣', points: -1, width: 40, height: 40, speedY: 2.5 },
    { type: 'fruit', emoji: '🍎', points: 20, width: 40, height: 40, speedY: 2 },
  ];
  
  ngOnInit() {
    // Initialize keyboard controls
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = 384; // h-96 = 384px
    
    // Start game loop
    this.gameLoop(0);
  }
  
  ngOnDestroy() {
    this.cleanup();
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  // Game loop
  gameLoop(timestamp: number) {
    if (!this.lastTime) this.lastTime = timestamp;
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    if (this.gameActive() && !this.isPaused) {
      this.update(deltaTime);
      this.draw();
    } else {
      this.drawStatic();
    }
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  update(deltaTime: number) {
    const speedMultiplier = deltaTime / 16; // Normalize to 60fps
    
    // Update player position
    this.player.x += this.player.direction * this.player.speed * speedMultiplier;
    this.player.x = Math.max(this.player.width / 2, Math.min(this.player.x, this.canvasRef.nativeElement.width - this.player.width / 2));
    
    // Update objects
    this.objects.update(objects => {
      const newObjects: GameObject[] = [];
      
      for (const obj of objects) {
        // Update position
        obj.y += obj.speedY * speedMultiplier;
        obj.rotation += 0.02 * speedMultiplier;
        
        // Check if object is still on screen
        if (obj.y < this.canvasRef.nativeElement.height) {
          // Check collision with player
          if (this.checkCollision(this.player, obj)) {
            this.handleCollision(obj);
            continue; // Remove object
          }
          
          newObjects.push(obj);
        }
      }
      
      return newObjects;
    });
    
    // Spawn new objects
    this.spawnObjects(deltaTime);
  }
  
  draw() {
    const ctx = this.ctx;
    const canvas = this.canvasRef.nativeElement;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (this.isDarkMode) {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
    } else {
      gradient.addColorStop(0, '#e0f2fe');
      gradient.addColorStop(1, '#d1fae5');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = this.isDarkMode ? '#334155' : '#94a3b8';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Draw objects
    this.objects().forEach(obj => {
      ctx.save();
      ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
      ctx.rotate(obj.rotation);
      
      // Draw object background
      if (obj.points > 0) {
        ctx.fillStyle = this.isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.3)';
      } else {
        ctx.fillStyle = this.isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.3)';
      }
      
      ctx.beginPath();
      ctx.roundRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height, 8);
      ctx.fill();
      
      // Draw emoji
      ctx.font = `${obj.width * 0.8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.emoji, 0, 0);
      
      ctx.restore();
    });
    
    // Draw player (pet)
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    
    // Draw pet background
    ctx.fillStyle = this.isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, this.player.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.isDarkMode ? '#475569' : '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw pet emoji
    ctx.font = `${this.player.width * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.getPetEmoji(), 0, 0);
    
    ctx.restore();
    
    // Draw UI
    this.drawUI();
  }
  
  drawStatic() {
    const ctx = this.ctx;
    const canvas = this.canvasRef.nativeElement;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (this.isDarkMode) {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
    } else {
      gradient.addColorStop(0, '#e0f2fe');
      gradient.addColorStop(1, '#d1fae5');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pet in center
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.getPetEmoji(), canvas.width / 2, canvas.height / 2);
  }
  
  drawUI() {
    const ctx = this.ctx;
    const canvas = this.canvasRef.nativeElement;
    
    // Draw score
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = this.isDarkMode ? '#ffffff' : '#1e293b';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score()}`, 10, 30);
    
    // Draw lives
    ctx.fillText(`Lives: ${this.lives()}`, 10, 60);
    
    // Draw paused indicator
    if (this.isPaused) {
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
  }
  
  spawnObjects(deltaTime: number) {
    if (!this.gameActive()) return;
    
    const spawnRate = 0.5; // Objects per second
    
    if (Math.random() < spawnRate * deltaTime / 1000) {
      const type = this.objectTypes[Math.floor(Math.random() * this.objectTypes.length)];
      const obj: GameObject = {
        id: Date.now(),
        x: Math.random() * (this.canvasRef.nativeElement.width - type.width),
        y: -type.height,
        width: type.width,
        height: type.height,
        type: type.type,
        speedY: type.speedY,
        rotation: Math.random() * Math.PI * 2,
        points: type.points,
        emoji: type.emoji
      };
      
      this.objects.update(objects => [...objects, obj]);
    }
  }
  
  checkCollision(player: any, obj: GameObject): boolean {
    const dx = player.x - (obj.x + obj.width / 2);
    const dy = player.y - (obj.y + obj.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (player.width / 2 + Math.max(obj.width, obj.height) / 2);
  }
  
  handleCollision(obj: GameObject) {
    if (obj.points < 0) {
      // Hit obstacle
      this.lives.update(l => Math.max(0, l - 1));
      
      // Create visual feedback
      this.createExplosion(obj.x + obj.width / 2, obj.y + obj.height / 2);
      
      // Check game over
      if (this.lives() === 0) {
        this.endGame();
      }
    } else {
      // Collected treat
      this.score.update(s => s + obj.points);
      
      // Create collection effect
      this.createSparkle(obj.x + obj.width / 2, obj.y + obj.height / 2);
    }
  }
  
  createExplosion(x: number, y: number) {
    // Simple visual effect by drawing an explosion
    const ctx = this.ctx;
    ctx.save();
    
    // Draw explosion
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw explosion rays
    ctx.strokeStyle = '#ff9e00';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const startX = x + Math.cos(angle) * 10;
      const startY = y + Math.sin(angle) * 10;
      const endX = x + Math.cos(angle) * 40;
      const endY = y + Math.sin(angle) * 40;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  createSparkle(x: number, y: number) {
    // Simple visual effect by drawing sparkles
    const ctx = this.ctx;
    ctx.save();
    
    ctx.fillStyle = '#ffd700';
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const radius = 15 + Math.random() * 10;
      const sparkleX = x + Math.cos(angle) * radius;
      const sparkleY = y + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 3 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Control handlers
  handleKeyDown(event: KeyboardEvent) {
    switch(event.key) {
      case 'ArrowLeft':
        this.player.direction = -1;
        break;
      case 'ArrowRight':
        this.player.direction = 1;
        break;
      case ' ':
        if (!this.gameActive()) {
          this.startGame();
        }
        break;
      case 'Enter':
        if (!this.gameActive()) {
          this.startGame();
        }
        break;
      case 'Escape':
        this.togglePause();
        break;
    }
  }
  
  handleKeyUp(event: KeyboardEvent) {
    switch(event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        this.player.direction = 0;
        break;
    }
  }
  
  onMouseMove(event: MouseEvent) {
    if (!this.gameActive()) return;
    
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    this.player.x = x;
  }
  
  onCanvasClick(event: MouseEvent) {
    if (!this.gameActive()) {
      this.startGame();
    }
  }
  
  // Game controls
  startGame() {
    this.score.set(0);
    this.lives.set(3);
    this.gameActive.set(true);
    this.gameEnded.set(false);
    this.isPaused = false;
    this.objects.set([]);
    this.player.x = this.canvasRef.nativeElement.width / 2;
  }
  
  togglePause() {
    if (this.gameActive()) {
      this.isPaused = !this.isPaused;
    }
  }
  
  endGame() {
    this.gameActive.set(false);
    this.gameEnded.set(true);
  }
  
  // Helper methods
  getPetEmoji(): string {
    const emojis: Record<string, string> = {
      'dog': '🐕',
      'cat': '🐈',
      'bird': '🦜',
      'other': '🐾'
    };
    return emojis[this.petType] || '🐾';
  }
  
  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}