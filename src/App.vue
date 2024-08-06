<template>
  <Toast />
  <ConfirmDialog />
  <header>
    <h1><img src="/icon.svg" alt="Turbo Tagger Icon" />Turbo Tagger</h1>
    <p>
      A faster, computer based
      <a href="https://brettormsby.github.io/hyper-tagger/">Hyper Tagger</a>.
    </p>
  </header>
  <main>
    <Stepper value="1">
      <StepList>
        <Step value="1">Enter Deck</Step>
        <Step value="2">Tagger</Step>
        <Step value="3">Copy Deck</Step>
      </StepList>
      <StepPanels>
        <StepPanel v-slot="{ activateCallback }" value="1">
          <LoadDeck :navigateTo="activateCallback" />
        </StepPanel>
        <StepPanel v-slot="{ activateCallback }" value="2">
          <TagCards :navigateTo="activateCallback" />
        </StepPanel>
        <StepPanel v-slot="{ activateCallback }" value="3">
          <CopyDeck :navigateTo="activateCallback" />
        </StepPanel>
      </StepPanels>
    </Stepper>
  </main>
  <TheFooter />
</template>

<script lang="ts" setup>
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import Step from 'primevue/step'
import StepPanels from 'primevue/steppanels'
import StepPanel from 'primevue/steppanel'
import LoadDeck from '@/components/LoadDeck.vue'
import TagCards from '@/components/TagCards.vue'
import CopyDeck from '@/components/CopyDeck.vue'
import TheFooter from '@/components/TheFooter.vue'
</script>

<style scoped>
header {
  padding: var(--block-space);
  padding-bottom: 0;
}
h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--inline-space);
  margin-bottom: var(--inline-space);
}
p {
  text-align: center;
  color: var(--p-text-muted-color);
  margin: 0;
}
a {
  color: var(--p-primary-color);
  text-decoration: none;
  transition: var(--p-transition-duration);
}
a:hover {
  text-decoration: underline;
  color: var(--p-primary-hover-color);
}
main {
  padding: var(--block-space);
}
</style>
