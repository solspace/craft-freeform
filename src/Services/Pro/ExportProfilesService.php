<?php

namespace Solspace\Freeform\Services\Pro;

use Carbon\Carbon;
use craft\db\Query;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Fields\TextareaField;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataExport\ExportDataCSV;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Events\ExportProfiles\DeleteEvent;
use Solspace\Freeform\Events\ExportProfiles\SaveEvent;
use Solspace\Freeform\Models\Pro\ExportProfileModel;
use Solspace\Freeform\Records\Pro\ExportProfileRecord;
use yii\base\Component;
use yii\base\ErrorException;
use yii\web\HttpException;

class ExportProfilesService extends Component
{
    const EVENT_BEFORE_SAVE   = 'beforeSave';
    const EVENT_AFTER_SAVE    = 'afterSave';
    const EVENT_BEFORE_DELETE = 'beforeDelete';
    const EVENT_AFTER_DELETE  = 'afterDelete';

    /** @var ExportProfileModel[] */
    private static $profileCache;
    private static $allProfilesLoaded;

    /**
     * @return ExportProfileModel[]
     */
    public function getAllProfiles(): array
    {
        if (null === self::$profileCache || !self::$allProfilesLoaded) {
            self::$profileCache = [];

            $items = $this->getQuery()->all();
            foreach ($items as $data) {
                $model = $this->createExportProfile($data);

                self::$profileCache[$model->id] = $model;
            }

            self::$allProfilesLoaded = true;
        }

        return self::$profileCache;
    }

    /**
     * @param int $id
     *
     * @return ExportProfileModel|null
     */
    public function getProfileById(int $id)
    {
        if (null === self::$profileCache || !isset(self::$profileCache[$id])) {
            if (null === self::$profileCache) {
                self::$profileCache = [];
            }

            $data = $this->getQuery()
                ->where(['id' => $id])
                ->one();

            $model = null;
            if ($data) {
                $model = $this->createExportProfile($data);
            }

            self::$profileCache[$id] = $model;
        }

        return self::$profileCache[$id];
    }

    /**
     * @param ExportProfileModel $model
     *
     * @return bool
     * @throws \Exception
     * @throws HttpException
     */
    public function save(ExportProfileModel $model): bool
    {
        $isNew = !$model->id;

        if (!$isNew) {
            $record = ExportProfileRecord::findOne(['id' => $model->id]);

            if (!$record) {
                throw new HttpException(Freeform::t('Export Profile with ID {id} not found', ['id' => $model->id]));
            }
        } else {
            $record = new ExportProfileRecord();
        }

        $record->name      = $model->name;
        $record->formId    = $model->formId;
        $record->limit     = $model->limit;
        $record->dateRange = $model->dateRange;
        $record->fields    = $model->fields;
        $record->filters   = $model->filters;
        $record->statuses  = $model->statuses;

        $record->validate();
        $model->addErrors($record->getErrors());

        $beforeSaveEvent = new SaveEvent($model, $isNew);
        $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);

