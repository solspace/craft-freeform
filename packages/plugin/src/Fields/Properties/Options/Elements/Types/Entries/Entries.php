<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries;

use craft\elements\Entry;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\Properties\Options\Elements\Properties\OptionsGenerators\SiteIdOptionsGenerator;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\ElementSourceTypeInterface;

class Entries implements ElementSourceTypeInterface
{
    #[Input\Select(
        label: 'Site ID',
        emptyOption: 'All Sites',
        options: SiteIdOptionsGenerator::class,
    )]
    private ?string $siteId = null;

    #[Input\Select(
        label: 'Section',
        emptyOption: 'All Sections',
        options: SectionsOptionsGenerator::class,
    )]
    private ?int $sectionId = null;

    #[VisibilityFilter('Boolean(properties.sectionId)')]
    #[Input\DynamicSelect(
        label: 'Entry Type',
        source: 'api/elements/entry-types',
        parameterFields: ['properties.sectionId' => 'sectionId'],
    )]
    private ?int $entryTypeId = null;

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Label',
        source: 'api/elements/fields',
        parameterFields: [
            'properties.siteId' => 'siteId',
            'properties.sectionId' => 'sectionId',
            'properties.entryTypeId' => 'entryTypeId',
        ],
    )]
    private string $label = 'title';

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Value',
        source: 'api/elements/fields',
        parameterFields: [
            'properties.siteId' => 'siteId',
            'properties.sectionId' => 'sectionId',
            'properties.entryTypeId' => 'entryTypeId',
        ],
    )]
    private string $value = 'id';

    #[Input\DynamicSelect(
        label: 'Order By',
        source: 'api/elements/fields',
        parameterFields: [
            'properties.siteId' => 'siteId',
            'properties.sectionId' => 'sectionId',
            'properties.entryTypeId' => 'entryTypeId',
        ],
    )]
    private string $orderBy = 'id';

    #[Input\Select(
        options: [
            ['value' => 'asc', 'label' => 'Ascending'],
            ['value' => 'desc', 'label' => 'Descending'],
        ],
    )]
    private string $sort = 'asc';

    public function getTypeClass(): string
    {
        return Entry::class;
    }

    public function getElementName(): string
    {
        return 'Entries';
    }

    public function getSiteId(): ?string
    {
        return $this->siteId;
    }

    public function getSectionId(): ?int
    {
        return $this->sectionId;
    }

    public function getEntryTypeId(): ?int
    {
        return $this->entryTypeId;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getOrderBy(): string
    {
        return $this->orderBy;
    }

    public function getSort(): string
    {
        return $this->sort;
    }

    public function generateOptions(): OptionCollection
    {
        $collection = new OptionCollection();

        $entries = Entry::find()
            ->siteId($this->getSiteId() ?: null)
            ->sectionId($this->getSectionId() ?: null)
            ->typeId($this->getEntryTypeId() ?: null)
            ->orderBy($this->getOrderBy().' '.$this->getSort())
            ->all()
        ;

        foreach ($entries as $entry) {
            $value = $this->getValue();
            $label = $this->getLabel();

            if (is_numeric($value)) {
                $value = (int) $value;

                continue;
            }

            $collection->add($entry->{$value}, $entry->{$label});
        }

        return $collection;
    }
}
