<?php

namespace Solspace\Freeform\Services\Pro;

use craft\db\Query;
use JetBrains\PhpStorm\NoReturn;
use Solspace\Freeform\Bundles\Export\Collections\FieldDescriptorCollection;
use Solspace\Freeform\Bundles\Export\Implementations\Csv\ExportCsv;
use Solspace\Freeform\Bundles\Export\Implementations\Excel\ExportExcel;
use Solspace\Freeform\Bundles\Export\Implementations\Json\ExportJson;
use Solspace\Freeform\Bundles\Export\Implementations\Text\ExportText;
use Solspace\Freeform\Bundles\Export\Implementations\Xml\ExportXml;
use Solspace\Freeform\Bundles\Export\SubmissionExportInterface;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Export\Profiles\DeleteEvent;
use Solspace\Freeform\Events\Export\Profiles\RegisterExporterEvent;
use Solspace\Freeform\Events\Export\Profiles\SaveEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\ExportSettings;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Models\Pro\ExportProfileModel;
use Solspace\Freeform\Records\Pro\ExportNotificationRecord;
use Solspace\Freeform\Records\Pro\ExportProfileRecord;
use yii\base\Component;
use yii\web\BadRequestHttpException;
use yii\web\HttpException;

class ExportProfilesService extends Component
{
    public const EVENT_BEFORE_SAVE = 'beforeSave';
    public const EVENT_AFTER_SAVE = 'afterSave';
    public const EVENT_BEFORE_DELETE = 'beforeDelete';
    public const EVENT_AFTER_DELETE = 'afterDelete';
    public const EVENT_REGISTER_EXPORTER = 'registerExporter';

    /** @var ExportProfileModel[] */
    private static $profileCache;
    private static $allProfilesLoaded;
    private static $exporters;

    public function getExporters(): array
    {
        if (null === self::$exporters) {
            $event = new RegisterExporterEvent();

            $event
                ->addExporter('excel', ExportExcel::class)
                ->addExporter('csv', ExportCsv::class)
                ->addExporter('json', ExportJson::class)
                ->addExporter('xml', ExportXml::class)
                ->addExporter('text', ExportText::class)
            ;

            $this->trigger(self::EVENT_REGISTER_EXPORTER, $event);

            self::$exporters = $event->getExporters();
        }

        return self::$exporters;
    }

    public function getExporterTypes(): array
    {
        $types = [];
        foreach ($this->getExporters() as $type => $exporterClass) {
            $types[$type] = $exporterClass::getLabel();
        }

        return $types;
    }

    public function getAllowedExporterTypes(ExportProfileModel $profile): array
    {
        $types = $this->getExporterTypes();
        if (null === $profile->allowedExportTypes) {
            return $types;
        }

        return array_intersect_key($types, array_flip(array_filter($profile->allowedExportTypes, 'is_string')));
    }

    public function isExportTypeAllowed(ExportProfileModel $profile, string $type): bool
    {
        return \array_key_exists($type, $this->getAllowedExporterTypes($profile));
    }

    public function validateAllowedExportTypes(ExportProfileModel $profile): bool
    {
        if (null === $profile->allowedExportTypes) {
            return true;
        }

        if (!$profile->allowedExportTypes) {
            $profile->addError('allowedExportTypes', Freeform::t('Select at least one export format.'));

            return false;
        }

        $types = $this->getExporterTypes();
        foreach ($profile->allowedExportTypes as $type) {
            if (!\is_string($type) || !\array_key_exists($type, $types)) {
                $profile->addError('allowedExportTypes', Freeform::t('Select valid export formats.'));

                return false;
            }
        }

        foreach ($profile->id ? $this->getActiveNotificationsForProfile($profile->id) : [] as $notification) {
            if (!\in_array($notification->fileType, $profile->allowedExportTypes, true)) {
                $profile->addError('allowedExportTypes', Freeform::t(
                    'The {format} format is used by the active export notification "{name}". Update or disable that notification before removing this format.',
                    ['format' => $types[$notification->fileType] ?? $notification->fileType, 'name' => $notification->name]
                ));
            }
        }

        return !$profile->hasErrors('allowedExportTypes');
    }

    public function createProfileExporter(string $type, ExportProfileModel $profile): SubmissionExportInterface
    {
        if (!$this->isExportTypeAllowed($profile, $type)) {
            throw new BadRequestHttpException(Freeform::t('The selected export format is not allowed for this profile.'));
        }

        return $this->createExporter($type, $profile->getForm(), $profile->getQuery(), $profile->getFieldDescriptors());
    }

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

