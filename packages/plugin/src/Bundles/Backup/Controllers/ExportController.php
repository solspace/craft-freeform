<?php

namespace Solspace\Freeform\Bundles\Backup\Controllers;

use Solspace\Freeform\Bundles\Backup\Export\ExpressFormsExporter;
use Solspace\Freeform\Bundles\Backup\Export\FreeformFormsExporter;
use Solspace\Freeform\controllers\BaseApiController;
use Symfony\Component\Serializer\Context\Normalizer\ObjectNormalizerContextBuilder;
use yii\web\Response;

class ExportController extends BaseApiController
{
    private array $unlinkFiles = [];

    public function actionFreeform(): Response
    {
        $exporter = \Craft::$container->get(FreeformFormsExporter::class);

        return $this->asSerializedJson($exporter->collectDataPreview());
    }

    public function actionExport(): Response
    {
        $exporter = \Craft::$container->get(FreeformFormsExporter::class);
        $serializer = $this->getSerializer();
        $post = \Craft::$app->request->post();

        $collection = $exporter->collect(
            formIds: $post['forms'] ?? [],
            notificationIds: $post['notificationTemplates'] ?? [],
            formSubmissions: $post['formSubmissions'] ?? [],
            strategy: $post['strategy'] ?? [],
        );

        $chunks = array_filter([
            'forms.jsonl' => $collection->getForms(),
            'notifications.jsonl' => $collection->getNotificationTemplates(),
            'settings.json' => $collection->getSettings(),
        ]);

        $zipPath = tempnam(sys_get_temp_dir(), 'freeform-export-');

        $zip = new \ZipArchive();
        if (true !== $zip->open($zipPath, \ZipArchive::CREATE)) {
            throw new \Exception('Could not create zip file');
        }

        foreach ($chunks as $name => $chunk) {
            $format = pathinfo($name, \PATHINFO_EXTENSION);
            $data = $serializer->serialize($chunk, $format);
            if (empty($data)) {
                continue;
            }

            $zip->addFromString($name, $data);
        }

        $context = (new ObjectNormalizerContextBuilder())
            ->withGroups(['export'])
            ->toArray()
        ;

        foreach ($collection->getFormSubmissions() as $formSubmissions) {
            $uid = $formSubmissions->formUid;

            $tmp = tempnam(sys_get_temp_dir(), 'submissions-'.$uid);
            $this->unlinkFiles[] = $tmp;
            $file = fopen($tmp, 'w');

            foreach ($formSubmissions->submissionBatchProcessor->batch(100) as $submissions) {
                foreach ($submissions as $submission) {
                    $processed = \call_user_func($formSubmissions->getProcessor(), $submission);
                    $data = $serializer->encode($processed->toArray(), 'json', $context);
                    fwrite($file, $data.\PHP_EOL);
                }
            }

            fclose($file);

            $zip->addFile($tmp, 'submissions-'.$uid.'.jsonl');
        }

        $zip->close();

        $response = $this->asFile($zipPath, 'export.zip', [
            'mimeType' => 'application/zip',
            'inline' => false,
        ]);

        $response->on(Response::EVENT_AFTER_SEND, function ($event) {
            @unlink($event->data);
            foreach ($this->unlinkFiles as $file) {
                @unlink($file);
            }
        }, $zipPath);

        return $response;
    }

    protected function get(): array|object
    {
        $exporter = \Craft::$container->get(ExpressFormsExporter::class);

        return $exporter->collect();
    }
}
