<?php

namespace Solspace\Freeform\Services\Headless\Profile;

class HeadlessProfileRegistry
{
    /** @var null|array<string, HeadlessProfile> */
    private ?array $profiles = null;

    public function get(string $name): ?HeadlessProfile
    {
        return $this->all()[$name] ?? null;
    }

    /**
     * @return array<string, HeadlessProfile>
     */
    public function all(): array
    {
        if (null !== $this->profiles) {
            return $this->profiles;
        }

        $config = \Craft::$app->config->getConfigFromFile('freeform');
        $rawProfiles = $config['headless']['profiles'] ?? [];

        $this->profiles = [];
        if (!\is_array($rawProfiles)) {
            return $this->profiles;
        }

        foreach ($rawProfiles as $name => $profileConfig) {
            if (!\is_string($name) || !\is_array($profileConfig)) {
                continue;
            }

            $this->profiles[$name] = HeadlessProfile::fromConfig($name, $profileConfig);
        }

        return $this->profiles;
    }
}
