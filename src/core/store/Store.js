/**
 * Store - Framework-agnostic state management
 * Simple observable store that can be adapted to any UI framework
 */
export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
  }

  /**
   * Get the current state
   * @returns {Object} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Update the state and notify listeners
   * @param {Object} newState - Partial state to merge
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function to be called on state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners about state changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Reset the store to initial state
   * @param {Object} initialState - The initial state to reset to
   */
  reset(initialState = {}) {
    this.state = initialState;
    this.notifyListeners();
  }
}
