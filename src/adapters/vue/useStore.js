/**
 * Vue Adapter - Connects the framework-agnostic store to Vue
 * This adapter provides Vue-specific composables for state management
 */
import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Vue composable to connect Vue components to the framework-agnostic store
 * @param {Store} store - The store instance
 * @returns {Object} Reactive state from the store
 */
export function useStore(store) {
  const state = ref(store.getState());

  let unsubscribe;

  onMounted(() => {
    unsubscribe = store.subscribe((newState) => {
      state.value = newState;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return state;
}

/**
 * Create a Vue plugin for the store
 * @param {Store} store - The store instance
 * @returns {Object} Vue plugin
 */
export function createStorePlugin(store) {
  return {
    install(app) {
      app.config.globalProperties.$store = store;
      app.provide('store', store);
    }
  };
}
