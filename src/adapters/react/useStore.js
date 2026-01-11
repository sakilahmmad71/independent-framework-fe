/**
 * React Adapter - Connects the framework-agnostic store to React
 * This adapter provides React-specific hooks for state management
 */
import { useState, useEffect } from 'react';

/**
 * Custom hook to connect React components to the framework-agnostic store
 * @param {Store} store - The store instance
 * @returns {Object} Current state from the store
 */
export function useStore(store) {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [store]);

  return state;
}

/**
 * Higher-order component that injects store into props
 * @param {Store} store - The store instance
 * @returns {Function} HOC function
 */
export function withStore(store) {
  return function(Component) {
    return function WithStoreComponent(props) {
      const state = useStore(store);
      return <Component {...props} state={state} />;
    };
  };
}
