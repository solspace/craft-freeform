<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects;

use Solspace\Freeform\Bundles\GraphQL\Arguments\SubmissionReCaptchaArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\SubmissionReCaptchaInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AbstractGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\SubmissionReCaptchaType;

class SubmissionReCaptchaGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return SubmissionReCaptchaType::class;
    }

    public static function getArgumentsClass(): string
    {
        return SubmissionReCaptchaArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return SubmissionReCaptchaInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Submission ReCaptcha entity';
    }
}
