<template>
  <div class="container">
    <Toolbar>
      <template #start>
        <Button aria-label="Settings" @click="settingsPopover?.toggle">
          <template #icon="iconClass">
            <SettingsIcon :class="iconClass" />
          </template>
        </Button>
        <Popover ref="settingsPopover" style="min-width: 200px">
          <span id="settingsLabel">Hide Tagged Cards</span>
          <Select
            v-model="settings.tagMode"
            :options="settingsSelectOptions"
            optionLabel="label"
            optionValue="value"
            aria-labelledby="settingsLabel"
            fluid
          />
        </Popover>
      </template>

      <template #center>
        <Message v-if="tags.length === 0" severity="warn" style="margin-bottom: 0"
          >Add a Tag to Begin</Message
        >
        <SelectButton
          v-else
          v-model="currentTag"
          :options="tags"
          aria-labelledby="tags"
          optionLabel="name"
        >
          <template #option="slotProps">
            {{ slotProps.option.name }}
            <Badge size="small" severity="primary">{{
              (slotProps.option.isGlobal
                ? tagsCount.global[slotProps.option.name]
                : tagsCount.deckSpecific[slotProps.option.name]) || 0
            }}</Badge>
          </template>
        </SelectButton>
      </template>
      <template #end>
        <Button aria-label="Add Tag" @click="tagPopover?.toggle">
          <template #icon="iconClass">
            <PlusIcon :class="iconClass" />
          </template>
        </Button>
        <Popover ref="tagPopover" style="min-width: 200px">
          <label for="addGlobalTag">Add Global Tag</label>
          <InputGroup>
            <InputText v-model="addGlobalTagText" inputId="addGlobalTag" />
            <Button aria-label="Add Tag" @click="addGlobalTag">
              <template #icon="iconClass">
                <PlusIcon :class="iconClass.class" />
              </template>
            </Button>
          </InputGroup>
          <label for="addDeckSpecificTag">Add Deck Specific Tag</label>
          <InputGroup>
            <InputText v-model="addDeckSpecificTagText" inputId="addDeckSpecificTag" />
            <Button aria-label="Add Tag" @click="addDeckSpecificTag">
              <template #icon="iconClass">
                <PlusIcon :class="iconClass.class" />
              </template>
            </Button>
          </InputGroup>
        </Popover>
      </template>
    </Toolbar>
    <Message v-if="store.deck.length === 0" severity="warn">Your Deck is Empty</Message>
    <Message v-else-if="filteredCards.length === 0" severity="warn">No Cards Left to Tag</Message>
    <div class="card-container" v-else>
      <template v-for="deckCard of store.deck">
        <MagicCard
          v-if="doesShowCard(deckCard)"
          :card="
            store.scryfallCards.find(
              (scryfallCard) => normalizeName(scryfallCard.name) === normalizeName(deckCard.name)
            )!
          "
          :isSelected="cardIsSelected(deckCard)"
          @click="toggleTag(deckCard)"
        />
        <!--/* click to add/remove. add to new changes, remove from current changes. selected if in current or new changes */-->
      </template>
    </div>
    <Button label="Back" @click="goBack" severity="secondary" />
    <Button label="Done" @click="goForward" />
  </div>
</template>

<script lang="ts" setup>
import Button from 'primevue/button'
import { ref, computed, watch } from 'vue'
import store, { settings } from '@/lib/store'
import type { DeckCard } from '@/lib/types'
import normalizeName from '@/lib/normalizeName'
import MagicCard from '@/components/MagicCard.vue'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import Toolbar from 'primevue/toolbar'
import Badge from 'primevue/badge'
import Popover from 'primevue/popover'
import Select from 'primevue/select'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import { SettingsIcon, PlusIcon } from 'lucide-vue-next'
import { useConfirm } from 'primevue/useconfirm'
const props = defineProps<{ navigateTo: (to: string) => void }>()

