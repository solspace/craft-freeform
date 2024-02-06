import type { Config } from './elements.types';

const extractConfig = (form: HTMLFormElement): Config | undefined => {
  const configElement = form.querySelector<HTMLScriptElement>('[data-stripe-config]');
  if (!configElement) {
    return undefined;
  }

  return JSON.parse(configElement.innerText);
};

export default extractConfig;
