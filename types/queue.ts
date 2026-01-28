export interface QueueItem {
  id: string
  title: string
  artist: string
  src: string
  duration: number
  coverArt?: string
}

export interface QueueState {
  items: QueueItem[]
  currentIndex: number
  isShuffled: boolean
  repeatMode: 'off' | 'all' | 'one'
}
