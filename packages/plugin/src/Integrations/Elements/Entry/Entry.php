<?php

namespace Solspace\Freeform\Integrations\Elements\Entry;

use craft\base\Element;
use craft\elements\Entry as CraftEntry;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegration;

#[Type(
    name: 'Entry',
    type: Type::TYPE_ELEMENTS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Entry extends ElementIntegration
{
    #[Required]
    #[Input\Select(
        label: 'Entry Type',
        emptyOption: 'Select an entry type',
        options: EntryTypeOptionsGenerator::class,
    )]
    protected string $sectionEntry = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('!!values.sectionEntry')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Entry attributes',
        source: 'api/elements/entries/attributes',
    )]
    protected ?FieldMapping $attributeMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('!!values.sectionEntry')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable custom Entry fields',
        source: 'api/elements/entries/custom-fields',
        parameterFields: ['values.sectionEntry' => 'sectionEntry'],
    )]
    protected ?FieldMapping $fieldMapping = null;

    public function isConnectable(): bool
    {
        return null !== $this->getSectionEntry();
    }

    public function getSectionEntry(): array
    {
        $parts = explode(':', $this->sectionEntry);

        $sectionId = $parts[0] ?? null;
        $entryTypeId = $parts[1] ?? null;

        return [$sectionId, $entryTypeId];
    }

    public function getAttributeMapping(): ?FieldMapping
    {
        return $this->attributeMapping;
    }

    public function getFieldMapping(): ?FieldMapping
    {
        return $this->fieldMapping;
    }

    public function buildElement(Form $form): Element
    {
        [$sectionId, $entryTypeId] = $this->getSectionEntry();

        $element = $this->getAssignedFormElement($form);
        if ($element instanceof CraftEntry) {
            $entry = $element;
        } else {
            $entry = new CraftEntry([
                'sectionId' => $sectionId,
                'typeId' => $entryTypeId,
            ]);
        }

        $this->processMapping($entry, $form, $this->attributeMapping);
        $this->processMapping($entry, $form, $this->fieldMapping);

        if (!$entry->slug) {
            $entry->slug = $entry->title;
        }

        if (!$entry->siteId) {
            $currentSiteId = \Craft::$app->sites->currentSite->id;
            $siteIds = $entry->getSection()->getSiteIds();
            if (\in_array($currentSiteId, $siteIds)) {
                $siteId = $currentSiteId;
            } else {
                $siteId = reset($siteIds);
            }

            $entry->siteId = $siteId;
        }

        return $entry;
    }

    public function onValidate(Form $form, Element $element): void
    {
        $type = $element->getType();

        if (!$type->hasTitleField && !$element->title) {
            // If no title is present - generate one to remove errors
            $element->title = sha1(uniqid('', true).time());
            $element->slug = $element->title;
        }
    }
}
