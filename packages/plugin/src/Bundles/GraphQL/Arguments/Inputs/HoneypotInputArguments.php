<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use craft\gql\base\Arguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\HoneypotInputType;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Singleton\Honeypot\Honeypot;

class HoneypotInputArguments extends Arguments
{
    private static Form $form;

    public static function setForm(Form $form): void
    {
        self::$form = $form;
    }

    public static function getArguments(): array
    {
        $integrationProvider = \Craft::$container->get(FormIntegrationsProvider::class);
        $honeypot = $integrationProvider->getSingleton(self::$form, Honeypot::class);

        if (!$honeypot || !$honeypot->isEnabled()) {
            return [];
        }

        return [
            'honeypot' => [
                'name' => 'honeypot',
                'type' => HoneypotInputType::getType(),
                'description' => 'The honeypot name.',
            ],
        ];
    }
}
