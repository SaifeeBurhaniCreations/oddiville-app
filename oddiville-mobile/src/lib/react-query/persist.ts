import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistQueryClient, Persister } from '@tanstack/react-query-persist-client'
import { queryClient } from './index'

const PERSIST_KEY = 'REACT_QUERY_OFFLINE_CACHE'

const asyncStoragePersister: Persister = {
  persistClient: async (client) => {
    try {
      await AsyncStorage.setItem(PERSIST_KEY, JSON.stringify(client))
    } catch (err) {
      console.error('Error persisting client', err)
    }
  },

  restoreClient: async () => {
    try {
      const cached = await AsyncStorage.getItem(PERSIST_KEY)
      return cached ? JSON.parse(cached) : undefined
    } catch (err) {
      console.error('Error restoring client', err)
      return undefined
    }
  },

  removeClient: async () => {
    try {
      await AsyncStorage.removeItem(PERSIST_KEY)
    } catch (err) {
      console.error('Error removing client', err)
    }
  },
}

export function setupQueryPersistence() {
  persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => query.state.status === 'success',
    },
  })
}
