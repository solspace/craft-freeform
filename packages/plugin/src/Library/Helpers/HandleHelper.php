<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\helpers\StringHelper;

class HandleHelper
{
    public static function generateHandle(string $input): string
    {
        $output = $input;

        $output = \Transliterator::create('Any-Latin; Latin-ASCII')->transliterate($output);
        $output = StringHelper::toCamelCase($output);
        $output = preg_replace('/[^a-z0-9\-_]/i', '', $output);

        return trim($output, ' -_');
    }
}
