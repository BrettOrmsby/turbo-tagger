<template>
  <div class="container">
    <label for="deck">Deck: </label>
    <Textarea
      v-model="deckText"
      rows="10"
      id="deck"
      :invalid="errorMessages.length > 0"
      placeholder="1 Live Fast (KLD) 87 *F* #!Global #Deck-Specific"
    />
    <div v-if="errorMessages.length > 0" class="error-container">
      <div class="error" v-for="(error, index) of errorMessages" :key="index">{{ error }}</div>
    </div>
    <Button label="Load Deck" @click="loadDeck" :loading="isLoading" />
    <h2>Help</h2>
    <Accordion value="-1">
      <AccordionPanel value="0">
        <AccordionHeader>
          <span>
            <DownloadIcon />
            Importing A Deck</span
          ></AccordionHeader
        >
        <AccordionContent>
          <p>
            Visit your deck on <a href="https://www.moxfield.com/">Moxfield</a> and click the
            Edit/Bulk Edit link. Copy the main deck to your clipboard and paste it into the textarea
            above. Press the load deck button to start loading the cards. Unless there was an issue
            with copying the deck from Moxfield, no errors should occur.
          </p>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="1">
        <AccordionHeader
          ><span>
            <TagIcon />
            Tagging a Deck</span
          ></AccordionHeader
        >
        <AccordionContent>
          <p>
            First, begin by selecting a tagging mode by pressing the settings button (<SettingsIcon />).
            Here, you can select to hide cards that have been tagged. This can be useful if you want
            to tag every card in the deck so that the cards that remain untagged as you go will
            remain on the screen. Beside the settings button, you will see a list of current tags.
            Depending on the hidden tag settings, the global or deck specific tags might not be on
            the list. To add a tag, you can press the plus button (<PlusIcon />) and type in your
            tag name before pressing the attached plus button. To tag a card, ensure that the proper
            tag is selected by clicking on it, then you can click on the cards that match the tag.
            When you switch to a new tag by taping on it, depending on the tagging settings, the
            cards you previously selected will disappear, making it easier to see which cards have
            not yet been tagged. When you are finished, you can click the Done button.
          </p>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="2">
        <AccordionHeader
          ><span>
            <PaperclipIcon />
            Exporting A Deck</span
          ></AccordionHeader
        >
        <AccordionContent>
          <p>
            Click the Copy Deck button and paste the deck into the Bulk Edit page on Moxfield. Then
            click the save button.
          </p>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script lang="ts" setup>
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import { DownloadIcon, PaperclipIcon, TagIcon, SettingsIcon, PlusIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import store from '@/lib/store'
import type { ScryfallCard, DeckCard } from '@/lib/types'
import streamToString from '@/lib/streamToString'
import normalizeName from '@/lib/normalizeName'
const props = defineProps<{ navigateTo: (to: string) => void }>()

const deckText = ref('')
const errorMessages = ref<string[]>([])
const isLoading = ref(false)

const loadDeck = async () => {
  errorMessages.value = []
  isLoading.value = true

  // Convert the deck to an object
  const { cards: deckCards, errors } = deckToJson(deckText.value)
  if (errors.length > 0) {
    errorMessages.value = [...errors]
    isLoading.value = false
    return
  }

  // Get the scryfall data from the deck
  const { error, cards, notFound } = await loadScryfallData(deckCards)
  if (error) {
    errorMessages.value.push('Loading Error, try loading the deck again.')
    return
  }

  // Display the missing cards
  notFound.forEach((identifier) => {
    for (let i = 0; i < deckCards.length; i++) {
      const card = deckCards[i]
      if (normalizeName(card.name) === identifier.name) {
        errorMessages.value.push(
          `Invalid Card Error on line ${
            i + 1
          }, ensure the card name is correct: ${deckText.value.split('\n')[i]} `
        )
        break
      }
    }
  })

  isLoading.value = false

  if (notFound.length === 0) {
    store.deck = sortDeck(deckCards, cards)
    store.scryfallCards = cards
    store.isTagsEdited = false
    const globalTags = new Set<string>()
    const deckSpecificTags = new Set<string>()
    deckCards.forEach((deckCard) => {
      deckCard.globalTags.forEach((tag) => globalTags.add(tag))
      deckCard.deckSpecificTags.forEach((tag) => deckSpecificTags.add(tag))
    })
    store.globalTags = [...globalTags]
    store.deckSpecificTags = [...deckSpecificTags]
    props.navigateTo('2')
  }
}

/*
 * Load the scryfall data
 */
const loadScryfallData = async (
  deck: DeckCard[]
): Promise<{ error: Error | null; cards: ScryfallCard[]; notFound: { name: string }[] }> => {
  let cards: ScryfallCard[] = []
  let notFound: { name: string }[] = []
  let error: null | Error = null

  const identifiers = deck.map((card) => {
    return {
      name: normalizeName(card.name)
      // TODO: can do set but might not work for plist, I do not know
    }
  })

  // Scryfall has a 75 card limit for identifiers
  const chunkSize = 75
  for (let i = 0; i < identifiers.length; i += chunkSize) {
    const chunk = identifiers.slice(i, i + chunkSize)
    try {
      const response = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        body: JSON.stringify({ identifiers: chunk }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        error = new Error(response.statusText)
        continue
      }

      // The request was successful
      if (response.body !== null) {
        const bodyString = await streamToString(response.body)
        const listObj = JSON.parse(bodyString)
        cards = [...cards, ...listObj.data]
        if (listObj.not_found) {
          notFound = [...notFound, ...listObj.not_found]
        }
      }
    } catch (e: any) {
      error = e
    }
  }

  /*
  TODO: do the english cards need to be fetched, and can they?
  try {
    // Fetch all english versions of the non-english cards
    const englishCards = await Promise.all(
      cards.map(async (card) => {
        if (card.lang === 'en') {
          return card
        }
        const response = await fetch(
          `https://api.scryfall.com/cards/${card.set}/${card.collector_number}/en`
        )

        if (!response.ok) {
          throw new Error(response.statusText)
        }
        const data = await response.json()
        return data as ScryfallCard
      })
    )
    cards = englishCards
  } catch (e: any) {
    error = e
  }
    */

  return { cards, notFound, error }
}

/*
 * Convert the deck string to an object
 */
const deckToJson = (deck: string): { cards: DeckCard[]; errors: string[] } => {
  const errors: string[] = []
  const cards: DeckCard[] = []
  const lines = deck.split('\n')

  for (let i = 0; i < deck.split('\n').length; i++) {
    const line = lines[i]
    if (line.trim() === '') {
      continue
    }

    // Try to match the card
    const matches = line
      .trim()
      .match(/^(\d+) (.+?) \(([A-Za-z0-9]+)\) ([-A-Za-z0-9]+†?)( \*[FE]\*)?( (#!?.+? ?)*)?$/)
    if (matches === null) {
      errors.push(`Formatting Error on line ${i + 1}: ${line}`)
      continue
    }

    const deckSpecificTags =
      (matches[6] ?? '')
        .match(/#[^#!][^#]*/g)
        ?.map((tag) => (tag.match(/#(.*)/) as [string, string])[1].trim()) || []
    const globalTags =
      (matches[6] ?? '')
        .match(/#![^#]*/g)
        ?.map((tag) => (tag.match(/#!(.*)/) as [string, string])[1].trim()) || []
    cards.push({
      amount: parseInt(matches[1]),
      name: matches[2].trim(),
      set: matches[3].trim(),
      collectorNumber: matches[4].trim(),
      isFoil: matches[5]?.trim() === '*F*',
      isEtched: matches[5]?.trim() === '*E*',
      globalTags: globalTags,
      deckSpecificTags: deckSpecificTags
    })
  }
  return { cards, errors }
}

/* Sort the deck by card type */
const sortDeck = (deck: DeckCard[], scryfallCards: ScryfallCard[]): DeckCard[] => {
  const mainTypes = [
    'Land',
    'Creature',
    'Sorcery',
    'Instant',
    'Planeswalker',
    'Battle',
    'Artifact',
    'Enchantment'
  ]

  const getMainType = (card: ScryfallCard): string => {
    const typeLine = card.type_line.split('—')[0]
    for (const type of mainTypes) {
      if (typeLine.includes(type)) {
        return type
      }
    }
    return typeLine.split(' ')[0]
  }

  return deck.sort((a, b) => {
    const scryfallA = scryfallCards.find(
      (card) => normalizeName(card.name) === normalizeName(a.name)
    )!
    const scryfallB = scryfallCards.find(
      (card) => normalizeName(card.name) === normalizeName(b.name)
    )!

    return getMainType(scryfallA) > getMainType(scryfallB) ? 1 : -1
  })
}
</script>

<style scoped>
.container {
  padding: var(--block-space);
}
label {
  margin-bottom: var(--inline-space);
  display: block;
}
.p-textarea {
  width: 100%;
  resize: none;
}
.p-textarea:has(+ :not(.error-container)) {
  margin-bottom: var(--block-space);
}
.error-container {
  margin-bottom: var(--block-space);
}
.error {
  margin-top: var(--inline-space);
  color: var(--p-red-300);
}

:deep(.p-accordionheader span) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--inline-space);
}
p {
  line-height: 1.5;
  max-width: 70ch;
  margin: 0;
}
a {
  color: var(--p-primary-color);
  transition: var(--p-transition-duration);
}
a:hover {
  color: var(--p-primary-hover-color);
}
svg {
  width: 1em;
  height: 1em;
  vertical-align: middle;
}
</style>
