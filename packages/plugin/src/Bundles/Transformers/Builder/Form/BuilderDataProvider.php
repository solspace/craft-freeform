<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationDTOProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Bundles\Rules\RuleProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificationNormalizer;
use Symfony\Component\Serializer\Serializer;

class BuilderDataProvider
{
    public function __construct(
        private FormTransformer $formTransformer,
        private RuleProvider $ruleProvider,
        private NotificationsProvider $notificationsProvider,
        private FormIntegrationsProvider $integrationsProvider,
        private IntegrationDTOProvider $integrationDTOProvider,
        private Serializer $serializer,
    ) {}

    public function getData(Form $form): array
    {
        // Keep the same serialization contexts as the individual editor APIs.
        // Loading these together reuses the form and request-local provider caches.
        return [
            'form' => $this->formTransformer->transform($form),
            'rules' => $this->serializer->normalize($this->ruleProvider->getFormRules($form), 'json', ['groups' => 'builder']),
            'notificationRules' => $this->serializer->normalize($this->ruleProvider->getFormNotificationRules($form), 'json', ['groups' => 'builder']),
            'notifications' => $this->serializer->normalize($this->notificationsProvider->getByForm($form), 'json', [
                IdentificationNormalizer::NORMALIZE_TO_IDENTIFICATORS => true,
            ]),
            'integrations' => $this->serializer->normalize(
                $this->integrationDTOProvider->convert($this->integrationsProvider->getForForm($form, enabled: null)),
                'json',
            ),
        ];
    }
}
