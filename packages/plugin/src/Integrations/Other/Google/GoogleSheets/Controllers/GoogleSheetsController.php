<?php

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets\Controllers;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\BaseGoogleSheetsIntegration;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\GoogleSheetsIntegrationInterface;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\Utilities\SheetsHelper;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Services\FormsService;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class GoogleSheetsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private FormIntegrationsProvider $integrationProvider,
        private FormsService $formsService,
        private IntegrationClientProvider $clientProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionColumnFields(): Response
    {
        [$form, $integration, $client, $googleSheetsId] = $this->getResources();
        if (!$googleSheetsId) {
            return $this->asSerializedJson([]);
        }

        $sheetName = \Craft::$app->getRequest()->get('sheet');
        $columnCount = $integration->getSheetColumnsCount($googleSheetsId, $sheetName, $client);

        $payload = [];
        for ($i = 0; $i < $columnCount; ++$i) {
            $columnLetter = SheetsHelper::getColumnLetter($i);

            $payload[] = [
                'id' => $i,
                'label' => $columnLetter,
                'required' => false,
                'type' => FieldObject::TYPE_STRING,
            ];
        }

        return $this->asSerializedJson($payload);
    }

    public function actionSheets(): Response
    {
        $collection = new OptionCollection();

        [$form, $integration, $client, $googleSheetsId] = $this->getResources();
        if (!$googleSheetsId) {
            return $this->asSerializedJson($collection);
        }

        $sheetNames = $integration->getSheetNames($googleSheetsId, $client);
        foreach ($sheetNames as $name) {
            $collection->add($name, $name);
        }

        return $this->asSerializedJson($collection);
    }

    private function getResources(): array
    {
        $request = \Craft::$app->getRequest();
        $googleSheetsId = $request->get('googleSheetsId');

        $formId = $request->get('formId');
        $integrationId = $request->get('integrationId');

        $form = $this->formsService->getFormById($formId);

        /** @var BaseGoogleSheetsIntegration $integration */
        $integration = $this->integrationProvider->getFirstForForm(
            $form,
            GoogleSheetsIntegrationInterface::class,
            filter: fn (IntegrationInterface $integration) => $integration->getId() === (int) $integrationId,
        );

        if (!$integration) {
            throw new NotFoundHttpException('Integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($integration);

        return [$form, $integration, $client, $googleSheetsId];
    }
}
