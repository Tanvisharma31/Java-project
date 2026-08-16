import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TestModeSettings {
  simulateCardLimitError: boolean;
  simulateNegativeReadingError: boolean;
  simulateAreaMismatchError: boolean;
  simulate15DayOverdue: boolean;
  simulateNetworkDelayMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class TestModeService {
  private settingsSubject = new BehaviorSubject<TestModeSettings>({
    simulateCardLimitError: false,
    simulateNegativeReadingError: false,
    simulateAreaMismatchError: false,
    simulate15DayOverdue: false,
    simulateNetworkDelayMs: 0
  });

  public settings$ = this.settingsSubject.asObservable();

  get currentSettings(): TestModeSettings {
    return this.settingsSubject.value;
  }

  updateSettings(partial: Partial<TestModeSettings>): void {
    this.settingsSubject.next({
      ...this.settingsSubject.value,
      ...partial
    });
  }

  resetSettings(): void {
    this.settingsSubject.next({
      simulateCardLimitError: false,
      simulateNegativeReadingError: false,
      simulateAreaMismatchError: false,
      simulate15DayOverdue: false,
      simulateNetworkDelayMs: 0
    });
  }
}
