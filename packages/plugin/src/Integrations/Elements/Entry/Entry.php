<?php

namespace Solspace\Freeform\Integrations\Elements\Entry;

use craft\base\Element;
use craft\elements\Entry as CraftEntry;
use craft\models\FieldLayout;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegration;
use yii\base\UnknownPropertyException;

#[Type(
    name: 'Entry',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Entry extends ElementIntegration
{
    #[Input\Select(
        label: 'Entry Type',
        options: EntryTypeOptionsGenerator::class,
    )]
    protected string $entryTypeId = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[Input\Special\Properties\FieldMapping(
        source: 'api/elements/entries/attributes',
    )]
    protected ?FieldMapping $attributeMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[Input\Special\Properties\FieldMapping(
        source: 'api/elements/entries/fields',
        parameterFields: ['values.entryTypeId' => 'entryTypeId'],
    )]
    protected ?FieldMapping $fieldMapping = null;

    public function isConnectable(): bool
    {
        return null !== $this->getEntryTypeId();
    }

    public function validate(Form $form, Submission $submission): bool
    {
        // TODO: Implement validate() method.
    }

    public function connect(Form $form, Submission $submission): bool
    {
        // TODO: Implement connect() method.
    }

    public function buildElement(): Element
    {
        $entryType = \Craft::$app->sections->getEntryTypeById($this->getEntryTypeId());

        if ($element instanceof CraftEntry) {
            $entry = $element;
        } else {
            $entry = new CraftEntry([
                'sectionId' => $entryType->getSection()->id,
                'typeId' => $entryType->id,
            ]);
        }

        $fieldLayout = $entry->getFieldLayout();
        if (null === $fieldLayout) {
            $fieldLayout = new FieldLayout();
        }

        foreach ($transformers as $transformer) {
            $field = $fieldLayout->getFieldByHandle($transformer->getCraftFieldHandle());

            $craftField = $transformer->getCraftFieldHandle();
            $value = $transformer->transformValueFor($field);

            try {
                $entry->{$craftField} = $value;
            } catch (\Exception $e) {
            }

            try {
                $entry->setFieldValue($craftField, $value);
            } catch (UnknownPropertyException $e) {
            }
        }

        if (!$entry->slug) {
            $entry->slug = $entry->title;
        }

        $currentSiteId = \Craft::$app->sites->currentSite->id;
        $siteIds = $entry->getSection()->getSiteIds();
        if (\in_array($currentSiteId, $siteIds, false)) {
            $siteId = $currentSiteId;
        } else {
            $siteId = reset($siteIds);
        }

        $entry->siteId = $siteId;
        $entry->enabled = !$this->isDisabled();

        return $entry;
    }

    public function getEntryTypeId(): int
    {
        return $this->entryTypeId;
    }

    public function getAttributeMapping(): FieldMapping
    {
        return $this->attributeMapping;
    }

    public function getFieldMapping(): FieldMapping
    {
        return $this->fieldMapping;
    }
}
