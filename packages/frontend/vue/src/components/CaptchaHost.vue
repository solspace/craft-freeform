<script setup lang="ts">
import type { ManifestCaptchaSecurity } from "@solspace/freeform-core";
import { onMounted, onUnmounted, ref, watch } from "vue";
import type { FreeformRuntime } from "../types.js";

const props = defineProps<{
  form: FreeformRuntime;
  captcha: ManifestCaptchaSecurity;
}>();

const hostRef = ref<HTMLElement | null>(null);
let cleanup: (() => void) | undefined;

function captchaIdentity(captcha: ManifestCaptchaSecurity): string {
  return [
    captcha.name,
    captcha.provider ?? "",
    captcha.siteKey ?? "",
    captcha.startMode ?? "",
    captcha.theme ?? "",
    captcha.locale ?? "",
    captcha.apiEndpoint ?? "",
    captcha.version ?? "",
    captcha.size ?? "",
  ].join("|");
}

function mount() {
  cleanup?.();
  cleanup = undefined;
  if (hostRef.value) {
    cleanup = props.form.mountCaptcha(props.captcha, hostRef.value);
  }
}

onMounted(mount);

watch(() => captchaIdentity(props.captcha), mount);

onUnmounted(() => {
  cleanup?.();
});

function setHostRef(element: unknown) {
  hostRef.value = (element as HTMLElement | null) ?? null;
}
</script>

<template>
  <div
    :ref="setHostRef"
    class="ff-captcha"
    :data-freeform-captcha="captcha.name"
    :data-freeform-captcha-provider="captcha.provider ?? captcha.name"
  />
</template>
