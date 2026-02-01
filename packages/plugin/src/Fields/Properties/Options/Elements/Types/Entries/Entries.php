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
    #[VisibilityFilter('context.config.sites.list.length > 1')]
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
        if (null !== $this->siteId) {
            return $this->siteId;
        }

        // Auto-set to single site if only one exists
        $sites = \Craft::$app->sites->getAllSites();
        if (1 === \count($sites)) {
            return (string) $sites[0]->id;
        }

        return null;
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
        $siteId = $translationTable->get('optionConfiguration.properties.siteId') ?: $this->getSiteId();
        $sectionId = $translationTable->get('optionConfiguration.properties.sectionId') ?: $this->getSectionId();
        $status = $translationTable->get('optionConfiguration.properties.status') ?: $this->getStatus();
        $entryTypeId = $translationTable->get('optionConfiguration.properties.entryTypeId') ?: $this->getEntryTypeId();

        $orderBy = $translationTable->get('optionConfiguration.properties.orderBy') ?: $this->getOrderBy();
        $sort = $translationTable->get('optionConfiguration.properties.sort') ?: $this->getSort();

        return Entry::find()
            ->siteId($siteId)
            ->sectionId($sectionId)
            ->status($status)
            ->typeId($entryTypeId)
            ->orderBy($orderBy.' '.$sort)
            ->all()
        ;
    }
}
