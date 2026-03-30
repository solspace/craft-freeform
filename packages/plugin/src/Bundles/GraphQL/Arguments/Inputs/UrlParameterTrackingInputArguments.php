<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\UrlParameterTrackingInputType;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\UrlParameterTracking;

class UrlParameterTrackingInputArguments extends Arguments
{
    private static Form $form;

    public static function setForm(Form $form): void
    {
        self::$form = $form;
    }

    public static function getArguments(): array
    {
        $integrationProvider = \Craft::$container->get(FormIntegrationsProvider::class);
        $urlParameterTracking = $integrationProvider->getSingleton(self::$form, UrlParameterTracking::class);

        if (!$urlParameterTracking) {
            return [];
        }

        return [
            'urlParameterTracking' => [
                'name' => 'urlParameterTracking',
                'type' => Type::listOf(UrlParameterTrackingInputType::getType()),
                'description' => 'A list of URL tracking parameter name and value pairs.',
            ],
        ];
    }
}
