export enum Edition {
  Pro = 'pro',
  Lite = 'lite',
  Express = 'express',
}

type Config = {
  templates: {
    native: boolean;
  };
  feed: boolean;
  limits: {
    forms?: number;
    fields?: number;
  };
  editions: {
    edition: Edition;
    tiers: Edition[];

    is: (edition: Edition) => boolean;
    isAtLeast: (edition: Edition) => boolean;
    isAtMost: (edition: Edition) => boolean;
  };
};

const element = document.getElementById('freeform-config') as HTMLScriptElement;
const baseConfig = JSON.parse(element.innerHTML) as Config;

const config: Config = {
  ...baseConfig,
  editions: {
    ...baseConfig.editions,

    is: (edition) => config.editions.edition === edition,
    isAtLeast: (edition) => {
      const editions = config.editions.tiers;
      const index = editions.indexOf(edition);

      if (index === -1) {
        throw new Error(`Unknown edition: ${edition}`);
      }

      return editions.indexOf(config.editions.edition) >= index;
    },
    isAtMost: (edition) => {
      const editions = config.editions.tiers;
      const index = editions.indexOf(edition);

      if (index === -1) {
        throw new Error(`Unknown edition: ${edition}`);
      }

      return editions.indexOf(config.editions.edition) <= index;
    },
  },
};

export default config;
