<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Common;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Services\ActivityService;

class PaymentStorageService
{
    public function __construct(
        private IntegrationLoggerProvider $loggerProvider,
    ) {}

    public function assertCanStore(Form $form, IntegrationInterface $integration, string $gateway): void
    {
        $reason = !$form->getSettings()->getGeneral()->storeData
            ? ActivityContext::PAYMENT_STORAGE_DISABLED
            : (!$form->hasOptInPermission() ? ActivityContext::PAYMENT_STORAGE_OPT_IN_REQUIRED : null);
        if (null === $reason) {
            return;
        }

        try {
            $this->getActivity()->record('integration-error', $form->getId(), null, [
                'integrationId' => $integration->getId(),
                'reasonCode' => $reason,
            ]);
        } catch (\Throwable) {
            // Diagnostics must never allow an incompatible payment request through.
        }

        try {
            $this->loggerProvider->getLogger($integration)->error(
                $gateway.' payment blocked: '.ActivityContext::REASONS[$reason][1],
                [
                    'activityRecorded' => true,
                    'formId' => $form->getId(),
                    'formHandle' => $form->getHandle(),
                    'integrationId' => $integration->getId(),
                ]
            );
        } catch (\Throwable) {
            // Preserve the validation response even when file logging is unavailable.
        }

        throw new \InvalidArgumentException($gateway.' payments require stored submissions.');
    }

    protected function getActivity(): ActivityService
    {
        // Use the plugin component whose deferred events are flushed at request end.
        return Freeform::getInstance()->get('activity');
    }
}
