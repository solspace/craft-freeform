<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\elements\Asset;
use craft\elements\Category;
use craft\elements\Entry;
use craft\elements\Tag;
use craft\elements\User;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Fields\DeleteEvent;
use Solspace\Freeform\Events\Fields\FetchFieldTypes;
use Solspace\Freeform\Events\Fields\SaveEvent;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\CheckboxField;
use Solspace\Freeform\Library\Composer\Components\Fields\CheckboxGroupField;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Fields\DynamicRecipientField;
use Solspace\Freeform\Library\Composer\Components\Fields\EmailField;
use Solspace\Freeform\Library\Composer\Components\Fields\FileUploadField;
use Solspace\Freeform\Library\Composer\Components\Fields\HiddenField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExternalOptionsInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\MultipleSelectField;
use Solspace\Freeform\Library\Composer\Components\Fields\RadioGroupField;
use Solspace\Freeform\Library\Composer\Components\Fields\SelectField;
use Solspace\Freeform\Library\Composer\Components\Fields\TextareaField;
use Solspace\Freeform\Library\Composer\Components\Fields\TextField;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Configuration\ExternalOptionsConfiguration;
use Solspace\Freeform\Library\Database\FieldHandlerInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Factories\PredefinedOptionsFactory;
use Solspace\Freeform\Models\FieldModel;
use Solspace\Freeform\Records\FieldRecord;
use Solspace\Freeform\Library\Composer\Components\Fields\NumberField;
use yii\db\Exception;

class FieldsService extends BaseService implements FieldHandlerInterface
{
    const EVENT_BEFORE_SAVE     = 'beforeSave';
    const EVENT_AFTER_SAVE      = 'afterSave';
    const EVENT_BEFORE_DELETE   = 'beforeDelete';
    const EVENT_AFTER_DELETE    = 'afterDelete';
    const EVENT_FETCH_TYPES     = 'fetchTypes';
    const EVENT_BEFORE_VALIDATE = 'beforeValidate';
    const EVENT_AFTER_VALIDATE  = 'afterValidate';

    /** @var FieldModel[] */
    private static $fieldCache;

    /** @var bool */
    private static $allFieldsLoaded;

    /** @var array */
    private static $fieldHandleCache;

    /**
     * @param bool $indexById
     *
     * @return FieldModel[]
     */
    public function getAllFields($indexById = true): array
    {
        if (null === self::$fieldCache || !self::$allFieldsLoaded) {
            if (null === self::$fieldCache) {
                self::$fieldCache = [];
            }
            $fieldDisplayOrder = Freeform::getInstance()->settings->getFieldDisplayOrder();

            $orderBy = [];
            if ($fieldDisplayOrder === Freeform::FIELD_DISPLAY_ORDER_TYPE) {
                $orderBy['fields.type'] = SORT_ASC;
            }
            $orderBy['fields.label'] = SORT_ASC;

            $results = $this->getQuery()
                ->orderBy($orderBy)
                ->all();

            foreach ($results as $data) {
                $field                        = $this->createField($data);
                self::$fieldCache[$field->id] = $field;
            }

            self::$allFieldsLoaded = true;
        }

        if (!$indexById) {
            return array_values(self::$fieldCache);
        }

        return self::$fieldCache;
    }

    /**
     * @param bool $indexById
     *
     * @return array
     */
    public function getAllFieldHandles($indexById = true): array
    {
        if (null === self::$fieldHandleCache) {
            $results = (new Query())
                ->select(['id', 'handle'])
                ->from(FieldRecord::TABLE)
                ->all();

            $list = [];
            foreach ($results as $result) {
                $list[$result['id']] = $result['handle'];
            }

            self::$fieldHandleCache = $list;
        }

        if (!$indexById) {
            return array_values(self::$fieldHandleCache);
        }

        return self::$fieldHandleCache;
    }

    /**
     * @return array
     */
    public function getAllFieldIds(): array
    {
        return (new Query())
            ->select(['id'])
            ->from(FieldRecord::TABLE)
            ->column();
    }

