<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\Fields\FieldPropertiesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Cache\Memo;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Records\FavoriteFieldRecord;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Services\BaseService;
use yii\base\Event;

class FieldsService extends BaseService
{
    private const KEY_ALL = 'all';
    private const PREFIX_BY_UID = 'by-uid';
    private const PREFIX_BY_FORM = 'by-form';
    private const PREFIX_FORMS = 'forms';

    private Memo $cache;

    public function __construct(
        $config,
        private PropertyProvider $propertyProvider,
    ) {
        parent::__construct($config);

        $this->cache = new Memo();
        $this->getAllFields();
    }

    public function getFieldByUid(string $fieldUid): ?FieldInterface
    {
        return $this->cache->get(
            $fieldUid,
            static fn () => null, // This should be pre-warmed beforehand
            self::PREFIX_BY_UID,
        );
    }

    public function getFieldCollection(Form $form): FieldCollection
    {
        return new FieldCollection($this->getFields($form));
    }

    /**
     * @return FieldInterface[]
     */
    public function getFields(Form $form): array
    {
        return $this->cache->get(
            $form->getId(),
            static fn () => null, // This should be pre-warmed beforehand
            self::PREFIX_BY_FORM
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

    /**
     * @return FieldInterface[]
     */
    private function getAllFields(): ?FieldInterface
    {
        return $this->cache->get(
            self::KEY_ALL,
            function () {
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
                    $field = $this->createField($row);
                    if (!$field) {
                        continue;
                    }

                    $fields[] = $field;
                }

                return $fields;
            }
        );
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

        $this->cacheFieldInForm($field, $form);

        $this->cache->set($row['uid'], $field, self::PREFIX_BY_UID);
        $this->propertyProvider->setObjectProperties($field, $properties, null, $form);

        Event::trigger(
            FieldInterface::class,
            FieldInterface::EVENT_AFTER_SET_PROPERTIES,
            new FieldPropertiesEvent($field)
        );

        return $field;
    }

    private function getForm(int $id): ?Form
    {
        return $this->cache->get(
            $id,
            function () use ($id) {
                $allForms = $this->cache->get(
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
        $cache = $this->cache->get($form->getId(), static fn () => [], self::PREFIX_BY_FORM);
        $cache[$field->getUid()] = $field;
        $this->cache->set($form->getId(), $cache, self::PREFIX_BY_FORM);
    }
}
