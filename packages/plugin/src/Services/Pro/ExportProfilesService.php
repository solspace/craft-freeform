<?php

namespace Solspace\Freeform\Services\Pro;

use craft\db\Query;
use Solspace\Freeform\Events\ExportProfiles\DeleteEvent;
use Solspace\Freeform\Events\ExportProfiles\SaveEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Export\ExportInterface;
use Solspace\Freeform\Models\Pro\ExportProfileModel;
use Solspace\Freeform\Records\Pro\ExportProfileRecord;
use yii\base\Component;
use yii\web\HttpException;

class ExportProfilesService extends Component
{
    const EVENT_BEFORE_SAVE = 'beforeSave';
    const EVENT_AFTER_SAVE = 'afterSave';
    const EVENT_BEFORE_DELETE = 'beforeDelete';
    const EVENT_AFTER_DELETE = 'afterDelete';

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
     * @return null|ExportProfileModel
     */
    public function getProfileById(int $id)
    {
        if (null === self::$profileCache || !isset(self::$profileCache[$id])) {
            if (null === self::$profileCache) {
                self::$profileCache = [];
            }

            $data = $this->getQuery()
                ->where(['id' => $id])
                ->one()
            ;

            $model = null;
            if ($data) {
                $model = $this->createExportProfile($data);
            }

            self::$profileCache[$id] = $model;
        }

        return self::$profileCache[$id];
    }

    /**
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

        $record->name = $model->name;
        $record->formId = $model->formId;
        $record->limit = $model->limit;
        $record->dateRange = $model->dateRange;
        $record->rangeStart = $model->rangeStart;
        $record->rangeEnd = $model->rangeEnd;
        $record->fields = $model->fields;
        $record->filters = $model->filters;
        $record->statuses = $model->statuses;

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

                if (null !== $transaction) {
                    $transaction->commit();
                }

                $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($model, $isNew));

                return true;
            } catch (\Exception $e) {
                if (null !== $transaction) {
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
     * @throws \Exception
     *
     * @return bool
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
                ->execute()
            ;

            if (null !== $transaction) {
                $transaction->commit();
            }

            $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($model));

            return (bool) $affectedRows;
        } catch (\Exception $exception) {
            if (null !== $transaction) {
                $transaction->rollBack();
            }

            throw $exception;
        }
    }

    public function export(ExportInterface $exporter, Form $form)
    {
        $fileName = sprintf(
            '%s submissions %s.%s',
            $form->getName(),
            date('Y-m-d H:i', time()),
            $exporter->getFileExtension()
        );

        $this->outputFile($exporter->export(), $fileName, $exporter->getMimeType());
    }

    public function outputFile(string $content, string $fileName, string $contentType)
    {
        header('Content-Description: File Transfer');
        header('Content-Type: '.$contentType);
        header('Content-Disposition: attachment; filename="'.$fileName.'"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: '.\strlen($content));

        echo $content;

        exit();
    }

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
                    'export_profiles.rangeStart',
                    'export_profiles.rangeEnd',
                    'export_profiles.fields',
                    'export_profiles.filters',
                    'export_profiles.statuses',
                ]
            )
            ->from(ExportProfileRecord::TABLE.' export_profiles')
            ->orderBy(['export_profiles.id' => \SORT_ASC])
        ;
    }

    private function createExportProfile(array $data): ExportProfileModel
    {
        $exportProfile = new ExportProfileModel($data);

        if (\is_string($exportProfile->fields) && '' !== $exportProfile->fields) {
            $exportProfile->fields = \GuzzleHttp\json_decode($exportProfile->fields, true);
        }

        if (\is_string($exportProfile->filters) && '' !== $exportProfile->filters) {
            $exportProfile->filters = \GuzzleHttp\json_decode($exportProfile->filters, true);
        }

        if (\is_string($exportProfile->statuses) && '' !== $exportProfile->statuses && '*' !== $exportProfile->statuses) {
            $exportProfile->statuses = \GuzzleHttp\json_decode($exportProfile->statuses, true);
        }

        return $exportProfile;
    }
}
