<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;

class FormIntegrationsProvider
{
    public function __construct(
        private IntegrationsService $integrationsService
    ) {
    }

    public function getById(?int $id): ?IntegrationInterface
    {
        if (null === $id) {
            return null;
        }

        return $this->integrationsService->getIntegrationObjectById($id);
    }

    public function getByUid(?string $uid): ?IntegrationInterface
    {
        if (null === $uid) {
            return null;
        }

        try {
            return $this->integrationsService->getIntegrationObjectByUid($uid);
        } catch (IntegrationException) {
            return null;
        }
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