const settingsPopover = ref()
const settingsSelectOptions = [
  {
    value: 'none',
    label: 'None'
  },
  {
    value: 'global',
    label: 'Global'
  },
  {
    value: 'deckSpecific',
    label: 'Deck Specific'
  },
  {
    value: 'all',
    label: 'All'
  }
]

const tagPopover = ref()
const addGlobalTagText = ref('')
const addGlobalTag = () => {
  if (!store.globalTags.includes(addGlobalTagText.value.trim())) {
    store.globalTags.push(addGlobalTagText.value.trim())
  }
  addGlobalTagText.value = ''
}
const addDeckSpecificTagText = ref('')
const addDeckSpecificTag = () => {
  if (!store.deckSpecificTags.includes(addDeckSpecificTagText.value.trim())) {
    store.deckSpecificTags.push(addDeckSpecificTagText.value.trim())
  }
  addDeckSpecificTagText.value = ''
}

/*
 * New changes need to be stored so that the card will remain unhidden in certain modes, but the tags can still be changed
 */
const newChanges = ref<string[]>([])

const tags = computed<{ name: string; isGlobal: boolean }[]>(() => {
  if (settings.value.tagMode === 'none' || settings.value.tagMode === 'all') {
    return [
      ...store.globalTags.map((tag) => ({ name: tag, isGlobal: true })),
      ...store.deckSpecificTags.map((tag) => ({ name: tag, isGlobal: false }))
    ]
  } else if (settings.value.tagMode === 'deckSpecific') {
    return store.deckSpecificTags.map((tag) => ({ name: tag, isGlobal: false }))
  }
  return store.globalTags.map((tag) => ({ name: tag, isGlobal: true }))
})

// For badge numbers
const tagsCount = computed(() => {
  const tagsCount = {
    global: {} as Record<string, number>,
    deckSpecific: {} as Record<string, number>
  }
  for (const deckCard of store.deck) {
    if (currentTag.value && newChanges.value.includes(normalizeName(deckCard.name))) {
      if (currentTag.value.isGlobal) {
        if (Object.prototype.hasOwnProperty.call(tagsCount.global, currentTag.value.name)) {
          tagsCount.global[currentTag.value.name] += deckCard.amount
        } else {
          tagsCount.global[currentTag.value.name] = deckCard.amount
        }
      } else {
        if (Object.prototype.hasOwnProperty.call(tagsCount.deckSpecific, currentTag.value.name)) {
          tagsCount.deckSpecific[currentTag.value.name] += deckCard.amount
        } else {
          tagsCount.deckSpecific[currentTag.value.name] = deckCard.amount
        }
      }
    }

    for (const tag of deckCard.deckSpecificTags) {
      if (Object.prototype.hasOwnProperty.call(tagsCount.deckSpecific, tag)) {
        tagsCount.deckSpecific[tag] += deckCard.amount
      } else {
        tagsCount.deckSpecific[tag] = deckCard.amount
      }
    }
    for (const tag of deckCard.globalTags) {
      if (Object.prototype.hasOwnProperty.call(tagsCount.global, tag)) {
        tagsCount.global[tag] += deckCard.amount
      } else {
        tagsCount.global[tag] = deckCard.amount
      }
    }
  }
  return tagsCount
})
const currentTag = ref(tags.value[0])

// The first tag will start selected when navigating to this step
watch(
  () => store.globalTags,
  () => {
    if (!currentTag.value) {
      currentTag.value = tags.value[0]
    }
  },
  { deep: true }
)
watch(
  () => store.deckSpecificTags,
  () => {
    if (!currentTag.value) {
      currentTag.value = tags.value[0]
    }
  },
  { deep: true }
)

// When going to a new tag, the changes can be saved so that the cards are hidden in certain modes
watch(currentTag, (_newVal, oldVal) => {
  updateChanges(oldVal)
})

