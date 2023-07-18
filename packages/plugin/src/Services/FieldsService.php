<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use Solspace\Freeform\Events\Fields\SaveEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Database\FieldHandlerInterface;
use Solspace\Freeform\Models\FieldModel;
use Solspace\Freeform\Records\FieldRecord;

class FieldsService extends BaseService implements FieldHandlerInterface
{
    public const EVENT_BEFORE_SAVE = 'beforeSave';
    public const EVENT_AFTER_SAVE = 'afterSave';
    public const EVENT_BEFORE_DELETE = 'beforeDelete';
    public const EVENT_AFTER_DELETE = 'afterDelete';

    /** @var FieldModel[] */
    private static ?array $fieldCache = null;

    private static bool $allFieldsLoaded = false;

    private static ?array $fieldHandleCache = null;

    private static array $optionsCache = [];

    /**
     * @return FieldModel[]
     */
    public function getAllFields(bool $indexById = true): array
    {
        if (null === self::$fieldCache || !self::$allFieldsLoaded) {
            if (null === self::$fieldCache) {
                self::$fieldCache = [];
            }
            $fieldDisplayOrder = Freeform::getInstance()->settings->getFieldDisplayOrder();

            $orderBy = [];
            if (Freeform::FIELD_DISPLAY_ORDER_TYPE === $fieldDisplayOrder) {
                $orderBy['fields.type'] = \SORT_ASC;
            }
            $orderBy['fields.label'] = \SORT_ASC;

            $results = $this->getQuery()
                ->orderBy($orderBy)
                ->all()
            ;

            foreach ($results as $data) {
                $field = $this->createField($data);
                self::$fieldCache[$field->id] = $field;
            }

            self::$allFieldsLoaded = true;
        }

        if (!$indexById) {
            return array_values(self::$fieldCache);
        }

        return self::$fieldCache;
    }

    public function getAllFieldHandles(bool $indexById = true): array
    {
        if (null === self::$fieldHandleCache) {
            $results = (new Query())
                ->select(['id', 'handle'])
                ->from(FieldRecord::TABLE)
                ->all()
            ;

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

    public function getAllFieldIds(): array
    {
        return (new Query())
            ->select(['id'])
            ->from(FieldRecord::TABLE)
            ->column()
        ;
    }

    /**
     * @param int $id
     *
     * @return null|FieldModel
     */
    public function getFieldById($id)
    {
        if (null === self::$fieldCache) {
            self::$fieldCache = [];
        }

        if (null === self::$fieldCache || !isset(self::$fieldCache[$id])) {
            $result = $this->getQuery()
                ->where(['fields.id' => $id])
                ->one()
            ;

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

        $record->type = $model->type;
        $record->handle = $model->handle;
        $record->label = $model->label;
        $record->required = $model->required;
        $record->instructions = $model->instructions;
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
                }

                self::$fieldCache[$model->id] = $model;

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
            ->from(FieldRecord::TABLE.' fields')
            ->orderBy(['fields.label' => \SORT_ASC])
        ;
    }

    private function createField(array $data): FieldModel
    {
        $field = new FieldModel($data);

        if (\is_string($field->metaProperties) && '' !== $field->metaProperties) {
            $field->metaProperties = json_decode($field->metaProperties, true);
        }

        return $field;
    }
}
