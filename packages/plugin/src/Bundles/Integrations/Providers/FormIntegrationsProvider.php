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
    ) {}

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
     * @template T of IntegrationInterface
     *
     * @param null|class-string<T> $type
     *
     * @return T[]
     */
    public function getForForm(
        ?Form $form = null,
        ?string $type = null,
        ?bool $enabled = null,
        ?callable $filter = null
    ): array {
        return $this->integrationsService->getForForm($form, $type, $enabled, $filter);
    }

    /**
     * @template T of IntegrationInterface
     *
     * @param null|class-string<T> $type
     *
     * @return null|T
     */
    public function getFirstForForm(
        ?Form $form = null,
        ?string $type = null,
        ?bool $enabled = null,
        ?callable $filter = null
    ): ?IntegrationInterface {
        return $this->integrationsService->getFirstForForm($form, $type, $enabled, $filter);
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
