<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects;

use Solspace\Freeform\Bundles\GraphQL\Arguments\ReCaptchaArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\ReCaptchaInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AbstractGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\ReCaptchaType;

class ReCaptchaGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return ReCaptchaType::class;
    }

    public static function getArgumentsClass(): string
    {
        return ReCaptchaArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return ReCaptchaInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform ReCaptcha entity';
    }
}
