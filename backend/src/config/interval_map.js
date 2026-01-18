// src/config/interval_map.js
const intervals = new Map();  // userId -> intervalId

export const startAutoSearch = (userId, callback) => {
  if (intervals.has(userId)) clearInterval(intervals.get(userId));
  const intervalId = setInterval(callback, parseInt(process.env.AUTO_SEARCH_INTERVAL) || 7200000);  // Default 2 hours
  intervals.set(userId, intervalId);
  console.log(`Auto-search started for user ${userId} (30 apps/day across roles)`);
};

export const stopAutoSearch = (userId) => {
  if (intervals.has(userId)) {
    clearInterval(intervals.get(userId));
    intervals.delete(userId);
    console.log(`Auto-search stopped for user ${userId}`);
  }
};