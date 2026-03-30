<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\FileUpload;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FileUploadException;
use Solspace\Freeform\Services\FilesService;
use yii\base\Event;

class FileUploadAssetBundle extends FeatureBundle
{
    /**
     * Cache for handles meant for preventing duplicate file uploads when calling ::validate() and ::uploadFile()
     * Stores the assetID once as value for handle key.
     */
    public static array $filesUploaded = [];

    /**
     * Contains any errors for a given upload field.
     */
    public static array $filesUploadedErrors = [];

    public function __construct(private FilesService $filesService)
    {
        Event::on(
            Form::class,
            Form::EVENT_AFTER_HANDLE_REQUEST,
            [$this, 'uploadFiles']
        );
    }

    public static function getPriority(): int
    {
        return 0;
    }

    public function uploadFiles(HandleRequestEvent $event): void
    {
        $form = $event->getForm();
        if (!$form->isValid() || $event->isLookupCall()) {
            return;
        }

        $bag = $form->getProperties();
        $storedValues = $bag->get(Form::PROPERTY_STORED_VALUES, []);

        $this->uploadStandaloneFileFields($form, $storedValues);
        $this->uploadTableFileColumns($form, $storedValues);

        $bag->set(Form::PROPERTY_STORED_VALUES, $storedValues);
    }

    private function uploadStandaloneFileFields(Form $form, array &$storedValues): void
    {
        $uploadFields = $form->getLayout()->getFields(FileUploadField::class);
        if (!$uploadFields->count()) {
            return;
        }

        foreach ($uploadFields as $field) {
            $handle = $field->getHandle();

            if (!isset(self::$filesUploaded[$handle])) {
                $response = $this->filesService->uploadFile($field, $form);

                self::$filesUploaded[$handle] = null;
                self::$filesUploadedErrors[$handle] = [];

                if ($response) {
                    if ($response->getAssetIds() || empty($response->getErrors())) {
                        $field->setValue($response->getAssetIds());
                        self::$filesUploaded[$handle] = $response->getAssetIds();

                        $storedValues[$handle] = $field->getValue();

                        continue;
                    }

                    $field->addErrors($response->getErrors());
                    self::$filesUploadedErrors[$handle] = $field->getErrors();

                    throw new FileUploadException(implode('. ', $response->getErrors()));
                }
            }

            if (!empty(self::$filesUploadedErrors[$handle])) {
                $field->addErrors(self::$filesUploadedErrors[$handle]);
            }
        }
    }

    private function uploadTableFileColumns(Form $form, array &$storedValues): void
    {
        $tableFields = $form->getLayout()->getFields(TableField::class);
        if (!$tableFields->count()) {
            return;
        }

        foreach ($tableFields as $tableField) {
            if (!$tableField->hasFileUploadColumns()) {
                continue;
            }

            $handle = $tableField->getHandle();
            if (!isset($_FILES[$handle])) {
                continue;
            }

            $tableValue = $tableField->getValue();
            if (!\is_array($tableValue)) {
                $tableValue = [];
            }

            $columnFolders = [];
            foreach ($tableField->getTableLayout() as $columnIndex => $column) {
                if (TableField::COLUMN_TYPE_FILE !== ($column->type ?? null)) {
                    continue;
                }

                $metadata = \is_array($column->metadata ?? null) ? $column->metadata : [];
                $assetSourceId = (int) ($metadata['assetSourceId'] ?? 0);
                if ($assetSourceId < 1) {
                    continue;
                }

                $columnFolders[$columnIndex] = [
                    'sourceId' => $assetSourceId,
                    'uploadLocation' => $metadata['uploadLocation'] ?? null,
                ];
            }

            if (empty($columnFolders)) {
                continue;
            }

            $rows = $_FILES[$handle]['name'] ?? [];
            if (!\is_array($rows)) {
                continue;
            }

            $hasUploadedAssets = false;
            foreach ($rows as $rowIndex => $rowData) {
                if (!\is_array($rowData)) {
                    continue;
                }

                foreach ($columnFolders as $columnIndex => $folderConfig) {
                    $uploadedFiles = $this->filesService->getTableCellUploadedFiles($handle, (int) $rowIndex, (int) $columnIndex);
                    if (empty($uploadedFiles)) {
                        continue;
                    }

                    $cellAssetIds = [];
                    $cellErrors = [];
                    foreach ($uploadedFiles as $uploadedFile) {
                        $response = $this->filesService->uploadTableCellFile(
                            $uploadedFile,
                            $form,
                            $folderConfig['sourceId'],
                            $folderConfig['uploadLocation'],
                        );

                        if ($response->getAssetIds()) {
                            $cellAssetIds = array_merge($cellAssetIds, $response->getAssetIds());
                        }

                        if ($response->getErrors()) {
                            $cellErrors = array_merge($cellErrors, $response->getErrors());
                        }
                    }

                    if (!empty($cellAssetIds)) {
                        $tableValue[$rowIndex][$columnIndex] = $cellAssetIds;
                        $hasUploadedAssets = true;
                    } elseif (!empty($cellErrors)) {
                        $tableField->addErrors($cellErrors);

                        throw new FileUploadException(implode('. ', $cellErrors));
                    }
                }
            }

            if ($hasUploadedAssets) {
                $tableField->setValue($tableValue);
                $storedValues[$handle] = $tableField->getValue();
            }
        }
    }
}
