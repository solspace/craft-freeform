<?php

namespace Solspace\Freeform\Jobs;

use craft\helpers\UrlHelper;
use craft\queue\BaseJob;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;
use Solspace\Freeform\Records\IntegrationRecord;

class ManagedPingerRegisterJob extends BaseJob
{
    public function execute($queue): void
    {
        $settings = Freeform::getInstance()->settings->getSettingsModel();

        if (!$settings->managedPingerEnabled) {
            return;
        }

        $siteUrl = \Craft::$app->getSites()->getCurrentSite()->getBaseUrl();
        $pingUrl = UrlHelper::siteUrl('freeform/queue/ping', $settings->queuePingToken ? ['token' => $settings->queuePingToken] : []);

        // Locate Form Monitor integration to reuse its authorized client (customer-scoped)
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

        $endpoint = rtrim($formMonitor->getApiRootUrl(), '/').'/pinger/register';

        try {
            $client->post($endpoint, [
                'json' => [
                    'siteUrl' => $siteUrl,
                    'pingUrl' => $pingUrl,
                    'minIntervalSeconds' => (int) $settings->queuePingMinIntervalSeconds,
                ],
                'timeout' => 5,
            ]);
        } catch (\Throwable $e) {
            \Craft::warning('ManagedPingerRegisterJob failed: '.$e->getMessage(), __METHOD__);
        }
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Enable Pinging Service');
    }
}
