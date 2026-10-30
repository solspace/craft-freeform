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

namespace Solspace\Freeform\Fields\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\DefaultValueGeneratorInterface;
use Solspace\Freeform\Library\FileUploads\UploadVolumePolicy;

class AssetSourceGenerator implements DefaultValueGeneratorInterface
{
    public function __construct(private UploadVolumePolicy $policy) {}

    public function generateDefaultValue(mixed $value): mixed
    {
        return $this->policy->defaultSource($value);
    }

    public function generateValue(?object $referenceObject, ?object $context): ?int
    {
        $volumes = $this->policy->getViewableVolumes();

        if (\count($volumes)) {
            return $volumes[0]->id;
        }

        return null;
    }
}