const updateChanges = (tag: { name: string; isGlobal: boolean }) => {
  if (!tag) return
  for (const cardName of newChanges.value) {
    const card = store.deck.find(
      (deckCard) => normalizeName(deckCard.name) === normalizeName(cardName)
    )
    if (tag.isGlobal) {
      card?.globalTags.push(tag.name)
    } else {
      card?.deckSpecificTags.push(tag.name)
    }
  }
  newChanges.value = []
}

const toggleTag = (card: DeckCard) => {
  if (!currentTag.value) return
  store.isTagsEdited = true
  if (newChanges.value.includes(normalizeName(card.name))) {
    // remove element from new changes
    newChanges.value.splice(newChanges.value.indexOf(normalizeName(card.name)), 1)
  } else if (currentTag.value.isGlobal && card.globalTags.includes(currentTag.value.name)) {
    // remove it from global
    card.globalTags.splice(card.globalTags.indexOf(currentTag.value.name), 1)
  } else if (!currentTag.value.isGlobal && card.deckSpecificTags.includes(currentTag.value.name)) {
    // remove from deckSpecific
    card.deckSpecificTags.splice(card.deckSpecificTags.indexOf(currentTag.value.name), 1)
  } else {
    // add it to the new changes
    newChanges.value.push(normalizeName(card.name))
  }
}

const doesShowCard = (card: DeckCard): boolean => {
  if (settings.value.tagMode === 'deckSpecific' && card.deckSpecificTags.length > 0) {
    return false
  }
  if (settings.value.tagMode === 'global' && card.globalTags.length > 0) {
    return false
  }
  if (
    settings.value.tagMode === 'all' &&
    (card.globalTags.length > 0 || card.deckSpecificTags.length > 0)
  ) {
    return false
  }
  return true
}

const cardIsSelected = (card: DeckCard): boolean => {
  if (!currentTag.value) return false
  if (currentTag.value.isGlobal && card.globalTags.includes(currentTag.value.name)) {
    return true
  }
  if (!currentTag.value.isGlobal && card.deckSpecificTags.includes(currentTag.value.name)) {
    return true
  }
  if (newChanges.value.includes(normalizeName(card.name))) {
    return true
  }
  return false
}

const filteredCards = computed(() => store.deck.filter((deckCard) => doesShowCard(deckCard)))

const confirm = useConfirm()
const goBack = () => {
  if (store.isTagsEdited) {
    confirm.require({
      message: 'Progress made will not be saved.',
      header: 'Are you sure you want to start over?',
      rejectProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: 'Start Over',
        severity: 'danger'
      },
      accept: () => {
        props.navigateTo('1')
      }
    })
  } else {
    document.querySelector('.p-toolbar-center')!.scroll({
      left: 0
    })
    props.navigateTo('1')
  }
}
const goForward = () => {
  updateChanges(currentTag.value)
  document.querySelector('.p-toolbar-center')!.scroll({
    left: 0
  })
  props.navigateTo('3')
}
</script>

<style scoped>
.container {
  padding: var(--block-space);
}

.p-toolbar {
  margin-bottom: var(--block-space);
  position: sticky;
  top: var(--block-space);
  flex-wrap: nowrap;
  z-index: 1000;
}
:deep(.p-togglebutton-content) {
  /* keep tag names on the same line */
  white-space: pre;
}
#settingsLabel,
label {
  display: block;
  margin-bottom: var(--inline-space);
}
.p-inputgroup + label {
  margin-top: var(--block-space);
}
:deep(.p-toolbar-center) {
  overflow: scroll;
  display: block;
  border-radius: var(--p-border-radius-sm);
}
.card-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--block-space);
}
.card-container,
.p-message {
  margin-bottom: var(--block-space);
}

.p-button + .p-button {
  margin-left: var(--inline-space);
}

@media (min-width: 370px) {
  .card-container {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 600px) {
  .card-container {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

@media (min-width: 800px) {
  .card-container {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
}
</style>
