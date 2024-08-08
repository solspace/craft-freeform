<?php

namespace Solspace\Freeform\Bundles\Backup\Controllers;

use craft\helpers\App;
use craft\helpers\FileHelper;
use Solspace\Freeform\Bundles\Backup\Export\ExporterInterface;
use Solspace\Freeform\Bundles\Backup\Export\ExpressFormsExporter;
use Solspace\Freeform\Bundles\Backup\Export\FileExportReader;
use Solspace\Freeform\Bundles\Backup\Import\FreeformImporter;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Library\Helpers\CryptoHelper;
use Solspace\Freeform\Library\ServerSentEvents\SSE;
use yii\web\Response;

class ImportController extends BaseApiController
{
    public function actionExpressForms(): Response
    {
        $exporter = \Craft::$container->get(ExpressFormsExporter::class);
        $data = $exporter->collectDataPreview();

        return $this->asSerializedJson($data, context: ['preserve_empty_objects' => false]);
    }

    public function actionPrepareImport(): Response
    {
        $request = $this->request;

        $this->requirePostRequest();
        $this->requireAcceptsJson();

        $exporter = $request->post('exporter');
        $options = $request->post('options', []);

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
            ],
            30
        );

        return $this->asSerializedJson([
            'token' => $token,
        ], 201);
    }

    public function actionPrepareFile(): Response
    {
        $this->requirePostRequest();

        $file = $_FILES['file'] ?? null;
        if (!$file) {
            $errors = new ErrorCollection();
            $errors->add('import', 'file', ['File is required']);

            throw new ApiException(400, $errors);
        }

        $token = CryptoHelper::getUniqueToken(14);

        $zipPath = $file['tmp_name'];
        $unzipPath = \Craft::$app->path->getTempPath().'/freeform-import-'.$token;
        if (!is_dir($unzipPath)) {
            FileHelper::createDirectory($unzipPath, 0777, true);
        }

        $zip = new \ZipArchive();
        $zip->open($zipPath);

        try {
            $zip->extractTo($unzipPath);
        } catch (\ValueError) {
            $errors = new ErrorCollection();
            $errors->add('import', 'file', ['Failed to extract ZIP file']);

            throw new ApiException(400, $errors);
        }

        $zip->close();

        $exporter = \Craft::$container->get(FileExportReader::class);
        $exporter->setOptions(['fileToken' => $token]);

        return $this->asSerializedJson(
            [
                'token' => $token,
                'options' => $exporter->collectDataPreview(),
            ],
            201,
            ['preserve_empty_objects' => false]
        );
    }

    public function actionImport(): void
    {
        App::maxPowerCaptain();
        $token = $this->request->get('token');

        $sse = new SSE();
        $config = \Craft::$app->cache->get("freeform-import-{$token}");

        if (!$config) {
            $sse->message('err', 'Invalid or Expired token');
            $sse->message('exit', 'Invalid token');

            return;
        }

        ['exporter' => $exporterClass, 'options' => $options] = $config;

        /** @var ExporterInterface $exporter */
        $exporter = \Craft::$container->get($exporterClass);
        $exporter->setOptions($options);

        try {
            $dataset = $exporter->collect();
        } catch (\Throwable $e) {
            $sse->message('err', $e->getMessage());
            $sse->message('exit', 'done');

            return;
        }

        $sse->message('info', 'Starting import');

        try {
            $importer = \Craft::$container->get(FreeformImporter::class);
            $importer->import($dataset, $sse);
        } catch (\Throwable $e) {
            $sse->message('err', $e->getMessage());
            $sse->message('exit', 'done');
        }

        $exporter->destruct();

        $sse->message('info', 'Done');
        $sse->message('exit', 'done');

        exit;
    }

    private function getImporter(): FreeformImporter
    {
        return \Craft::$container->get(FreeformImporter::class);
    }
}
