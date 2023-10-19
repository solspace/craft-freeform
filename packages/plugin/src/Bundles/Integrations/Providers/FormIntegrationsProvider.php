<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;

class FormIntegrationsProvider
{
    public function __construct(
        private IntegrationsService $integrationsService
    ) {
    }

    /**
     * @return IntegrationInterface[]
     */
    public function getForForm(?Form $form = null, ?string $type = null): array
    {
        return $this->integrationsService->getForForm($form, $type);
    }

    /**
     * @template T
     *
     * @param class-string<T> $class
     *
     * @return IntegrationInterface|T
     */
    public function getSingleton(Form $form, string $class): ?IntegrationInterface
    {
        $integrations = $this->getForForm($form, Type::TYPE_SINGLE);
        foreach ($integrations as $integration) {
            if ($integration instanceof $class) {
                return $integration;
            }
        }

        return null;
    }
}
