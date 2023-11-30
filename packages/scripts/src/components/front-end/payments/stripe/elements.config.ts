import type { Config } from './elements.types';

const formId = '{{ formId }}';

const config: Config = JSON.parse(document.getElementById(`ff-conf-${formId}`).innerText);

export default config;
