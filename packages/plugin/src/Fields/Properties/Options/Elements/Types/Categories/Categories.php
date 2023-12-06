<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Categories;

use craft\elements\Category;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Fields\Properties\Options\Elements\Properties\OptionsGenerators\SiteIdOptionsGenerator;
use Solspace\Freeform\Fields\Properties\Options\OptionTypeProviderInterface;
use Solspace\Freeform\Library\Helpers\ElementHelper;

class Categories implements OptionTypeProviderInterface
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

        $categories = Category::find()
            ->siteId($this->getSiteId() ?: null)
            ->groupId($this->getGroupId() ?: null)
            ->orderBy($this->getOrderBy().' '.$this->getSort())
            ->all()
        ;

        foreach ($categories as $entry) {
            $value = ElementHelper::extractFieldValue($entry, $this->getValue());
            $label = ElementHelper::extractFieldValue($entry, $this->getLabel());

            if (null !== $value) {
                if (null === $label) {
                    $label = $entry?->title ?: $entry->id;
                }

                $collection->add($value, $label);
            }
        }

        return $collection;
    }
}
