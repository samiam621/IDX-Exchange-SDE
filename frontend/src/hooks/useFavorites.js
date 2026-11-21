import { useSyncExternalStore } from 'react';

// Favorites live in localStorage as an array of the property objects the cards need,
// so the Favorites page can render them without asking the backend.
const KEY = 'favorites';

// One shared copy + listeners, so every component using the hook (cards, header count,
// Favorites page) re-renders together when any of them toggles a heart.
let favorites = null;
const listeners = new Set();

// read saved favorites from localStorage (always returns an array)
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return []; // missing, bad JSON, or storage blocked
  }
}

// update the list, write it to localStorage, and tell every component to re-render
function save(next) {
  favorites = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full/blocked: keep working in memory for this visit
  }
  listeners.forEach((notify) => notify());
}

// React calls this so a component hears about changes (and stops listening on unmount)
function subscribe(notify) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

// current list; loads from localStorage the first time it's needed
const getSnapshot = () => (favorites ??= load());

// useFavorites(): { favorites, count, isFavorite(id), toggleFavorite(property) }
export default function useFavorites() {
  // the shared favorites list; this component re-renders whenever it changes
  const list = useSyncExternalStore(subscribe, getSnapshot);
  // is this property id saved?
  const isFavorite = (id) => list.some((p) => p.id === id);
  // saved -> remove it, not saved -> add it
  const toggleFavorite = (property) =>
    save(isFavorite(property.id) ? list.filter((p) => p.id !== property.id) : [...list, property]);

  return { favorites: list, count: list.length, isFavorite, toggleFavorite };
}
