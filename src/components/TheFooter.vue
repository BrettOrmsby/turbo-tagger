<template>
  <footer>
    <p>
      Content © 2024 Brett Ormsby • View source on
      <a href="https://github.com/BrettOrmsby/turbo-tagger"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-github"
        >
          <path
            d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
          />
          <path d="M9 18c-4.51 2-5-2-7-2" /></svg
        >Github</a
      >
    </p>
  </footer>
</template>

<script lang="ts" setup></script>

<style scoped>
footer {
  padding: var(--block-space);
  background-color: var(--p-surface-900);

  border-top: 1px solid var(--p-content-border-color);
}
p {
  color: var(--p-text-muted-color);
  text-align: center;
  font-size: 0.875rem;
  display: block;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
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
svg {
  width: 1em;
  height: 1em;
  display: inline;
  vertical-align: middle;
}
</style>
