<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\Fields\FieldPropertiesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Cache\Memo;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Records\FavoriteFieldRecord;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use yii\base\Event;

class FieldProvider
{
    private const KEY_ALL = 'all';
    private const PREFIX_BY_UID = 'by-uid';
    private const PREFIX_BY_FORM = 'by-form';
    private const PREFIX_BY_FORM_UID = 'by-form-uid';
    private const PREFIX_FORMS = 'forms';

    private Memo $cache;
    private bool $warming;
    private array $warmingForms = [];

    public function __construct(private PropertyProvider $propertyProvider)
    {
        $this->cache = new Memo();
        $this->warming = false;
    }

    public function getFieldByUid(string $fieldUid, ?Form $form = null): ?FieldInterface
    {
        if ($form) {
            $formFieldKey = $this->getFormFieldKey($form, $fieldUid);

            $field = $this->cache->get($formFieldKey, self::PREFIX_BY_FORM_UID);
            if ($field instanceof FieldInterface) {
                return $field;
            }

            $row = $this->getRowByUid($fieldUid, $form->getId());

            if ($row) {
                $field = $this->createField($row, $form, false);

                if ($field instanceof FieldInterface) {
                    return $field;
                }
            }

            $this->getFields($form);

            return $this->cache->get($formFieldKey, self::PREFIX_BY_FORM_UID);
        }

        if (!$this->warming) {
            $this->warmCache();
        }

        return $this->cache->get($fieldUid, self::PREFIX_BY_UID);
    }

    /**
     * @return FieldInterface[]
     */
    public function getFields(Form $form): array
    {
        $key = $this->getFormKey($form);

        if ($this->warmingForms[$key] ?? false) {
            return $this->cache->get($key, self::PREFIX_BY_FORM, []);
        }

        return $this->cache->getOrSet(
            $key,
            function () use ($form, $key): array {
                $this->warmingForms[$key] = true;
                $this->cache->set($key, [], self::PREFIX_BY_FORM);

                $fields = [];

                try {
                    foreach ($this->getRows($form->getId()) as $row) {
                        $field = $this->createField($row, $form, false);
                        if ($field) {
                            $fields[] = $field;
                            $this->cache->set($key, $fields, self::PREFIX_BY_FORM);
                        }
                    }
                } finally {
                    unset($this->warmingForms[$key]);
                }

                return $fields;
            },
            self::PREFIX_BY_FORM,
        );
    }

    public function getAllFieldCount(): int
    {
        return FormFieldRecord::find()->count();
    }

    public function getFavoriteFieldCount(): int
    {
        return FavoriteFieldRecord::find()->count();
    }

    private function warmCache(): void
    {
        if ($this->cache->get(self::KEY_ALL)) {
            return;
        }

        if ($this->warming) {
            return;
        }

        $this->warming = true;

        try {
            $fields = [];
            foreach ($this->getRows() as $row) {
                $fields[] = $this->createField($row);
            }

            $fields = array_filter($fields);
            $this->cache->set(self::KEY_ALL, $fields);
        } finally {
            $this->warming = false;
        }
    }

    private function getRows(?int $formId = null): array
    {
        return $this->cache->getOrSet(
            null === $formId ? self::KEY_ALL : (string) $formId,
            static function () use ($formId): array {
                $rowsTable = FormRowRecord::TABLE;

                /** @var FormFieldRecord $records */
                $query = FormFieldRecord::find()
                    ->select(['field.*', 'row.uid as rowUid'])
                    ->alias('field')
                    ->innerJoin("{$rowsTable} row", '[[row.id]] = [[field.rowId]]')
                    ->orderBy(['[[field.order]]' => \SORT_ASC])
                ;

                if (null !== $formId) {
                    $query->andWhere(['field.formId' => $formId]);
                }

                return $query->asArray()->all();
            },
            'rows',
        );
    }

    private function getRowByUid(string $fieldUid, int $formId): ?array
    {
        $rowsTable = FormRowRecord::TABLE;

        return FormFieldRecord::find()
            ->select(['field.*', 'row.uid as rowUid'])
            ->alias('field')
            ->innerJoin("{$rowsTable} row", '[[row.id]] = [[field.rowId]]')
            ->where([
                'field.formId' => $formId,
                'field.uid' => $fieldUid,
            ])
            ->asArray()
            ->one()
        ;
    }

    private function createField(array $row, ?Form $form = null, bool $cacheGlobally = true): ?FieldInterface
    {
        $form ??= $this->getForm($row['formId']);
        if (!$form) {
            return null;
        }

        $rowUid = $row['rowUid'];
        $type = $row['type'];

        $metadata = JsonHelper::decode($row['metadata'], true);
        $properties = array_merge(
            [
                'id' => $row['id'],
                'uid' => $row['uid'],
                'rowId' => $row['rowId'],
                'rowUid' => $rowUid,
                'order' => $row['order'],
            ],
            $metadata,
        );

        try {
            if (!class_exists($type)) {
                return null;
            }
        } catch (\Exception) {
            return null;
        }

        /** @var FieldInterface $field */
        $field = new $type($form);

        if ($cacheGlobally) {
            $this->cache->set($row['uid'], $field, self::PREFIX_BY_UID);
        }

        $this->cache->set($this->getFormFieldKey($form, $row['uid']), $field, self::PREFIX_BY_FORM_UID);
        $this->propertyProvider->setObjectProperties($field, $properties, null, $form);

        if ($cacheGlobally) {
            $this->cacheFieldInForm($field, $form);
        }

        Event::trigger(
            FieldInterface::class,
            FieldInterface::EVENT_AFTER_SET_PROPERTIES,
            new FieldPropertiesEvent($field)
        );

        return $field;
    }

    private function getForm(int $id): ?Form
    {
        return $this->cache->getOrSet(
            $id,
            function () use ($id) {
                $allForms = $this->cache->getOrSet(
                    'all',
                    static fn () => Freeform::getInstance()->forms->getAllForms(),
                    self::PREFIX_FORMS,
                );

                return $allForms[$id] ?? null;
            },
            self::PREFIX_FORMS
        );
    }

    private function cacheFieldInForm(FieldInterface $field, Form $form): void
    {
        $cache = $this->cache->get($this->getFormKey($form), self::PREFIX_BY_FORM, []);
        $cache[] = $field;
        $this->cache->set($this->getFormKey($form), $cache, self::PREFIX_BY_FORM);
    }

    private function getFormKey(Form $form): string
    {
        return (string) spl_object_id($form);
    }

    private function getFormFieldKey(Form $form, string $fieldUid): string
    {
        return $this->getFormKey($form).'.'.$fieldUid;
    }
}
