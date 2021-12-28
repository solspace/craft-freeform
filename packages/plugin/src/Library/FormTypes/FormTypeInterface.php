<?php

namespace Solspace\Freeform\Library\FormTypes;

interface FormTypeInterface
{
    public static function getTypeName(): string;

    public static function getPropertyManifest(): array;

    public function getMetadata(): array;
}
