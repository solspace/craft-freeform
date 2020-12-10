<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AbstractInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects\CsrfTokenGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\CsrfTokenType;

class CsrfTokenInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformCsrfTokenInterface';
    }

    public static function getTypeClass(): string
    {
        return CsrfTokenType::class;
    }

    public static function getGeneratorClass(): string
    {
        return CsrfTokenGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'A fresh honeypot instance';
    }

    public static function getFieldDefinitions(): array
    {
        return [
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => 'Name of the CSRF Token',
            ],
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => 'Value of the CSRF Token',
            ],
        ];
    }
}
