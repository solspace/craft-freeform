<?php

namespace Solspace\Freeform\Attributes\Property;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::TARGET_CLASS | \Attribute::IS_REPEATABLE)]
class Edition implements CustomNormalizerInterface
{
    public const PRO = Freeform::EDITION_PRO;
    public const LITE = Freeform::EDITION_LITE;
    public const EXPRESS = Freeform::EDITION_EXPRESS;

    public function __construct(public string $name) {}

    public function normalize(): string
    {
        return $this->name;
    }
}
