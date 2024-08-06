<template>
  <DeferredContent style="position: relative">
    <img
      v-show="isLoaded"
      :src="cardImage"
      :alt="card.name"
      @load="() => (isLoaded = true)"
      class="card"
      :class="{ isSelected }"
    />
    <Button v-if="isFlipCard" @click="flipCard" rounded
      ><template #icon="iconClass"><RefreshCwIcon :class="iconClass.class" /></template
    ></Button>
    <div v-show="!isLoaded" class="card">
      <div class="spinner"></div>
    </div>
  </DeferredContent>
</template>

<script lang="ts" setup>
import type { ScryfallCard } from '@/lib/types'
import DeferredContent from 'primevue/deferredcontent'
import Button from 'primevue/button'
import { RefreshCwIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { ref } from 'vue'

const props = defineProps<{ card: ScryfallCard; isSelected: boolean }>()
const isLoaded = ref(false)
const cardImage = ref(props.card.card_faces?.[0]?.image_uris?.png || props.card.image_uris?.png)

const isFlipCard = computed(
  () =>
    props.card.card_faces?.length === 2 &&
    ['flip', 'transform', 'modal_dfc', 'battle', 'double_faced_token', 'reversible_card'].includes(
      props.card.layout
    )
)

const flipCard = () => {
  isLoaded.value = false
  cardImage.value =
    cardImage.value === (props.card.card_faces?.[0]?.image_uris?.png || props.card.image_uris?.png)
      ? props.card.card_faces?.[1]?.image_uris?.png!
      : props.card.card_faces?.[0]?.image_uris?.png || props.card.image_uris?.png
}
</script>

<style scoped>
.card {
  display: block;
  width: 100%;
  border-radius: 5%;
  aspect-ratio: 745 / 1040;
  margin-bottom: var(--inline-space);
  background-color: var(--p-content-background);
  color: var(--p-surface-400);
  text-align: center;
  cursor: pointer;
}
.card::before {
  padding: var(--block-space);
  display: block;
}
.card.isSelected {
  outline: solid 2px var(--p-button-primary-background);
  outline-offset: 2px;
}

.p-button {
  position: absolute;
  top: 26%;
  left: 75%;
  background-color: color-mix(in srgb, var(--p-button-primary-background), transparent 40%);
  border: none !important;
}

.card:has(.spinner) {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--p-toolbar-border-color);
}
.spinner {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  border: 0.5rem solid var(--p-button-primary-background);
  animation:
    spinner-bulqg1 0.8s infinite linear alternate,
    spinner-oaa3wk 1.6s infinite linear;
}

.vertical {
  flex-direction: column;
}
.vertical :deep(:is(.p-button, a, .p-toolbar-start, .p-toolbar-end)) {
  width: 100%;
}
.vertical :deep(.p-toolbar-start) {
  order: 1;
}
.vertical :deep(.p-toolbar-end) {
  order: 2;
}

@keyframes spinner-bulqg1 {
  0% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%);
  }

  12.5% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 0%, 100% 0%, 100% 0%);
  }

  25% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 100%);
  }

  50% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%);
  }

  62.5% {
    clip-path: polygon(50% 50%, 100% 0, 100% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%);
  }

  75% {
    clip-path: polygon(50% 50%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 50% 100%, 0% 100%);
  }

  100% {
    clip-path: polygon(50% 50%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 0% 100%);
  }
}

@keyframes spinner-oaa3wk {
  0% {
    transform: scaleY(1) rotate(0deg);
  }

  49.99% {
    transform: scaleY(1) rotate(135deg);
  }

  50% {
    transform: scaleY(-1) rotate(0deg);
  }

  100% {
    transform: scaleY(-1) rotate(-135deg);
  }
}
</style>
