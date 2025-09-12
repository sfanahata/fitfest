// Test utility functions for demonstrating flaky behavior

export const simulateNetworkDelay = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 100); // Random delay 0-100ms
  });
};
