<?php

namespace Solspace\Freeform\Integrations\Elements\Entry;

use craft\base\Element;
use craft\elements\Entry as CraftEntry;
use craft\models\Section;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Entry',
    type: Type::TYPE_ELEMENTS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Entry extends ElementIntegration
{
    #[Required]
    #[VisibilityFilter('enabled')]
    #[Input\Select(
        label: 'Entry Type',
        emptyOption: 'Select an entry type',
        options: EntryTypeOptionsGenerator::class,
    )]
    protected string $sectionEntry = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('enabled')]
    #[VisibilityFilter('!!values.sectionEntry')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Entry attributes',
        source: 'api/elements/entries/attributes',
    )]
    protected ?FieldMapping $attributeMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('enabled')]
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
            // By default Craft Entry will always default to primary site if we dont pass siteId
            $entry = new CraftEntry([
                'sectionId' => $sectionId,
                'typeId' => $entryTypeId,
                'siteId' => $this->getSectionSiteId(\Craft::$app->getEntries()->getSectionById($sectionId)),
            ]);
        }

        $this->processMapping($entry, $form, $this->attributeMapping);
        $this->processMapping($entry, $form, $this->fieldMapping);

        if (!$entry->slug) {
            $entry->slug = $entry->title;
        }

        if (!$entry->siteId) {
            $entry->siteId = $this->getSectionSiteId($entry->getSection());
        }

        $supportedSiteIds = array_map(static fn ($site) => $site['siteId'], $entry->supportedSites);
        if (!\in_array($entry->siteId, $supportedSiteIds)) {
            $entry->siteId = reset($supportedSiteIds);
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

    private function getSectionSiteId(Section $section): int
    {
        $sectionSiteIds = $section->getSiteIds();

        $currentSiteId = \Craft::$app->getSites()->getCurrentSite()->getId();

        if (\in_array($currentSiteId, $sectionSiteIds)) {
            return $currentSiteId;
        }

        return reset($sectionSiteIds);
    }
}
