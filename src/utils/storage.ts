const STORAGE_KEYS = {
  HISTORY: 'dice-roller-history',
  FAVOURITES: 'dice-roller-favourites',
  NEXT_ID: 'dice-roller-next-id'
} as const

export function loadFromStorage<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
  const stored = localStorage.getItem(STORAGE_KEYS[key])
  return stored ? JSON.parse(stored) : defaultValue
}

export function saveToStorage(key: keyof typeof STORAGE_KEYS, value: unknown): void {
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value))
} 