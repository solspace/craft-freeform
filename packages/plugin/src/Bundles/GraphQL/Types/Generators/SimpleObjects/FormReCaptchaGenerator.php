<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects;

use Solspace\Freeform\Bundles\GraphQL\Arguments\SimpleObjects\EmptyArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\FormReCaptchaInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AbstractGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\FormReCaptchaType;

class FormReCaptchaGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return FormReCaptchaType::class;
    }

    public static function getArgumentsClass(): string
    {
        return EmptyArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return FormReCaptchaInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Form ReCaptcha entity';
    }
}
