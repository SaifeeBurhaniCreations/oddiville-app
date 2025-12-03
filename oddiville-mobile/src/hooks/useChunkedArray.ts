import { useMemo } from 'react'

export function useChunkedArray<T>(array: T[], chunkSize: number = 2): T[][] {
  return useMemo(() => {
    const chunks: T[][] = []
    for (let i = 0; i < array?.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }, [array, chunkSize])
}
