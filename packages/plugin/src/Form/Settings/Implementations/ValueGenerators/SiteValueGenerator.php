<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use craft\services\Sites;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class SiteValueGenerator implements ValueGeneratorInterface
{
    public function __construct(private Sites $sites) {}

    public function generateValue(?object $referenceObject): ?array
    {
        $sites = $this->sites->getEditableSites();

        return array_map(
            fn ($site) => $site->id,
            $sites
        );
    }
}
