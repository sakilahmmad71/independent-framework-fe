/**
 * Observer interface for state changes
 * This allows framework adapters to subscribe to business logic events
 */
export type Observer<T> = (data: T) => void;

/**
 * Observable interface for publishing state changes
 */
export interface Observable<T> {
  subscribe(observer: Observer<T>): () => void;
  notify(data: T): void;
}

/**
 * Simple implementation of Observable pattern
 */
export class SimpleObservable<T> implements Observable<T> {
  private observers: Set<Observer<T>> = new Set();

  subscribe(observer: Observer<T>): () => void {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  notify(data: T): void {
    this.observers.forEach(observer => observer(data));
  }
}
