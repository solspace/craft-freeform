<?php

namespace Solspace\Freeform\Bundles\Backup\Controllers;

use Solspace\Freeform\Bundles\Backup\Export\ExpressFormsExporter;
use Solspace\Freeform\Bundles\Backup\Import\FreeformImporter;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class ImportController extends BaseApiController
{
    public function actionExpressForms(): Response
    {
        $exporter = \Craft::$container->get(ExpressFormsExporter::class);
        $data = $exporter->collect();

        if ($this->request->isPost) {
            $this->getImporter()->import($data);

            return $this->asEmptyResponse(201);
        }

        return $this->asSerializedJson($data);
    }

    public function actionFreeform(): Response
    {
        if ($this->request->isPost) {
            return $this->asEmptyResponse(201);
        }

        return $this->renderTemplate(
            'freeform-backup/import-freeform',
            [],
        );
    }

    public function actionTemp(): Response
    {
        $response = \Craft::$app->response;

        $response->format = Response::FORMAT_RAW;
        $response->stream = true;

        if (ob_get_level()) {
            @ob_end_clean();
        }

        ini_set('output_buffering', 0);

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');

        $i = 0;
        do {
            echo "event: info\n";
            echo "data: #{$i} This is a message at time ".time()."\n\n";

            if (0 === $i % 2) {
                echo "event: progress\n";
                echo 'data: '.json_encode(['progress' => $i])."\n\n";
            }

            @ob_flush();
            @flush();

            sleep(1);
            ++$i;

            if (connection_aborted()) {
                break;
            }
        } while ($i < 10);

        echo "event: exit\n";
        echo "data: done\n\n";

        @ob_flush();
        @flush();

        return $response;
    }

    private function getImporter(): FreeformImporter
    {
        return \Craft::$container->get(FreeformImporter::class);
    }
}
