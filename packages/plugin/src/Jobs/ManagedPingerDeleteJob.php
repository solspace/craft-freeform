<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;
use Solspace\Freeform\Records\IntegrationRecord;

class ManagedPingerDeleteJob extends BaseJob
{
    public function execute($queue): void
    {
        $settings = Freeform::getInstance()->settings->getSettingsModel();

        // Locate Form Monitor integration
        $record = IntegrationRecord::find()->where(['class' => FormMonitor::class])->one();
        if (!$record) {
            return;
        }

        $integrationModel = Freeform::getInstance()->integrations->getById((int) $record->id);
        if (!$integrationModel) {
            return;
        }

        $formMonitor = $integrationModel->getIntegrationObject();
        if (!$formMonitor instanceof FormMonitor) {
            return;
        }

        $clientProvider = \Craft::$container->get(IntegrationClientProvider::class);
        $client = $clientProvider->getAuthorizedClient($formMonitor);

        $endpoint = rtrim($formMonitor->getApiRootUrl(), '/').'/pinger/delete';

        try {
            $client->delete($endpoint, [
                'timeout' => 5,
            ]);
        } catch (\Throwable $e) {
            \Craft::warning('ManagedPingerDeleteJob failed: '.$e->getMessage(), __METHOD__);
        }
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Cancel Pinging Service');
    }
}
