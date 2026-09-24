import type { AnimationEventType, AnimationEventPayload } from '../types/animationTypes';

type EventCallback<T = any> = (payload: AnimationEventPayload<T>) => void;

class AnimationEventEmitter {
  private listeners: Map<AnimationEventType, Set<EventCallback>> = new Map();

  on<T = any>(event: AnimationEventType, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
      }
    };
  }

  emit<T = any>(event: AnimationEventType, data?: T): void {
    const payload: AnimationEventPayload<T> = {
      type: event,
      timestamp: Date.now(),
      data,
    };

    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[AnimationEventEmitter] Listener error on ${event}:`, err);
        }
      });
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const animationEvents = new AnimationEventEmitter();
