<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries;

use craft\elements\Entry;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\Properties\Options\Elements\Properties\OptionsGenerators\SiteIdOptionsGenerator;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\BaseOptionProvider;
use Solspace\Freeform\Library\Translations\TranslationTable;

class Entries extends BaseOptionProvider
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
        source: 'api/elements/entries/entry-types',
        parameterFields: ['properties.sectionId' => 'sectionId'],
    )]
    private ?int $entryTypeId = null;

    #[Input\DynamicCheckboxes(
        label: 'Status',
        source: 'api/elements/statuses?type='.Entry::class,
    )]
    private array $status = [Entry::STATUS_LIVE];

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Label',
        source: 'api/elements/entries/fields',
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
        source: 'api/elements/entries/fields',
        parameterFields: [
            'properties.siteId' => 'siteId',
            'properties.sectionId' => 'sectionId',
            'properties.entryTypeId' => 'entryTypeId',
        ],
    )]
    private string $value = 'id';

    #[Input\DynamicSelect(
        label: 'Order By',
        source: 'api/elements/entries/fields?target=orderBy',
    )]
    private string $orderBy = 'id';

    #[Input\Select(
        options: [
            ['value' => 'asc', 'label' => 'Ascending'],
            ['value' => 'desc', 'label' => 'Descending'],
        ],
    )]
    private string $sort = 'asc';

    public function getName(): string
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

    public function getStatus(): array
    {
        return $this->status;
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

    protected function getElements(TranslationTable $translationTable): array
    {
        return Entry::find()
            ->siteId($translationTable->get('siteId') ?: $this->getSiteId())
            ->sectionId($translationTable->get('sectionId') ?: $this->getSectionId())
            ->status($translationTable->get('status') ?: $this->getStatus())
            ->typeId($translationTable->get('entryTypeId') ?: $this->getEntryTypeId())
            ->orderBy($this->getOrderBy().' '.$this->getSort())
            ->all()
        ;
    }
}
