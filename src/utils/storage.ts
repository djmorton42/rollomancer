const STORAGE_KEYS = {
  HISTORY: 'dice-roller-history',
  FAVOURITES: 'dice-roller-favourites',
  NEXT_ID: 'dice-roller-next-id'
} as const

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : defaultValue
}

export function saveToStorage(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
} 