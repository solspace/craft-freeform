<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\ArrayOfNumbersTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
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

    #[Input\Boolean(label: 'Customize Image Display', instructions: 'Resize or frame this image without changing the source asset. Leave off to keep the original display.')]
    protected bool $customizeDisplay = false;

    #[VisibilityFilter('properties.customizeDisplay')]
    #[Input\Integer(label: 'Display Width', instructions: 'Use 0 to fill the available width. Images shrink to fit smaller screens.', min: 0, max: 4000, unit: 'px')]
    protected int $displayWidth = 0;

    #[VisibilityFilter('properties.customizeDisplay')]
    #[Input\Select(label: 'Aspect Ratio', options: ['original' => 'Original', 'landscape' => 'Landscape (16:9)', 'photo' => 'Photo (4:3)', 'square' => 'Square (1:1)', 'portrait' => 'Portrait (3:4)'])]
    protected string $aspectRatio = 'original';

    #[VisibilityFilter('properties.customizeDisplay && properties.aspectRatio != "original"')]
    #[Input\Select(label: 'Image Fit', options: ['cover' => 'Crop to fill', 'contain' => 'Fit entire image'])]
    protected string $imageFit = 'cover';

    #[VisibilityFilter('properties.customizeDisplay && properties.aspectRatio != "original"')]
    #[Input\Select(label: 'Crop Position', options: ['top-left' => 'Top left', 'top' => 'Top', 'top-right' => 'Top right', 'left' => 'Left', 'center' => 'Center', 'right' => 'Right', 'bottom-left' => 'Bottom left', 'bottom' => 'Bottom', 'bottom-right' => 'Bottom right'])]
    protected string $cropPosition = 'center';

    /** @return array<string, string> */
    public function getDisplayStyles(): array
    {
        if (!$this->customizeDisplay) {
            return [];
        }
        $width = max(0, min(4000, $this->displayWidth));
        $styles = ['display' => 'block', 'width' => $width ? $width.'px' : '100%', 'max-width' => '100%', 'height' => 'auto'];
        $ratio = ['landscape' => '16 / 9', 'photo' => '4 / 3', 'square' => '1 / 1', 'portrait' => '3 / 4'][$this->aspectRatio] ?? null;
        if ($ratio) {
            $styles['aspect-ratio'] = $ratio;
            $styles['object-fit'] = 'contain' === $this->imageFit ? 'contain' : 'cover';
            $styles['object-position'] = ['center' => 'center', 'top' => 'top', 'bottom' => 'bottom', 'left' => 'left', 'right' => 'right', 'top-left' => 'left top', 'top-right' => 'right top', 'bottom-left' => 'left bottom', 'bottom-right' => 'right bottom'][$this->cropPosition] ?? 'center';
        }

        return $styles;
    }

    public function getType(): string
    {
        return self::TYPE_IMAGE;
    }

    /**
     * @return array<int, int>
     */
    public function getAssetId(): array
    {
        return $this->assetId;
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
        if ($styles = $this->getDisplayStyles()) {
            $attributes->setIfEmpty('style', implode('; ', array_map(static fn ($key, $value) => $key.': '.$value, array_keys($styles), $styles)));
        }

        return Html::tag(
            $attributes->getTag('img'),
            '',
            $attributes->toHtmlTagArray(['field' => $this])
        );
    }
}