    public function getAllNamesById(): array
    {
        return $this
            ->getQuery()
            ->select('name')
            ->indexBy('id')
            ->column()
        ;
    }

    public function getProfileById(int $id): ?ExportProfileModel
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

    public function save(ExportProfileModel $model): bool
    {
        if (!$this->validateAllowedExportTypes($model)) {
            return false;
        }

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
        $record->allowedExportTypes = $model->allowedExportTypes;

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

                $transaction?->commit();

                $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($model, $isNew));

                return true;
            } catch (\Exception $e) {
                $transaction?->rollBack();

                throw $e;
            }
        }

        return false;
    }

    public function deleteById($id): bool
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

            $transaction?->commit();

            $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($model));

            return (bool) $affectedRows;
        } catch (\Exception $exception) {
            $transaction?->rollBack();

            throw $exception;
        }
    }

    public function getExportSettings(): ExportSettings
    {
        $settings = Freeform::getInstance()->settings;
        $timezone = \Craft::$app->projectConfig->get('plugins.freeform.export.timezone') ?? new \DateTimeZone(\Craft::$app->getTimeZone());

        if ($timezone instanceof \DateTimeZone) {
            $timezone = $timezone->getName();
        }

        return new ExportSettings(
            $settings->isRemoveNewlines(),
            $settings->isExportLabels(),
            $timezone,
            $settings->isExportHandlesAsNames(),
            $settings->isExportTrackedUrlParameters(),
        );
    }

    public function getSubmissionForExport(SubmissionQuery $query): Submission
    {
        // Inspect every selected form before loading content, which can infer a single form from the IDs.
        $formIds = (clone $query)
            ->skipContent(true)
            ->column(Submission::TABLE_STD.'.formId')
        ;

        if (\count(array_unique($formIds)) > 1) {
            throw new BadRequestHttpException(Freeform::t('Submissions from multiple forms cannot be exported together. Please select submissions from a single form and try again.'));
        }

        if (!$formIds) {
            throw new FreeformException(Freeform::t('No submissions found'));
        }

        $submission = $query->skipContent(false)->one();
        if (!$submission instanceof Submission) {
            throw new FreeformException(Freeform::t('No submissions found'));
        }

        return $submission;
    }

    public function createExporter(
        string $type,
        Form $form,
        SubmissionQuery $query,
        FieldDescriptorCollection $fieldDescriptors
    ): SubmissionExportInterface {
        $exporters = $this->getExporters();
        if (!isset($exporters[$type])) {
            throw new FreeformException("Cannot export type `{$type}`");
        }

        $class = $exporters[$type];

        return new $class($form, $query, $fieldDescriptors, $this->getExportSettings());
    }

    #[NoReturn]
    public function export(SubmissionExportInterface $exporter, Form $form): void
    {
        $fileName = \sprintf(
            '%s submissions %s.%s',
            $form->getName(),
            date('Y-m-d H:i', time()),
            $exporter->getFileExtension()
        );

        $resource = \tmpfile();
        $exporter->export($resource);

        $this->outputFile($resource, $fileName, $exporter->getMimeType());
    }

    #[NoReturn]
    public function outputFile($file, string $fileName, string $contentType): void
    {
        rewind($file);

        \Craft::$app
            ->response
            ->setDownloadHeaders($fileName, $contentType)
            ->sendStreamAsFile($file, $fileName)
            ->send()
        ;

        exit;
    }

    /** @return ExportNotificationRecord[] */
    protected function getActiveNotificationsForProfile(int $profileId): array
    {
        return ExportNotificationRecord::find()->where(['profileId' => $profileId, 'enabled' => true])->all();
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
                    'export_profiles.allowedExportTypes',
                ]
            )
            ->from(ExportProfileRecord::TABLE.' export_profiles')
            ->orderBy(['export_profiles.id' => \SORT_ASC])
        ;
    }

    private function createExportProfile(array $data): ExportProfileModel
    {
        if (\is_string($data['allowedExportTypes'] ?? null)) {
            $data['allowedExportTypes'] = json_decode($data['allowedExportTypes'], true, flags: \JSON_THROW_ON_ERROR);
        }

        $exportProfile = new ExportProfileModel($data);

        $jsonColumns = ['fields', 'filters', 'statuses'];
        foreach ($jsonColumns as $column) {
            $value = $exportProfile->{$column};
            if (\is_string($value) && '' !== $value && '*' !== $value) {
                $exportProfile->{$column} = json_decode($value, true);
            }
        }

        return $exportProfile;
    }
}
