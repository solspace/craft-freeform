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
use yii\base\Event;

class FieldProvider
{
    private const KEY_ALL = 'all';
    private const PREFIX_BY_UID = 'by-uid';
    private const PREFIX_BY_FORM = 'by-form';
    private const PREFIX_FORMS = 'forms';

    private Memo $cache;
    private bool $warming;

    public function __construct(private PropertyProvider $propertyProvider)
    {
        $this->cache = new Memo();
        $this->warming = false;
    }

    public function getFieldByUid(string $fieldUid): ?FieldInterface
    {
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
        if (!$this->warming) {
            $this->warmCache();
        }

        return $this->cache->get($form->getId(), self::PREFIX_BY_FORM, []);
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
            /** @var FormFieldRecord $records */
            $rows = FormFieldRecord::find()
                ->select(['field.*', 'row.uid as rowUid'])
                ->alias('field')
                ->innerJoin('freeform_forms_rows row', '[[row.id]] = [[field.rowId]]')
                ->orderBy(['[[field.order]]' => \SORT_ASC])
                ->asArray()
                ->all()
            ;

            $fields = [];
            foreach ($rows as $row) {
                $fields[] = $this->createField($row);
            }

            $fields = array_filter($fields);
            $this->cache->set(self::KEY_ALL, $fields);
        } finally {
            $this->warming = false;
        }
    }

    private function createField(array $row): ?FieldInterface
    {
        $form = $this->getForm($row['formId']);
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

        $this->cache->set($row['uid'], $field, self::PREFIX_BY_UID);
        $this->propertyProvider->setObjectProperties($field, $properties, null, $form);

        $this->cacheFieldInForm($field, $form);

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
        $cache = $this->cache->get($form->getId(), self::PREFIX_BY_FORM, []);
        $cache[$field->getUid()] = $field;
        $this->cache->set($form->getId(), $cache, self::PREFIX_BY_FORM);
    }
}
