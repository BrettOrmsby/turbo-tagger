import { reactive } from 'vue'
import { useStorage } from '@vueuse/core'
import type { DeckCard, ScryfallCard } from './types'

type Store = {
  deck: DeckCard[]
  scryfallCards: ScryfallCard[]
  isTagsEdited: boolean
  isSettingsOpened: boolean
  isAddTagOpen: boolean
  globalTags: string[]
  deckSpecificTags: string[]
}

const store = reactive<Store>({
  deck: [],
  scryfallCards: [],
  globalTags: [],
  deckSpecificTags: [],
  isTagsEdited: false,
  isSettingsOpened: false,
  isAddTagOpen: false
})

type Settings = {
  tagMode: 'none' | 'deckSpecific' | 'global' | 'all'
}

const settings = useStorage('settings', { tagMode: 'deckSpecific' } as Settings, localStorage, {
  mergeDefaults: true
})

export default store
export { settings }
