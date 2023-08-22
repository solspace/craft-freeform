<?php

namespace Solspace\Freeform\Twig\Filters;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class ImplementsClassFilter extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('implementsClass', [$this, 'implementsClassFilter']),
        ];
    }

    public function implementsClassFilter($object, $class): bool
    {
        return is_a($object, $class);
    }
}
