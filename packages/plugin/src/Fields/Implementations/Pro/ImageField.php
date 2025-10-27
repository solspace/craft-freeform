<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\ArrayOfNumbersTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Bundles\Fields\Implementations\CardsField\ImageTransformOptionsGenerator;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Traits\ImageAssetTrait;

#[Type(
    name: 'Image',
    typeShorthand: 'image',
    iconPath: __DIR__.'/../Icons/image.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/image.ejs',
)]
class ImageField extends AbstractField implements ExtraFieldInterface, InputOnlyInterface, NoStorageInterface, NoEmailPresenceInterface
{
    use ImageAssetTrait;

    protected bool $required = false;

    #[Limitation('props.image', 'transform')]
    #[DefaultValue('props.image.transform')]
    #[Input\Select(
        label: 'Image Transform',
        instructions: 'Choose an image transform to apply.',
        emptyOption: 'Select an image transform...',
        options: ImageTransformOptionsGenerator::class,
    )]
    protected string $transform = '';

    #[Limitation('props.image', 'srcset')]
    #[DefaultValue('props.image.srcset')]
    #[ValueTransformer(ArrayOfNumbersTransformer::class)]
    #[Input\TextArea(
        label: 'Srcset Sizes',
        instructions: 'Enter a comma separated list of image size numbers for `srcset` attribute generation.',
        placeholder: 'e.g. "480, 768, 1024"',
        rows: 1,
    )]
    protected array $srcset = [];

    #[Input\AssetPicker(
        label: 'Image',
        instructions: 'Select an image for this field.',
        criteria: ['kind' => 'image'],
        limit: 1,
    )]
    protected array $assetId = [];

    public function getType(): string
    {
        return self::TYPE_IMAGE;
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }

    protected function getInputHtml(): string
    {
        $assetId = reset($this->assetId);

        $asset = $this->getAsset($assetId);
        if (!$asset) {
            return '';
        }

        $url = $this->getSrc($asset);
        $title = $asset->title;
        $srcset = $this->getSrcset($asset);

        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->setIfEmpty('src', $url)
            ->setIfEmpty('srcset', $srcset)
            ->setIfEmpty('title', $title)
        ;

        return Html::tag(
            $attributes->getTag('img'),
            '',
            $attributes->toHtmlTagArray(['field' => $this])
        );
    }
}
