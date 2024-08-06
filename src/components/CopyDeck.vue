<template>
  <span>Deck:</span>
  <pre class="p-textarea">{{ deckText }}</pre>

  <Button label="Back" @click="goBack" severity="secondary" />
  <Button label="Start Over" @click="startOver" severity="secondary" />
  <Button label="Copy Deck" @click="copyDeck" />
</template>

<script lang="ts" setup>
import Button from 'primevue/button'
import store from '@/lib/store'
import { computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
const props = defineProps<{ navigateTo: (to: string) => void }>()

const toast = useToast()

const deckText = computed(() =>
  store.deck
    .map(
      (card) =>
        `${card.amount} ${card.name} (${card.set}) ${card.collectorNumber}${
          card.isFoil ? ' *F*' : ''
        }${card.isEtched ? ' *E*' : ''}${[
          ...card.globalTags.map((tag) => ' #!' + tag),
          ...card.deckSpecificTags.map((tag) => ' #' + tag)
        ].join('')}`
    )
    .join('\n')
)

const copyDeck = async () => {
  try {
    await navigator.clipboard.writeText(deckText.value)
    toast.add({ severity: 'success', summary: 'Deck Copied', life: 3000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Failed To Copy Deck', life: 3000 })
  }
}

const confirm = useConfirm()
const goBack = () => {
  props.navigateTo('2')
}
const startOver = () => {
  confirm.require({
    message: 'You will not be able to copy your changes.',
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
}
</script>

<style scoped>
span {
  margin-bottom: var(--inline-space);
  display: block;
}

.p-button + .p-button {
  margin-left: var(--inline-space);
}

pre {
  overflow: scroll;
  margin-bottom: var(--block-space);
  max-height: 300px;
}
</style>
