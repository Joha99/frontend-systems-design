const STALE_UPDATE_PERIOD_S = 10; // 10s

// 1. Create a vanilla JavaScript store
let currentTime = Date.now();
const listeners = new Set();

export const timeStore = {
  // Increments time and notifies all subscribed React components
  start() {
    setInterval(() => {
      currentTime = Date.now();
      listeners.forEach((listener: any) => listener());
    }, 1000);
  },

  // React uses this to subscribe to changes
  subscribe(callback: any) {
    listeners.add(callback);
    return () => listeners.delete(callback); // Return a cleanup function
  },

  // React uses this to read the current immutable snapshot
  getSnapshot() {
    return currentTime;
  },

  getIsStale(timestamp: number) {
    const secondDiff = Math.max(
      Math.floor((currentTime - timestamp) / 1000),
      0,
    );
    return secondDiff >= STALE_UPDATE_PERIOD_S;
  },
};

// Start the global timer immediately
timeStore.start();
