<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string;
    loaderClass?: string;
    variant?: "spinner" | "skeleton";
  }>(),
  {
    message: "Loading form…",
    loaderClass: "ff-loader",
    variant: "skeleton",
  },
);
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    :data-variant="variant"
    :class="['ff-loader-root', loaderClass]"
  >
    <div v-if="variant === 'skeleton'" class="ff-loader-skeleton" aria-hidden="true">
      <div class="ff-loader-line ff-loader-line--title" />
      <div v-for="index in 3" :key="index" class="ff-loader-field">
        <div
          class="ff-loader-line ff-loader-line--label"
          :style="{ animationDelay: `${index * 0.12}s` }"
        />
        <div
          class="ff-loader-line ff-loader-line--input"
          :style="{
            width: index === 2 ? '62%' : '100%',
            animationDelay: `${index * 0.12}s`,
          }"
        />
      </div>
      <div
        class="ff-loader-line ff-loader-line--button"
        :style="{ animationDelay: '0.36s' }"
      />
    </div>
    <div v-else class="ff-loader-spinner" aria-hidden="true" />
    <p class="ff-loader-message">{{ message }}</p>
  </div>
</template>

<style scoped>
.ff-loader-root {
  display: grid;
  gap: 1rem;
  padding: 1.25rem 0;
  color: inherit;
}

.ff-loader-skeleton {
  width: 100%;
}

.ff-loader-line {
  animation: ff-loader-pulse 1.4s ease-in-out infinite;
  background-color: currentColor;
  opacity: 0.12;
  border-radius: 8px;
}

.ff-loader-line--title {
  height: 0.75rem;
  width: 38%;
  margin-bottom: 1.25rem;
}

.ff-loader-line--label {
  height: 0.65rem;
  width: 28%;
  margin-bottom: 0.45rem;
}

.ff-loader-line--input {
  height: 2.5rem;
}

.ff-loader-line--button {
  height: 2.5rem;
  width: 7rem;
  margin-top: 0.5rem;
}

.ff-loader-field {
  margin-bottom: 1rem;
}

.ff-loader-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  opacity: 0.85;
  animation: ff-loader-spin 0.7s linear infinite;
}

.ff-loader-message {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.75;
}

@keyframes ff-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ff-loader-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
</style>