    /**
     * @return array
     */
    public function getFieldTypes(): array
    {
        $fieldTypes = [
            TextField::class,
            TextareaField::class,
            EmailField::class,
            HiddenField::class,
            SelectField::class,
            MultipleSelectField::class,
            CheckboxField::class,
            CheckboxGroupField::class,
            RadioGroupField::class,
            FileUploadField::class,
            NumberField::class,
            DynamicRecipientField::class,
        ];

        $fetchTypesEvent = new FetchFieldTypes($fieldTypes);
        $this->trigger(self::EVENT_FETCH_TYPES, $fetchTypesEvent);

        return $fetchTypesEvent->getTypes();
    }

    /**
     * @param int $id
     *
     * @return FieldModel|null
     */
    public function getFieldById($id)
    {
        if (null === self::$fieldCache) {
            self::$fieldCache = [];
        }

        if (null === self::$fieldCache || !isset(self::$fieldCache[$id])) {
            $result = $this->getQuery()
                ->where(['fields.id' => $id])
                ->one();

            if ($result) {
                $field = $this->createField($result);

                self::$fieldCache[$id] = $field;
            } else {
                self::$fieldCache[$id] = null;
            }
        }

        return self::$fieldCache[$id];
    }

    /**
     * @param FieldModel $model
     *
     * @return bool
     * @throws \Exception
     */
    public function save(FieldModel $model): bool
    {
        $isNew = !$model->id;

        if (!$isNew) {
            $record = FieldRecord::findOne(['id' => $model->id]);
        } else {
            $record = FieldRecord::create();
        }

        $record->type           = $model->type;
        $record->handle         = $model->handle;
        $record->label          = $model->label;
        $record->required       = $model->required;
        $record->instructions   = $model->instructions;
        $record->metaProperties = $model->metaProperties;

        $record->validate();
        $model->addErrors($record->getErrors());

        $beforeSaveEvent = new SaveEvent($model, $isNew);
        $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);

