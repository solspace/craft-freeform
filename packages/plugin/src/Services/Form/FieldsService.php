<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\Fields\FieldPropertiesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Records\FavoriteFieldRecord;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Services\BaseService;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;

class FieldsService extends BaseService
{
    private array $fieldCache = [];
    private array $fieldRowUidCache = [];

    /** @var array<string, FieldInterface[]> */
    private array $fieldsByFormCache = [];

    /** @var FieldInterface[] */
    private array $allFieldCache = [];

    public function __construct(
        $config,
        private PropertyProvider $propertyProvider,
        private FormsService $formsService,
    ) {
        parent::__construct($config);
    }

    public function getFieldByUid(string $fieldUid, ?Form $form = null): ?FieldInterface
    {
        $record = FormFieldRecord::findOne(['uid' => $fieldUid]);
        if ($record) {
            $form = $form ?? $this->formsService->getFormById($record->formId);

            return $this->createField($record, $form);
        }

        return null;
    }

    public function getFieldByFormAndUid(Form $form, string $fieldUid): ?FieldInterface
    {
        $fields = $this->getFields($form);

        foreach ($fields as $field) {
            if ($field->getUid() === $fieldUid) {
                return $field;
            }
        }

        return null;
    }

    /**
     * @return FieldInterface[]
     */
    public function getAllFields(): array
    {
        if (empty($this->allFieldCache)) {
            $forms = $this->formsService->getAllForms();

            /** @var FormFieldRecord[] $records */
            $records = FormFieldRecord::find()
                ->with('row')
                ->orderBy(['order' => \SORT_ASC])
                ->all()
            ;

            foreach ($records as $record) {
                $form = $forms[$record->formId] ?? null;
                if (!$form) {
                    continue;
                }

                $field = $this->createField($record, $form);

                if ($field) {
                    $this->allFieldCache[] = $field;

                    if (!\array_key_exists($record->formId, $this->fieldsByFormCache)) {
                        $this->fieldsByFormCache[$record->formId] = [];
                    }

                    $this->fieldsByFormCache[$record->formId][] = $field;
                }
            }
        }

        return $this->allFieldCache;
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
        $records = FormFieldRecord::find()
            ->where(['formId' => $form->getId()])
            ->with('row')
            ->orderBy(['order' => \SORT_ASC])
            ->all()
        ;

        $fields = [];

        foreach ($records as $record) {
            $fields[] = $this->createField($record, $form);
        }

        return $fields;
    }

    public function createField(FormFieldRecord $record, Form $form): ?FieldInterface
    {
        $fieldCacheKey = $record->id.$form->getUniqueId();
        if (isset($this->fieldCache[$fieldCacheKey])) {
            return $this->fieldCache[$fieldCacheKey];
        }

        $rowCacheKey = $record->rowId.$form->getUniqueId();
        if (empty($this->fieldRowUidCache[$rowCacheKey])) { // Don't cache null values
            $this->fieldRowUidCache[$rowCacheKey] = $record->getRow()->one()?->uid;
        }
        $fieldRowUid = $this->fieldRowUidCache[$rowCacheKey];

        $type = $record->type;

        $metadata = JsonHelper::decode($record->metadata, true);
        $properties = array_merge(
            [
                'id' => $record->id,
                'uid' => $record->uid,
                'rowId' => $record->rowId,
                'rowUid' => $fieldRowUid,
                'order' => $record->order,
            ],
            $metadata,
        );

        if (!class_exists($type)) {
            return null;
        }

        /** @var FieldInterface $field */
        $field = new $type($form);
        $this->propertyProvider->setObjectProperties($field, $properties, null, $form);

        $this->fieldCache[$fieldCacheKey] = $field;

        Event::trigger(
            FieldInterface::class,
            FieldInterface::EVENT_AFTER_SET_PROPERTIES,
            new FieldPropertiesEvent($field)
        );

        return $field;
    }

    public function getAllFieldCount(): int
    {
        return FormFieldRecord::find()->count();
    }

    public function getFavoriteFieldCount(): int
    {
        return FavoriteFieldRecord::find()->count();
    }
}
