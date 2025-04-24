<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\EventListeners;

use GuzzleHttp\Exception\GuzzleException;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use yii\base\Event;
use yii\base\Model;
use yii\base\ModelEvent;
use yii\web\BadRequestHttpException;

class ValidationListener extends FeatureBundle
{
    public function __construct(
        private IntegrationClientProvider $clientProvider,
    ) {
        Event::on(
            FormIntegrationRecord::class,
            Model::EVENT_BEFORE_VALIDATE,
            [$this, 'validate']
        );
    }

    /**
     * @throws GuzzleException
     * @throws IntegrationException
     */
    public function validate(ModelEvent $event): void
    {
        /** @var FormIntegrationRecord $record */
        $record = $event->sender;

        $integration = Freeform::getInstance()->integrations->getIntegrationObjectById($record->integrationId);
        if (!$integration instanceof FormMonitor) {
            return;
        }

        if (!$record->enabled) {
            return;
        }

        $count = $this->getEnabledFormCount($record->integrationId, $record->id);

        try {
            $client = $this->clientProvider->getAuthorizedClient($integration);
            $response = $client->get($integration->getApiRootUrl().'/me');
            $data = json_decode((string) $response->getBody(), true);

            if (isset($data['maxForms']) && $count >= $data['maxForms']) {
                $record->addError('enabled', 'You have reached the maximum number of ('.$data['maxForms'].') forms that can be monitored.');
                $record->enabled = false;
            }
        } catch (BadRequestHttpException $exception) {
            // If we can't check the limit, don't block the save
            return;
        }
    }

    private function getEnabledFormCount(int $integrationId, ?int $currentRecordId = null): int
    {
        $query = FormIntegrationRecord::find()
            ->where([
                'integrationId' => $integrationId,
                'enabled' => true,
            ])
        ;

        if ($currentRecordId) {
            $query->andWhere(['not', ['id' => $currentRecordId]]);
        }

        return $query->count();
    }
}