        if ($beforeSaveEvent->isValid && !$model->hasErrors()) {
            $transaction = \Craft::$app->getDb()->beginTransaction();

            try {
                $record->save(false);

                if ($isNew) {
                    $model->id = $record->id;
                    try {
                        $this->createFieldInSubmissionsTable($record);
                    } catch (Exception $exception) {
                        // If row size too large - we remove the field and throw an error
                        if ($exception->getCode() === 42000) {
                            $transaction->rollBack();
                            $record->delete();
                            $model->addError(
                                'title',
                                Freeform::t('Total field limit reached.')
                            );

                            return false;
                        }
                    }
                }

                self::$fieldCache[$model->id] = $model;

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
     * @param int $fieldId
     *
     * @return bool
     * @throws \Exception
     */
    public function deleteById($fieldId)
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FIELDS_MANAGE);

        $model = $this->getFieldById($fieldId);

        if (!$model) {
            return false;
        }

        $beforeDeleteEvent = new DeleteEvent($model);
        $this->trigger(self::EVENT_BEFORE_DELETE, $beforeDeleteEvent);

        if (!$beforeDeleteEvent->isValid) {
            return false;
        }

        $transaction = \Craft::$app->getDb()->beginTransaction();
        try {
            $affectedRows = \Craft::$app
                ->getDb()
                ->createCommand()
                ->delete(FieldRecord::TABLE, ['id' => $model->id])
                ->execute();

            $this->deleteFieldFromSubmissionsTable($model);
            $this->deleteFieldFromForms($model);

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
     * @param AbstractField $field
     * @param Form          $form
     */
    public function beforeValidate(AbstractField $field, Form $form)
    {
        $this->trigger(self::EVENT_BEFORE_VALIDATE, new ValidateEvent($field, $form));
    }

    /**
     * @param AbstractField $field
     * @param Form          $form
     */
    public function afterValidate(AbstractField $field, Form $form)
    {
        $this->trigger(self::EVENT_AFTER_VALIDATE, new ValidateEvent($field, $form));
    }

    /**
     * @inheritDoc
     */
    public function getOptionsFromSource(string $source, $target, array $configuration = [], $selectedValues = []): array
    {
        $config     = new ExternalOptionsConfiguration($configuration);
        $labelField = $config->getLabelField() ?? 'title';
        $valueField = $config->getValueField() ?? 'id';
        $siteId     = $config->getSiteId() ?? \Craft::$app->sites->currentSite->id;
        $options    = [];

        if (!\is_array($selectedValues)) {
            $selectedValues = [$selectedValues];
        }

        switch ($source) {
            case ExternalOptionsInterface::SOURCE_ENTRIES:
                $items = Entry::find()->sectionId($target)->siteId($siteId)->all();
                foreach ($items as $item) {
                    $label     = $item->$labelField ?? $item->title;
                    $value     = $item->$valueField ?? $item->id;
                    $options[] = new Option($label, $value, \in_array($value, $selectedValues, true));
                }

                break;

            case ExternalOptionsInterface::SOURCE_CATEGORIES:
                $items = Category::find()->groupId($target)->siteId($siteId)->all();
                foreach ($items as $item) {
                    $label     = $item->$labelField ?? $item->title;
                    $value     = $item->$valueField ?? $item->id;
                    $options[] = new Option($label, $value, \in_array($value, $selectedValues, true));
                }

                break;

            case ExternalOptionsInterface::SOURCE_TAGS:
                $items = Tag::find()->groupId($target)->siteId($siteId)->all();
                foreach ($items as $item) {
                    $label     = $item->$labelField ?? $item->title;
                    $value     = $item->$valueField ?? $item->id;
                    $options[] = new Option($label, $value, \in_array($value, $selectedValues, true));
                }

                break;

            case ExternalOptionsInterface::SOURCE_USERS:
                $items      = User::find()->groupId($target)->siteId($siteId)->all();
                $labelField = $config->getLabelField() ?? 'username';
                foreach ($items as $item) {
                    $label     = $item->$labelField ?? $item->username;
                    $value     = $item->$valueField ?? $item->id;
                    $options[] = new Option($label, $value, \in_array($value, $selectedValues, true));
                }

                break;

            case ExternalOptionsInterface::SOURCE_ASSETS:
                $items      = Asset::find()->volumeId($target)->siteId($siteId)->all();
                $labelField = $config->getLabelField() ?? 'fileName';
                foreach ($items as $item) {
                    $label     = $item->$labelField ?? $item->getFilename();
                    $value     = $item->$valueField ?? $item->id;
                    $options[] = new Option($label, $value, \in_array($value, $selectedValues, true));
                }

                break;

            case ExternalOptionsInterface::SOURCE_PREDEFINED:
                return PredefinedOptionsFactory::create($target, $config, $selectedValues);
        }

        if ($config->getEmptyOption()) {
            array_unshift(
                $options,
                new Option($config->getEmptyOption(), '', \in_array('', $selectedValues, true))
            );
        }

        return $options;
    }

    /**
     * @param FieldRecord $record
     */
    private function createFieldInSubmissionsTable(FieldRecord $record)
    {
        $tableName       = Submission::TABLE;
        $fieldColumnName = Submission::getFieldColumnName($record->id);

        \Craft::$app
            ->getDb()
            ->createCommand()
            ->addColumn($tableName, $fieldColumnName, $record->getColumnType())
            ->execute();
    }

    /**
     * @param FieldModel $model
     */
    private function deleteFieldFromSubmissionsTable(FieldModel $model)
    {
        $tableName       = Submission::TABLE;
        $fieldColumnName = Submission::getFieldColumnName($model->id);

        \Craft::$app
            ->getDb()
            ->createCommand()
            ->dropColumn($tableName, $fieldColumnName)
            ->execute();
    }

    /**
     * @param FieldModel $model
     *
     * @throws \Exception
     */
    private function deleteFieldFromForms(FieldModel $model)
    {
        $forms = $this->getFormsService()->getAllForms();

        foreach ($forms as $form) {
            try {
                $composer = $form->getComposer();
                $composer->removeFieldById($model->id);
                $form->layoutJson = $composer->getComposerStateJSON();
                $this->getFormsService()->save($form);
            } catch (FreeformException $e) {
            }
        }
    }

    /**
     * @return Query
     */
    private function getQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'fields.id',
                    'fields.type',
                    'fields.label',
                    'fields.handle',
                    'fields.required',
                    'fields.instructions',
                    'fields.metaProperties',
                ]
            )
            ->from(FieldRecord::TABLE . ' fields')
            ->orderBy(['fields.label' => SORT_ASC]);
    }

    /**
     * @param array $data
     *
     * @return FieldModel
     */
    private function createField(array $data): FieldModel
    {
        $field = new FieldModel($data);

        if (\is_string($field->metaProperties) && $field->metaProperties !== '') {
            $field->metaProperties = json_decode($field->metaProperties, true);
        }

        return $field;
    }
}
