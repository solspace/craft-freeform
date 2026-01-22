<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Traits;

use craft\elements\Asset;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\ArrayOfNumbersTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Bundles\Fields\Implementations\CardsField\ImageTransformOptionsGenerator;

trait ImageAssetTrait
{
    #[Input\Select(
        label: 'Image Transform',
        instructions: 'Choose an image transform to apply.',
        emptyOption: 'Select an image transform...',
        options: ImageTransformOptionsGenerator::class,
    )]
    protected string $transform = '';

    #[ValueTransformer(ArrayOfNumbersTransformer::class)]
    #[Input\TextArea(
        label: 'Srcset Sizes',
        instructions: 'Enter a comma separated list of image size numbers for `srcset` attribute generation.',
        placeholder: 'e.g. "480, 768, 1024"',
        rows: 1,
    )]
    protected array $srcset = [];

    public function getTransform(): ?string
    {
        return $this->transform ?: null;
    }

    public function getAsset(?int $id): ?Asset
    {
        if (!$id) {
            return null;
        }

        return \Craft::$app->assets->getAssetById($id);
    }

    public function getSrc(?Asset $asset): ?string
    {
        return $asset?->getUrl($this->transform);
    }

    public function getSrcsetSizes(): array
    {
        return $this->srcset;
    }

    public function getSrcset(?Asset $asset = null): ?string
    {
        $sizes = $this->getSrcsetSizes();
        if (empty($sizes)) {
            return null;
        }

        return $asset?->getSrcset($this->getSrcsetSizes(), $this->getTransform());
    }
}
