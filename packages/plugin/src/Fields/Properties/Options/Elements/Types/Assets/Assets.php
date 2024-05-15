<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Assets;

use craft\elements\Asset;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Fields\Implementations\Options\AssetSourceOptions;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\BaseOptionProvider;

class Assets extends BaseOptionProvider
{
    #[Input\Select(
        label: 'Asset Source',
        emptyOption: 'All Assets',
        options: AssetSourceOptions::class,
    )]
    private ?int $assetSourceId = null;

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Label',
        source: 'api/elements/assets/fields',
        parameterFields: ['properties.assetSourceId' => 'assetSourceId'],
    )]
    private string $label = 'filename';

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Value',
        source: 'api/elements/assets/fields',
        parameterFields: ['properties.assetSourceId' => 'assetSourceId'],
    )]
    private string $value = 'id';

    #[Input\DynamicSelect(
        label: 'Order By',
        source: 'api/elements/assets/fields?order',
        parameterFields: ['properties.assetSourceId' => 'assetSourceId'],
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
        return 'Assets';
    }

    public function getAssetSourceId(): ?int
    {
        return $this->assetSourceId;
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

    protected function getElements(): array
    {
        return Asset::find()
            ->volumeId($this->getAssetSourceId() ?: null)
            ->orderBy($this->getOrderBy().' '.$this->getSort())
            ->all()
        ;
    }
}
