<?php

namespace Solspace\Freeform\Twig\Filters;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class FreeformTwigFilters extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('truncater', [$this, 'truncateFilter']),
            new TwigFilter('freeformRegexReplace', [$this, 'regexReplace']),
        ];
    }

    public function truncateFilter($input, $length = 50, $ellipsis = '...'): string
    {
        if (\strlen($input) <= $length) {
            return $input ?? '';
        }

        return substr($input, 0, $length - \strlen($ellipsis)).'...';
    }

    public function regexReplace($input, $pattern, $replacement = ''): string
    {
        return preg_replace($pattern, $replacement, $input);
    }
}
