<?php

namespace Solspace\Freeform\Bundles\Backup\Controllers;

use craft\helpers\App;
use Solspace\Commons\Helpers\CryptoHelper;
use Solspace\Freeform\Bundles\Backup\Export\ExporterInterface;
use Solspace\Freeform\Bundles\Backup\Export\ExpressFormsExporter;
use Solspace\Freeform\Bundles\Backup\Export\FormieExporter;
use Solspace\Freeform\Bundles\Backup\Import\FreeformImporter;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Library\ServerSentEvents\SSE;
use yii\web\Response;

class ImportController extends BaseApiController
{
    public function actionExpressForms(): Response
    {
        $exporter = \Craft::$container->get(ExpressFormsExporter::class);

        return $this->asSerializedJson(
            $exporter->collectDataPreview(),
            serializerOptions: ['preserve_empty_objects' => false]
        );
    }

    public function actionFormie(): Response
    {
        $exporter = \Craft::$container->get(FormieExporter::class);

        return $this->asSerializedJson(
            $exporter->collectDataPreview(),
            serializerOptions: ['preserve_empty_objects' => false]
        );
    }

    public function actionPrepareImport(): Response
    {
        $request = $this->request;

        $this->requirePostRequest();
        $this->requireAcceptsJson();

        $exporter = $request->post('exporter');
        $options = $request->post('options', []);
        $package = $request->post('package');

        $errors = new ErrorCollection();
        if (!$exporter) {
            $errors->add('exporter', 'class', ['Exporter is required']);

            throw new ApiException(400, $errors);
        }

        $token = CryptoHelper::getUniqueToken(14);

        \Craft::$app->cache->set(
            "freeform-import-{$token}",
            [
                'exporter' => $exporter,
                'options' => $options,
                'package' => $package,
            ],
            30
        );

        return $this->asSerializedJson([
            'token' => $token,
        ], 201);
    }

    public function actionImport(): void
    {
        App::maxPowerCaptain();
        $token = $this->request->get('token');

        $sse = new SSE();
        $config = \Craft::$app->cache->get("freeform-import-{$token}");

        if (!$config) {
            $sse->message('exit', 'Invalid token');

            return;
        }

        ['exporter' => $exporterClass, 'options' => $options, 'package' => $package] = $config;

        /** @var ExporterInterface $exporter */
        $exporter = \Craft::$container->get($exporterClass);
        $dataset = $exporter->collect(
            $options['forms'] ?? [],
            $options['notificationTemplates'] ?? [],
            $options['formSubmissions'] ?? [],
            $options['strategy'] ?? [],
        );

        $sse->message('info', 'Starting import');

        $importer = \Craft::$container->get(FreeformImporter::class);
        $importer->import($dataset, $sse);

        $sse->message('info', 'Done');

        $sse->message('exit', 'done');
    }

    private function getImporter(): FreeformImporter
    {
        return \Craft::$container->get(FreeformImporter::class);
    }
}
