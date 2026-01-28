"use client"

import { useState, useCallback } from 'react'
import type { QueueState, QueueItem } from '@/types/queue'

export const usePlayQueue = (initialQueue: QueueItem[] = []) => {
  const [queue, setQueue] = useState<QueueState>({
    items: initialQueue,
    currentIndex: 0,
    isShuffled: false,
    repeatMode: 'off',
  })

  const getCurrentTrack = useCallback((): QueueItem | undefined => {
    return queue.items[queue.currentIndex]
  }, [queue.items, queue.currentIndex])

  const next = useCallback(() => {
    setQueue(prev => {
      if (prev.repeatMode === 'one') {
        return prev // Will replay current track
      }

      let nextIndex = prev.currentIndex + 1

      if (nextIndex >= prev.items.length) {
        if (prev.repeatMode === 'all') {
          nextIndex = 0
        } else {
          return prev // End of queue
        }
      }

      return { ...prev, currentIndex: nextIndex }
    })
  }, [])

  const previous = useCallback(() => {
    setQueue(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }))
  }, [])

  const goToIndex = useCallback((index: number) => {
    setQueue(prev => {
      if (index >= 0 && index < prev.items.length) {
        return { ...prev, currentIndex: index }
      }
      return prev
    })
  }, [])

  const shuffle = useCallback((items: QueueItem[]): QueueItem[] => {
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [])

  const toggleShuffle = useCallback(() => {
    setQueue(prev => {
      const currentTrack = prev.items[prev.currentIndex]
      let newItems: QueueItem[]
      let newIndex = 0

      if (!prev.isShuffled) {
        // Enable shuffle
        newItems = shuffle(prev.items)
        // Find the current track in shuffled list
        newIndex = newItems.findIndex(item => item.id === currentTrack?.id)
        if (newIndex === -1) newIndex = 0
      } else {
        // Disable shuffle - restore original order
        newItems = initialQueue
        newIndex = newItems.findIndex(item => item.id === currentTrack?.id)
        if (newIndex === -1) newIndex = 0
      }

      return {
        ...prev,
        isShuffled: !prev.isShuffled,
        items: newItems,
        currentIndex: newIndex,
      }
    })
  }, [initialQueue, shuffle])

  const toggleRepeat = useCallback(() => {
    setQueue(prev => {
      const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one']
      const currentModeIndex = modes.indexOf(prev.repeatMode)
      const nextMode = modes[(currentModeIndex + 1) % modes.length] ?? 'off'
      return { ...prev, repeatMode: nextMode }
    })
  }, [])

  const setRepeatMode = useCallback((mode: 'off' | 'all' | 'one') => {
    setQueue(prev => ({ ...prev, repeatMode: mode }))
  }, [])

  const addToQueue = useCallback((item: QueueItem) => {
    setQueue(prev => ({
      ...prev,
      items: [...prev.items, item],
    }))
  }, [])

  const addToQueueNext = useCallback((item: QueueItem) => {
    setQueue(prev => {
      const newItems = [...prev.items]
      newItems.splice(prev.currentIndex + 1, 0, item)
      return { ...prev, items: newItems }
    })
  }, [])

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      const newItems = prev.items.filter((_, i) => i !== index)
      let newIndex = prev.currentIndex

      if (index < prev.currentIndex) {
        newIndex--
      } else if (index === prev.currentIndex && newIndex >= newItems.length) {
        newIndex = Math.max(0, newItems.length - 1)
      }

      return {
        ...prev,
        items: newItems,
        currentIndex: newIndex,
      }
    })
  }, [])

  const clearQueue = useCallback(() => {
    setQueue(prev => ({
      ...prev,
      items: [],
      currentIndex: 0,
    }))
  }, [])

  const setQueue_ = useCallback((items: QueueItem[], startIndex = 0) => {
    setQueue(prev => ({
      ...prev,
      items,
      currentIndex: startIndex,
      isShuffled: false,
    }))
  }, [])

  const moveInQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      if (fromIndex < 0 || fromIndex >= prev.items.length ||
          toIndex < 0 || toIndex >= prev.items.length) {
        return prev
      }

      const newItems = [...prev.items]
      const [movedItem] = newItems.splice(fromIndex, 1)
      newItems.splice(toIndex, 0, movedItem)

      let newIndex = prev.currentIndex
      if (prev.currentIndex === fromIndex) {
        newIndex = toIndex
      } else if (fromIndex < prev.currentIndex && toIndex >= prev.currentIndex) {
        newIndex--
      } else if (fromIndex > prev.currentIndex && toIndex <= prev.currentIndex) {
        newIndex++
      }

      return { ...prev, items: newItems, currentIndex: newIndex }
    })
  }, [])

  return {
    queue,
    getCurrentTrack,
    next,
    previous,
    goToIndex,
    toggleShuffle,
    toggleRepeat,
    setRepeatMode,
    addToQueue,
    addToQueueNext,
    removeFromQueue,
    clearQueue,
    setQueue: setQueue_,
    moveInQueue,
  }
}
