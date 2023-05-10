<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;

class FileUploadArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'fileData' => [
                'name' => 'fileData',
                'type' => Type::string(),
                'description' => 'The contents of the file in Base64 format. If provided, takes precedence over the URL.',
            ],
            'filename' => [
                'name' => 'filename',
                'type' => Type::string(),
                'description' => 'The file name to use (including the extension) data with the `fileData` field.',
            ],
            'url' => [
                'name' => 'url',
                'type' => Type::string(),
                'description' => 'The URL of the file.',
            ],
        ];
    }
}
