<?php

namespace Solspace\Freeform\Library\Helpers;

class HandleHelper
{
    public static function generateHandle(string $input): string
    {
        $output = $input;

        $output = \Transliterator::create('Any-Latin; Latin-ASCII')->transliterate($output);
        $output = preg_replace('/[^A-Za-z0-9\_]/i', '', $output);

        return trim($output, ' -');
    }
}
