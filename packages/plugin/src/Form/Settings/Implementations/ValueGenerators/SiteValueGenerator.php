<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use craft\services\Sites;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class SiteValueGenerator implements ValueGeneratorInterface
{
    public function __construct(private Sites $sites) {}

    public function generateValue(?object $referenceObject, ?object $context): ?array
    {
        $isSessionAvailable = !\Craft::$app->getRequest()->getIsConsoleRequest() && \Craft::$app->getSession()->getIsActive();
        $sites = $isSessionAvailable
            ? $this->sites->getEditableSites()
            : $this->sites->getAllSites(false); // Passing false tells Craft to skip session checks

        return array_map(
            static fn ($site) => $site->id,
            $sites
        );
    }
}
