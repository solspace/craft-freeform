<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Tags;

use craft\elements\Tag;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Fields\Properties\Options\Elements\Properties\OptionsGenerators\SiteIdOptionsGenerator;
use Solspace\Freeform\Fields\Properties\Options\OptionTypeProviderInterface;
use Solspace\Freeform\Library\Helpers\ElementHelper;

class Tags implements OptionTypeProviderInterface
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
        options: TagGroupsOptionsGenerator::class,
    )]
    private ?string $groupId = null;

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Label',
        source: 'api/elements/tags/fields',
        parameterFields: [
            'properties.siteId' => 'siteId',
            'properties.groupId' => 'groupId',
        ],
    )]
    private string $label = 'title';

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Value',
        source: 'api/elements/tags/fields',
        parameterFields: [
            'properties.siteId' => 'siteId',
            'properties.groupId' => 'groupId',
        ],
    )]
    private string $value = 'id';

    #[Input\DynamicSelect(
        label: 'Order By',
        source: 'api/elements/tags/fields',
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
        return 'Tags';
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

        $tags = Tag::find()
            ->siteId($this->getSiteId() ?: null)
            ->groupId($this->getGroupId() ?: null)
            ->orderBy($this->getOrderBy().' '.$this->getSort())
            ->all()
        ;

        foreach ($tags as $tag) {
            $value = ElementHelper::extractFieldValue($tag, $this->getValue());
            $label = ElementHelper::extractFieldValue($tag, $this->getLabel());

            if (null !== $value) {
                if (null === $label) {
                    $label = $tag?->title ?: $tag->id;
                }

                $collection->add($value, $label);
            }
        }

        return $collection;
    }
}
