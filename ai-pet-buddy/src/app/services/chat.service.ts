// src/app/services/chat.service.ts
import { Injectable, signal } from '@angular/core';
import { SoundService } from '../components/sound/sound.service';

export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'loading' | 'error' | 'thinking';
  petType?: 'dog' | 'cat' | 'bird' | 'other';
}

export interface PetProfile {
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'other';
  breed?: string;
  age?: number;
  weight?: number;
  medicalConditions?: string[];
  mood?: 'happy' | 'sad' | 'playful' | 'hungry' | 'tired';
  happiness?: number;
  energy?: number;
  hunger?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages = signal<Message[]>([
    {
      id: 1,
      content: 'Hello there! I\'m your AI Pet Companion, here to help with all your pet-related questions. I can assist with training tips, health concerns, behavioral issues, nutrition advice, and general pet care. What would you like to know about your furry (or feathered, or scaled) friend today? 🐾',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  private petProfile = signal<PetProfile>({
    name: 'Buddy',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 70,
    mood: 'happy',
    happiness: 75,
    energy: 90,
    hunger: 40
  });

  private determineMoodFromContent(content: string): 'happy' | 'sad' | 'playful' | 'hungry' | 'tired' {
    const text = content.toLowerCase();
    if (text.includes('happy') || text.includes('good') || text.includes('great') || text.includes('excited')) return 'happy';
    if (text.includes('sad') || text.includes('bad') || text.includes('upset') || text.includes('worried')) return 'sad';
    if (text.includes('play') || text.includes('game') || text.includes('fun') || text.includes('toy')) return 'playful';
    if (text.includes('hungry') || text.includes('food') || text.includes('eat') || text.includes('meal')) return 'hungry';
    if (text.includes('tired') || text.includes('sleep') || text.includes('rest') || text.includes('exhausted')) return 'tired';
    return 'happy';
  }

  private aiThinkingPhrases = [
    "Let me think about that for a moment...",
    "That's an interesting question about your pet!",
    "I'm analyzing that based on your pet's profile...",
    "Let me provide some helpful information about that...",
    "Based on what I know about pet care..."
  ];

  constructor(private soundService: SoundService) {}

  getMessages() {
    return this.messages.asReadonly();
  }

  getPetProfile() {
    return this.petProfile.asReadonly();
  }

  updatePetProfile(profile: Partial<PetProfile>) {
    const oldType = this.petProfile().type;
    const newType = profile.type;
    
    this.petProfile.update(current => ({ ...current, ...profile }));
    
    // Play animal sound when pet type changes
    if (newType && newType !== oldType) {
      this.soundService.playPetSound(newType);
    }
  }

  async sendMessage(content: string) {
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    this.messages.update(messages => [...messages, userMessage]);

    // Add thinking message
    const thinkingMessage: Message = {
      id: Date.now() + 1,
      content: this.getRandomThinkingPhrase(),
      sender: 'ai',
      timestamp: new Date(),
      type: 'thinking'
    };
    
    this.messages.update(messages => [...messages, thinkingMessage]);

    // Update pet mood based on message
    this.updatePetMood(this.determineMoodFromContent(content));
    
    // Play interaction sound
    this.soundService.playInteractionSound();

    // Simulate AI thinking (variable delay based on message length)
    await this.delay(600 + Math.min(content.length * 10, 2000));

    // Remove thinking message
    this.messages.update(messages => messages.filter(m => m.type !== 'thinking'));

    // Add AI response
    const aiResponse: Message = {
      id: Date.now() + 2,
      content: await this.generateAIResponse(content),
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      petType: this.petProfile().type
    };

    this.messages.update(messages => [...messages, aiResponse]);
    
    // Occasionally play pet sound after AI response (30% chance)
    if (Math.random() > 0.7) {
      this.soundService.playPetSound(this.petProfile().type);
    }
  }

  clearChat() {
    this.messages.set([
      {
        id: 1,
        content: 'Hello! I\'m your AI Pet Buddy. Ask me anything about your pet\'s health, behavior, nutrition, or training. How can I help you today? 🐾',
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    this.soundService.playSound('click');
  }
  

  private async generateAIResponse(userMessage: string): Promise<string> {
    const message = userMessage.toLowerCase();
    const currentProfile = this.petProfile();
    const petName = currentProfile.name;
    const petType = currentProfile.type;
    const breed = currentProfile.breed || petType;
    const age = currentProfile.age ?? 0;
    const weight = currentProfile.weight ?? 0;
    
    // Get pet-specific greeting
    const greeting = this.getPetGreeting();
    
    // More comprehensive response system
    const responses: { [key: string]: string } = {
      // Health and medical questions
      'health': `I understand you're asking about your pet's health. ${greeting} While I can provide general information, I must emphasize that I'm not a veterinarian. For specific medical concerns, please consult with a licensed veterinarian who can examine your pet in person.`,
      
      'emergency': `**Important Notice**: ${greeting} If your pet is experiencing any of the following symptoms: difficulty breathing, uncontrolled bleeding, loss of consciousness, seizures, or ingestion of toxic substances, please seek emergency veterinary care immediately. For non-emergency concerns, I'm happy to discuss general care tips.`,
      
      'sick': `${greeting} I'm sorry to hear your ${petName} isn't feeling well. Common signs of illness in ${breed}s include changes in appetite, energy levels, or bathroom habits. Ensure they have access to fresh water and monitor their symptoms. If symptoms persist for more than 24 hours or worsen, please contact your veterinarian.`,
      
      'vomit': `${greeting} Occasional vomiting can happen with pets, but frequent vomiting requires attention. If ${petName} is vomiting repeatedly, has blood in vomit, or shows other symptoms like lethargy, please contact your vet. For mild cases, you might try withholding food for 12 hours (water only) and then introducing a bland diet.`,
      
      // Nutrition and diet
      'food': `${greeting} Nutrition is crucial for ${breed}s like ${petName}! A balanced diet should include high-quality protein, healthy fats, and essential nutrients. The specific amount depends on ${petName}'s age (${age} years), weight (${weight} lbs), and activity level. Generally, adult ${breed}s need about 30 calories per pound of body weight daily.`,
      
      'diet': `${greeting} For ${breed}s, I recommend a diet with real meat as the primary ingredient. Look for foods that meet AAFCO standards. Consider ${petName}'s age: at ${age} years, they're in the adult stage. Adjust portions based on activity - if they seem hungry, try splitting meals into smaller portions throughout the day.`,
      
      'treat': `${greeting} Treats should make up no more than 10% of ${petName}'s daily calories. Choose healthy options like carrots, apple slices (no seeds), or commercial treats with limited ingredients. Training treats should be pea-sized to avoid weight gain.`,
      
      // Training and behavior
      'train': `${greeting} Training ${breed}s like ${petName} requires patience and consistency. Use positive reinforcement - reward desired behaviors immediately with treats, praise, or play. Keep sessions short (5-15 minutes) and end on a positive note. What specific behavior are you working on?`,
      
      'behavior': `${greeting} Behavior issues in ${breed}s often stem from boredom, lack of exercise, or inconsistent training. ${petName} at ${age} years old still needs mental stimulation. Try puzzle toys, regular exercise, and establishing clear routines.`,
      
      'bark': `${greeting} Barking is natural communication for dogs. For excessive barking, first identify the trigger (boredom, alert, attention-seeking). Provide adequate exercise, mental stimulation, and teach a "quiet" command using positive reinforcement. Never punish barking - redirect instead.`,
      
      'litter': `${greeting} Litter box issues in cats can have many causes: medical issues, stress, or box preferences. Ensure you have enough boxes (one per cat plus one), keep them clean, try different litters, and place in quiet locations. If problems persist, a vet visit is recommended to rule out UTIs or other issues.`,
      
      // Exercise and activity
      'exercise': `${greeting} ${breed}s like ${petName} typically need ${petType === 'dog' ? '30-60 minutes' : petType === 'cat' ? '15-30 minutes' : 'varies'} of daily exercise. Mix activities: walks, play sessions, and mental games. Watch for signs of fatigue - panting, lagging behind, or lying down during activity.`,
      
      'walk': `${greeting} Walking your ${breed} is great exercise! Aim for at least 30 minutes daily, split into two walks if possible. Use a comfortable harness, bring water, and avoid hot pavement. Let ${petName} sniff occasionally - it provides mental stimulation.`,
      
      'play': `${greeting} Play is essential for ${petName}'s wellbeing! For ${breed}s, try interactive toys that mimic natural behaviors. Rotate toys weekly to maintain interest. Watch for signs ${petName} is done playing: turning away, lying down, or losing interest in the toy.`,
      
      // Grooming and care
      'groom': `${greeting} Grooming needs vary by breed. For ${breed}s, regular brushing (${petType === 'dog' ? '2-3 times weekly' : 'daily for long-haired cats'}) prevents mats. Bathe every 4-6 weeks with pet-specific shampoo. Don't forget dental care - brush teeth several times weekly if possible.`,
      
      'bath': `${greeting} Bathing ${petName}: Use lukewarm water and pet shampoo. Wet thoroughly, shampoo (avoid eyes/ears), rinse completely, and dry well. Praise and treat afterward to create positive associations. Most pets need bathing every 4-8 weeks unless they get particularly dirty.`,
      
      // General care and questions
      'age': `${greeting} ${petName} is ${age} years old, which is equivalent to about ${age * 7} human years for ${petType === 'dog' ? 'medium dogs' : 'cats'}. At this age, regular vet checkups (every 6-12 months) are important to catch age-related changes early.`,
      
      'weight': `${greeting} At ${weight} lbs, ${petName}'s weight seems ${weight > 75 ? 'on the higher side' : 'within a healthy range'} for a ${breed}. You should be able to feel but not see their ribs, and they should have a visible waist when viewed from above.`,
      
      'vaccine': `${greeting} Vaccination needs depend on ${petName}'s age, lifestyle, and local regulations. Core vaccines are essential for all pets, while non-core vaccines depend on exposure risk. Discuss with your vet to create a vaccination schedule tailored to ${petName}.`,
      
      'pet': `${greeting} As a ${breed}, ${petName} has specific needs. Generally, ensure they have: fresh water always, balanced nutrition, regular exercise, mental stimulation, veterinary care, love and attention. Watch for changes in behavior that might indicate issues.`,
    };

    // Check for keywords and return appropriate response
    for (const [keyword, response] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        // Update relevant stats
        this.updateStatsForTopic(keyword);
        return response;
      }
    }

    // For general conversational responses
    const generalResponses = [
      `${greeting} That's an interesting question about ${petName}! Could you tell me more about what specifically you'd like to know? I want to make sure I give you the most helpful information.`,
      
      `${greeting} I'd be happy to help with that! To give you the best advice, could you provide a bit more context? For example, how long has this been going on, and have you noticed any specific triggers or patterns?`,
      
      `${greeting} Thanks for asking about ${petName}'s care! Based on their profile as a ${age}-year-old ${breed}, I can share some general guidelines. However, remember that individual pets may have unique needs.`,
      
      `${greeting} Great question! When it comes to ${breed}s like ${petName}, there are several factors to consider including age, activity level, and individual preferences. What specific aspect are you most concerned about?`,
      
      `${greeting} I appreciate you asking about this for ${petName}'s wellbeing. Could you clarify if this is something new or if it's been ongoing? Understanding the timeline helps me provide more relevant suggestions.`,
    ];

    // Default response for unrecognized topics
    const randomIndex = Math.floor(Math.random() * generalResponses.length);
    this.updateNumericStat('happiness', 2); // Small happiness boost for engagement
    return generalResponses[randomIndex];
  }

  private getPetGreeting(): string {
    const greetings = {
      dog: ['Woof! ', 'Arf! I\'d be happy to help! ', 'Tail wagging! ', 'Paws up! '],
      cat: ['Meow! ', 'Purring... ', '*head bump* ', 'Paws kneading... '],
      bird: ['Chirp! ', 'Feathers ruffling... ', 'Beak clicking... ', 'Singing... '],
      other: ['Hello! ', '*sniff sniff* ', '*curious look* ', '*happy sounds* ']
    };
    
    const petType = this.petProfile().type;
    const greetingList = greetings[petType] || greetings.other;
    return greetingList[Math.floor(Math.random() * greetingList.length)];
  }

  private getRandomThinkingPhrase(): string {
    return this.aiThinkingPhrases[Math.floor(Math.random() * this.aiThinkingPhrases.length)];
  }

  private updatePetMood(mood: 'happy' | 'sad' | 'playful' | 'hungry' | 'tired') {
    this.petProfile.update(profile => ({
      ...profile,
      mood
    }));
  }

  private updateStatsForTopic(topic: string) {
    const statUpdates: { [key: string]: { stat: 'happiness' | 'energy' | 'hunger', value: number } } = {
      'food': { stat: 'hunger', value: -15 },
      'diet': { stat: 'hunger', value: -10 },
      'exercise': { stat: 'energy', value: -10 },
      'play': { stat: 'happiness', value: 10 },
      'train': { stat: 'happiness', value: 5 },
      'sick': { stat: 'happiness', value: -5 },
      'emergency': { stat: 'happiness', value: -8 }
    };

    if (statUpdates[topic]) {
      this.updateNumericStat(statUpdates[topic].stat, statUpdates[topic].value);
    }
  }

  private updateNumericStat(stat: 'happiness' | 'energy' | 'hunger', value: number) {
    const currentProfile = this.petProfile();
    const currentValue = currentProfile[stat] || 50;
    
    let newValue = currentValue + value;
    newValue = Math.max(0, Math.min(100, newValue));
    
    this.petProfile.update(profile => ({
      ...profile,
      [stat]: newValue
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}