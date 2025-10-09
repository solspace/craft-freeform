<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Categories;

use craft\base\Element;
use craft\elements\Category;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Fields\Properties\Options\Elements\Properties\OptionsGenerators\SiteIdOptionsGenerator;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\BaseOptionProvider;
use Solspace\Freeform\Library\Translations\TranslationTable;

class Categories extends BaseOptionProvider
{
    #[Input\Select(
        label: 'Site ID',
        emptyOption: 'All Sites',
        options: SiteIdOptionsGenerator::class,
    )]
    private ?string $siteId = null;

    #[Input\Select(
        label: 'Group',
        emptyOption: 'All Groups',
        options: CategoryGroupsOptionsGenerator::class,
    )]
    private ?string $groupId = null;

    #[Input\DynamicCheckboxes(
        label: 'Status',
        source: 'api/elements/statuses?type='.Category::class,
    )]
    private array $status = [Element::STATUS_ENABLED];

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Label',
        source: 'api/elements/categories/fields',
        parameterFields: [
            'properties.siteId' => 'siteId',
            'properties.groupId' => 'groupId',
        ],
    )]
    private string $label = 'title';

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Value',
        source: 'api/elements/categories/fields',
        parameterFields: [
            'properties.siteId' => 'siteId',
            'properties.groupId' => 'groupId',
        ],
    )]
    private string $value = 'id';

    #[Input\DynamicSelect(
        label: 'Order By',
        source: 'api/elements/categories/fields',
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
        return 'Categories';
    }

    public function getSiteId(): ?string
    {
        return $this->siteId;
    }

    public function getGroupId(): ?string
    {
        return $this->groupId;
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
        $groupId = $translationTable->get('optionConfiguration.properties.groupId') ?: $this->getGroupId();
        $status = $translationTable->get('optionConfiguration.properties.status') ?: $this->getStatus();

        $orderBy = $translationTable->get('optionConfiguration.properties.orderBy') ?: $this->getOrderBy();
        $sort = $translationTable->get('optionConfiguration.properties.sort') ?: $this->getSort();

        return Category::find()
            ->siteId($siteId)
            ->groupId($groupId)
            ->status($status)
            ->orderBy($orderBy.' '.$sort)
            ->all()
        ;
    }
}
