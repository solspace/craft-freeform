<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Integrations;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class IntegrationTransformer implements TransformerInterface
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {}

    public function transform($value): ?IntegrationInterface
    {
        return $this->integrationsProvider->getByUid($value);
    }

    public function reverseTransform($value): mixed
    {
        if ($value instanceof IntegrationInterface) {
            return $value->getUId();
        }

        return null;
    }
}