        if ($beforeSaveEvent->isValid && !$model->hasErrors()) {
            $transaction = \Craft::$app->db->beginTransaction();
            try {
                $record->save(false);

                if (!$model->id) {
                    $model->id = $record->id;
                }

                self::$profileCache[$model->id] = $model;

                if ($transaction !== null) {
                    $transaction->commit();
                }

                $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($model, $isNew));

                return true;
            } catch (\Exception $e) {
                if ($transaction !== null) {
                    $transaction->rollBack();
                }

                throw $e;
            }
        }

        return false;
    }

    /**
     * @param int $id
     *
     * @return bool
     * @throws \Exception
     */
    public function deleteById($id)
    {
        $model = $this->getProfileById($id);

        if (!$model) {
            return false;
        }

        $beforeDeleteEvent = new DeleteEvent($model);
        $this->trigger(self::EVENT_BEFORE_DELETE, $beforeDeleteEvent);

        if (!$beforeDeleteEvent->isValid) {
            return false;
        }

        $transaction = \Craft::$app->db->beginTransaction();
        try {
            $affectedRows = \Craft::$app
                ->getDb()
                ->createCommand()
                ->delete(ExportProfileRecord::TABLE, ['id' => $model->id])
                ->execute();

            if ($transaction !== null) {
                $transaction->commit();
            }

            $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($model));

            return (bool) $affectedRows;
        } catch (\Exception $exception) {
            if ($transaction !== null) {
                $transaction->rollBack();
            }

            throw $exception;
        }
    }

    /**
     * @param Form  $form
     * @param array $labels
     * @param array $data
     */
    public function exportCsv(Form $form, array $labels, array $data)
    {
        $data = $this->normalizeArrayData($form, $data);

        $csvData = $data;
        array_unshift($csvData, array_values($labels));

        $fileName = sprintf('%s submissions %s.csv', $form->getName(), date('Y-m-d H:i', time()));

        $export = new ExportDataCSV('browser', $fileName);
        $export->initialize();

        foreach ($csvData as $csv) {
            $export->addRow($csv);
        }

        $export->finalize();
        exit();
    }

    /**
     * @param Form  $form
     * @param array $data
     */
    public function exportJson(Form $form, array $data)
    {
        $data = $this->normalizeArrayData($form, $data, false);

        $export = [];
        foreach ($data as $itemList) {
            $sub = [];
            foreach ($itemList as $id => $value) {
                $label = $this->getHandleFromIdentificator($form, $id);

                $sub[$label] = $value;
            }

            $export[] = $sub;
        }

        $fileName = sprintf('%s submissions %s.json', $form->getName(), date('Y-m-d H:i', time()));

        $output = json_encode($export, JSON_PRETTY_PRINT);

        $this->outputFile($output, $fileName, 'application/octet-stream');
    }

    /**
     * @param Form  $form
     * @param array $data
     */
    public function exportText(Form $form, array $data)
    {
        $data = $this->normalizeArrayData($form, $data);

        $output = '';
        foreach ($data as $itemList) {
            foreach ($itemList as $id => $value) {
                $label = $this->getHandleFromIdentificator($form, $id);

                $output .= $label . ': ' . $value . "\n";
            }

            $output .= "\n";
        }

        $fileName = sprintf('%s submissions %s.txt', $form->getName(), date('Y-m-d H:i', time()));

        $this->outputFile($output, $fileName, 'text/plain');
    }

    /**
     * @param Form  $form
     * @param array $data
     */
    public function exportXml(Form $form, array $data)
    {
        $data = $this->normalizeArrayData($form, $data);

        $xml = new \SimpleXMLElement('<root/>');

        foreach ($data as $itemList) {
            $submission = $xml->addChild('submission');

            foreach ($itemList as $id => $value) {
                $label = $this->getHandleFromIdentificator($form, $id);

                $node = $submission->addChild($label, htmlspecialchars($value));
                $node->addAttribute('label', $this->getLabelFromIdentificator($form, $id));
            }
        }

        $fileName = sprintf('%s submissions %s.xml', $form->getName(), date('Y-m-d H:i', time()));

        $this->outputFile($xml->asXML(), $fileName, 'text/xml');
    }

    /**
     * @param Form  $form
     * @param array $labels
     * @param array $data
     *
     * @throws \PhpOffice\PhpSpreadsheet\Exception
     * @throws \PhpOffice\PhpSpreadsheet\Writer\Exception
     */
    public function exportExcel(Form $form, array $labels, array $data)
    {
        array_unshift($data, array_values($labels));

        $data = $this->normalizeArrayData($form, $data);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray($data);

        $fileName = sprintf(
            '%s submissions %s.xlsx',
            $form->getName(),
            date('Y-m-d H:i')
        );

        ob_start();

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');

        $content = ob_get_clean();
        try {
            ob_end_clean();
        } catch (ErrorException $e) {
        }

        $this->outputFile($content, $fileName, 'application/vnd.ms-excel');
    }

    /**
     * @param Form   $form
     * @param string $id
     *
     * @return string
     */
    private function getLabelFromIdentificator(Form $form, string $id): string
    {
        static $cache;

        if (null === $cache) {
            $cache = [];
        }

        if (!isset($cache[$id])) {
            $label = $id;
            if (preg_match('/^(?:field_)?(\d+)$/', $label, $matches)) {
                $fieldId = $matches[1];
                try {
                    $field = $form->getLayout()->getFieldById($fieldId);
                    $label = $field->getLabel();
                } catch (FreeformException $e) {
                }
            } else {
                switch ($id) {
                    case 'id':
                        $label = 'ID';
                        break;

                    case 'dateCreated':
                        $label = 'Date Created';
                        break;

                    case 'ip':
                        $label = 'IP';
                        break;

                    default:
                        $label = ucfirst($label);
                        break;
                }
            }

            $cache[$id] = $label;
        }

        return $cache[$id];
    }

    /**
     * @param Form   $form
     * @param string $id
     *
     * @return string
     */
    private function getHandleFromIdentificator(Form $form, string $id): string
    {
        static $cache;

        if (null === $cache) {
            $cache = [];
        }

        if (!isset($cache[$id])) {
            $label = $id;
            if (preg_match('/^field_(\d+)$/', $label, $matches)) {
                $fieldId = $matches[1];
                try {
                    $field = $form->getLayout()->getFieldById($fieldId);
                    $label = $field->getHandle();
                } catch (FreeformException $e) {
                }
            }

            $cache[$id] = $label;
        }

        return $cache[$id];
    }

    /**
     * @param Form  $form
     * @param array $data
     * @param bool  $flattenArrays
     *
     * @return array
     */
    private function normalizeArrayData(Form $form, array $data, bool $flattenArrays = true): array
    {
        $isRemoveNewlines = Freeform::getInstance()->settings->isRemoveNewlines();

        /**
         * @var int   $index
         * @var array $item
         */
        foreach ($data as $index => $item) {
            foreach ($item as $fieldId => $value) {
                if ($fieldId === 'dateCreated') {
                    $date = new Carbon($value, 'UTC');
                    $date->setTimezone(date_default_timezone_get());

                    $data[$index][$fieldId] = $date->toDateTimeString();
                }

                if (!preg_match('/^' . Submission::FIELD_COLUMN_PREFIX . '(\d+)$/', $fieldId, $matches)) {
                    continue;
                }

                try {
                    $field = $form->getLayout()->getFieldById($matches[1]);

                    if ($field instanceof FileUploadField) {
                        $value = (array) json_decode($value ?: '[]', true);
                        $combo = [];

                        foreach ($value as $assetId) {
                            $asset = \Craft::$app->assets->getAssetById((int) $assetId);
                            if ($asset) {
                                $assetValue = $asset->filename;
                                if ($asset->getUrl()) {
                                    $assetValue = $asset->getUrl();
                                }

                                $combo[] = $assetValue;
                            }
                        }

                        $data[$index][$fieldId] = implode(', ', $combo);

                        continue;
                    }

                    if ($field instanceof MultipleValueInterface) {
                        $value = (array) json_decode($value ?: '[]', true);
                        if ($flattenArrays && \is_array($value)) {
                            $value = implode(', ', $value ?: []);
                        }

                        $data[$index][$fieldId] = $value;
                    }

                    if ($isRemoveNewlines && $field instanceof TextareaField) {
                        $data[$index][$fieldId] = trim(preg_replace('/\s+/', ' ', $value));
                    }
                } catch (FreeformException $e) {
                    continue;
                }
            }
        }

        return $data;
    }

    /**
     * @param string $content
     * @param string $fileName
     * @param string $contentType
     */
    private function outputFile(string $content, string $fileName, string $contentType)
    {
        header('Content-Description: File Transfer');
        header('Content-Type: ' . $contentType);
        header('Content-Disposition: attachment; filename=' . $fileName);
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . strlen($content));

        echo $content;

        exit();
    }

    /**
     * @return Query
     */
    private function getQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'export_profiles.id',
                    'export_profiles.formId',
                    'export_profiles.name',
                    'export_profiles.limit',
                    'export_profiles.dateRange',
                    'export_profiles.fields',
                    'export_profiles.filters',
                    'export_profiles.statuses',
                ]
            )
            ->from(ExportProfileRecord::TABLE . ' export_profiles')
            ->orderBy(['export_profiles.id' => SORT_ASC]);
    }

    /**
     * @param array $data
     *
     * @return ExportProfileModel
     */
    private function createExportProfile(array $data): ExportProfileModel
    {
        $exportProfile = new ExportProfileModel($data);

        if (\is_string($exportProfile->fields) && $exportProfile->fields !== '') {
            $exportProfile->fields = \GuzzleHttp\json_decode($exportProfile->fields, true);
        }

        if (\is_string($exportProfile->filters) && $exportProfile->filters !== '') {
            $exportProfile->filters = \GuzzleHttp\json_decode($exportProfile->filters, true);
        }

        if (\is_string($exportProfile->statuses) && $exportProfile->statuses !== '' && $exportProfile->statuses !== '*') {
            $exportProfile->statuses = \GuzzleHttp\json_decode($exportProfile->statuses, true);
        }

        return $exportProfile;
    }
}
