<?php

namespace Solspace\Freeform\Twig\Filters;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class FreeformTwigFilters extends AbstractExtension
{
    public function getFilters()
    {
        return [
            new TwigFilter('truncater', [$this, 'truncateFilter']),
        ];
    }

    public function truncateFilter($input, $length = 50, $ellipsis = '...')
    {
        if (\strlen($input) <= $length) {
            return $input;
        }

        return substr($input, 0, $length - \strlen($ellipsis)).'...';
    }
}
