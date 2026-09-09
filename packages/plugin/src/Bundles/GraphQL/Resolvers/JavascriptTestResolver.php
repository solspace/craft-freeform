<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Single\JavascriptTest\JavascriptTest;

class JavascriptTestResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        if (!$source instanceof Form) {
            return null;
        }

        return static::resolveForForm($source);
    }

    public static function resolveForForm(Form $form): ?array
    {
        $integrationProvider = \Craft::$container->get(FormIntegrationsProvider::class);
        $javascriptTest = $integrationProvider->getSingleton($form, JavascriptTest::class);
        if (!$javascriptTest) {
            return null;
        }

        return [
            'errorMessage' => $javascriptTest->getErrorMessage(),
            'name' => $javascriptTest->getInputName(),
        ];
    }
}
