import { Component, Input, signal, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message, PetProfile } from '../services/chat.service';

@Component({
  selector: 'app-qa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-enter max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 class="text-3xl font-bold mb-2 text-slate-900 dark:text-white">AI Pet Assistant</h2>
          <p class="text-slate-700 dark:text-slate-400 font-medium">Get instant advice about your pet's health, behavior, and care.</p>
          
          <!-- Pet Profile Badge -->
          <div [class]="(isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300') + ' inline-flex items-center gap-3 px-4 py-2 rounded-lg border mt-4'">
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
                 [class]="getPetTypeColor(petProfile().type)">
              {{ getPetEmoji(petProfile().type) }}
            </div>
            <div>
              <div class="font-bold text-slate-900 dark:text-white">{{ petProfile().name }}</div>
              <div class="text-xs text-slate-600 dark:text-slate-400 font-bold">
                {{ petProfile().breed }} • {{ petProfile().age }} years • {{ petProfile().weight }} lbs
              </div>
            </div>
            <button (click)="showProfileModal.set(true)" 
                    class="ml-2 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold">
              Edit
            </button>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="flex gap-2">
          <button (click)="clearChat()"
                  [class]="(isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300') + ' px-4 py-2 rounded-lg border font-bold text-sm transition-colors'">
            Clear Chat
          </button>
          <button (click)="loadSampleQuestions()"
                  [class]="'px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-sm transition-colors'">
            Sample Questions
          </button>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Chat Messages -->
        <div class="flex-1">
          <div [class]="(isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300') + ' rounded-2xl border shadow-sm h-[500px] flex flex-col'">
            
            <!-- Messages Area -->
            <div #messagesContainer class="flex-1 overflow-y-auto p-6 space-y-6">
              @for (message of messages(); track message.id) {
                <div [class]="'flex gap-4 ' + (message.sender === 'user' ? 'flex-row-reverse' : '')">
                  
                  <!-- Avatar -->
                  <div class="flex-shrink-0">
                    <div [class]="'w-10 h-10 rounded-full flex items-center justify-center text-lg ' + 
                                  (message.sender === 'user' 
                                    ? 'bg-cyan-600 text-white' 
                                    : 'bg-emerald-600 text-white')">
                      {{ message.sender === 'user' ? '👤' : getPetEmoji(petProfile().type) }}
                    </div>
                  </div>
                  
                  <!-- Message Bubble -->
                  <div [class]="'max-w-[80%] rounded-2xl p-4 ' + 
                                (message.sender === 'user' 
                                  ? (isDarkMode ? 'bg-cyan-900 text-white' : 'bg-cyan-600 text-white') 
                                  : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-900'))">
                    
                    @if (message.type === 'loading') {
                      <div class="flex items-center gap-2">
                        <div class="animate-pulse">Typing</div>
                        <div class="flex gap-1">
                          <div class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                          <div class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                          <div class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                        </div>
                      </div>
                    } @else {
                      <div class="whitespace-pre-wrap text-sm font-medium leading-relaxed">{{ message.content }}</div>
                      <div class="text-xs opacity-70 mt-2">{{ message.timestamp | date:'shortTime' }}</div>
                    }
                    
                  </div>
                </div>
              }
            </div>
            
            <!-- Input Area -->
            <div class="border-t p-4" [class]="isDarkMode ? 'border-slate-800' : 'border-slate-200'">
              <form (ngSubmit)="onSubmit()" class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="userInput"
                  name="userInput"
                  placeholder="Ask about diet, training, health, behavior..."
                  [class]="(isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-cyan-600') + 
                    ' flex-1 px-4 py-3 rounded-xl border focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-colors text-sm font-medium'"
                  [disabled]="isLoading()"
                >
                <button
                  type="submit"
                  [disabled]="!userInput.trim() || isLoading()"
                  [class]="(!userInput.trim() || isLoading()
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white') + 
                    ' px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2'"
                >
                  @if (isLoading()) {
                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  Send
                </button>
              </form>
              
              <!-- Quick Questions -->
              <div class="flex flex-wrap gap-2 mt-4">
                @for (question of quickQuestions; track question) {
                  <button
                    (click)="sendQuickQuestion(question)"
                    [disabled]="isLoading()"
                    [class]="(isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300') + 
                      ' px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors'"
                  >
                    {{ question }}
                  </button>
                }
              </div>
            </div>
          </div>
          
          <!-- Disclaimer -->
          <div class="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800">
            <p class="text-sm text-amber-800 dark:text-amber-300 font-bold">
              ⚠️ **Disclaimer**: AI responses are for informational purposes only and not a substitute for professional veterinary advice. Always consult with a licensed veterinarian for medical concerns.
            </p>
          </div>
        </div>
        
        <!-- Sidebar Tips -->
        <div class="md:w-80 space-y-4">
          <!-- Tips Card -->
          <div [class]="(isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300') + ' rounded-2xl border p-6'">
            <h3 class="font-bold text-lg mb-4 text-slate-900 dark:text-white">💡 Quick Tips</h3>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-2 text-slate-700 dark:text-slate-400">
                <span class="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                <span class="font-medium">Always provide fresh water daily</span>
              </li>
              <li class="flex items-start gap-2 text-slate-700 dark:text-slate-400">
                <span class="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                <span class="font-medium">Regular vet check-ups every 6-12 months</span>
              </li>
              <li class="flex items-start gap-2 text-slate-700 dark:text-slate-400">
                <span class="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                <span class="font-medium">Keep toxic foods out of reach</span>
              </li>
              <li class="flex items-start gap-2 text-slate-700 dark:text-slate-400">
                <span class="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                <span class="font-medium">Exercise & mental stimulation daily</span>
              </li>
            </ul>
          </div>
          
          <!-- Emergency Card -->
          <div class="rounded-2xl p-6 bg-gradient-to-br from-red-500 to-rose-600 text-white">
            <h3 class="font-bold text-lg mb-3">🚨 Emergency Signs</h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span class="font-medium">Difficulty breathing</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span class="font-medium">Collapse or inability to stand</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span class="font-medium">Seizures or tremors</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span class="font-medium">Bleeding that won't stop</span>
              </li>
            </ul>
            <p class="mt-4 text-sm font-bold opacity-90">
              If you observe these signs, contact your vet or emergency clinic immediately!
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    @if (showProfileModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div [class]="(isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300') + ' rounded-2xl border w-full max-w-md p-6'">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Edit Pet Profile</h3>
            <button (click)="showProfileModal.set(false)" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Pet Name</label>
              <input type="text" [(ngModel)]="tempProfile.name"
                     [class]="(isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900') + ' w-full px-4 py-2 rounded-lg border'">
            </div>
            
            <div>
              <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Pet Type</label>
              <div class="grid grid-cols-4 gap-2">
                <button (click)="tempProfile.type = 'dog'"
                        [class]="(tempProfile.type === 'dog' 
                          ? 'bg-cyan-600 text-white' 
                          : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')) + 
                          ' py-2 rounded-lg text-sm font-bold transition-colors'">
                  Dog
                </button>
                <button (click)="tempProfile.type = 'cat'"
                        [class]="(tempProfile.type === 'cat' 
                          ? 'bg-cyan-600 text-white' 
                          : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')) + 
                          ' py-2 rounded-lg text-sm font-bold transition-colors'">
                  Cat
                </button>
                <button (click)="tempProfile.type = 'bird'"
                        [class]="(tempProfile.type === 'bird' 
                          ? 'bg-cyan-600 text-white' 
                          : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')) + 
                          ' py-2 rounded-lg text-sm font-bold transition-colors'">
                  Bird
                </button>
                <button (click)="tempProfile.type = 'other'"
                        [class]="(tempProfile.type === 'other' 
                          ? 'bg-cyan-600 text-white' 
                          : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')) + 
                          ' py-2 rounded-lg text-sm font-bold transition-colors'">
                  Other
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Breed</label>
              <input type="text" [(ngModel)]="tempProfile.breed"
                     [class]="(isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900') + ' w-full px-4 py-2 rounded-lg border'">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Age (years)</label>
                <input type="number" [(ngModel)]="tempProfile.age" min="0" max="30"
                       [class]="(isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900') + ' w-full px-4 py-2 rounded-lg border'">
              </div>
              <div>
                <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Weight (lbs)</label>
                <input type="number" [(ngModel)]="tempProfile.weight" min="1" max="200"
                       [class]="(isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900') + ' w-full px-4 py-2 rounded-lg border'">
              </div>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button (click)="saveProfile()"
                      class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-bold transition-colors">
                Save Profile
              </button>
              <button (click)="showProfileModal.set(false)"
                      [class]="(isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700') + ' flex-1 py-3 rounded-lg font-bold transition-colors'">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class QaComponent implements AfterViewChecked, OnInit {
  @Input() isDarkMode: boolean = false;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  userInput = '';
  isLoading = signal(false);
  showProfileModal = signal(false);
  
  tempProfile: PetProfile = {
    name: '',
    type: 'dog',
    breed: '',
    age: 3,
    weight: 20
  };
  
  quickQuestions = [
    'Best food for my pet?',
    'How much exercise needed?',
    'Is this behavior normal?',
    'Grooming tips?',
    'Training advice?'
  ];

  constructor(private chatService: ChatService) {}

  get messages() {
    return this.chatService.getMessages();
  }

  get petProfile() {
    return this.chatService.getPetProfile();
  }

  ngOnInit() {
    // Initialize temp profile with current values
    const current = this.petProfile();
    this.tempProfile = { ...current };
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async onSubmit() {
    if (!this.userInput.trim() || this.isLoading()) return;
    
    this.isLoading.set(true);
    try {
      await this.chatService.sendMessage(this.userInput);
      this.userInput = '';
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  sendQuickQuestion(question: string) {
    if (this.isLoading()) return;
    this.userInput = question;
    this.onSubmit();
  }

  loadSampleQuestions() {
    const questions = [
      'What should I feed my 3-year-old Golden Retriever?',
      'How much exercise does my dog need daily?',
      'Is it normal for my cat to sleep 16 hours a day?',
      'How can I potty train my new puppy?',
      'What vaccinations does my kitten need?'
    ];
    
    questions.forEach((q, i) => {
      setTimeout(() => {
        this.chatService.sendMessage(q);
      }, i * 1000);
    });
  }

  clearChat() {
    this.chatService.clearChat();
  }

  saveProfile() {
    this.chatService.updatePetProfile(this.tempProfile);
    this.showProfileModal.set(false);
  }

  getPetEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'dog': '🐕',
      'cat': '🐈',
      'bird': '🦜',
      'other': '🐾'
    };
    return emojis[type] || '🐾';
  }

  getPetTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'dog': 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300',
      'cat': 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300',
      'bird': 'bg-sky-100 dark:bg-sky-900/30 text-sky-900 dark:text-sky-300',
      'other': 'bg-slate-100 dark:bg-slate-900/30 text-slate-900 dark:text-slate-300'
    };
    return colors[type] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-900 dark:text-slate-300';
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {
      console.error('Scroll error:', err);
    }
  }
}