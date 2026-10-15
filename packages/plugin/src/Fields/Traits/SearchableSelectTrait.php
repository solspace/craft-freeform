<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;

trait SearchableSelectTrait
{
    #[Section('general')]
    #[Input\Boolean(
        label: 'Enable Search',
        instructions: 'Allow users to filter options by typing.',
        order: 5,
    )]
    protected bool $enableSearch = false;

    public function isEnableSearch(): bool
    {
        return $this->enableSearch;
    }

    public function getSearchableConfig(): array
    {
        return [
            'enabled' => $this->enableSearch,
            'placeholder' => \Craft::t('freeform', 'Search options...'),
            'noResults' => \Craft::t('freeform', 'No results found.'),
            'removeLabel' => \Craft::t('freeform', 'Remove {label}'),
            'toggleLabel' => \Craft::t('freeform', 'Show options'),
            'resultsLabel' => \Craft::t('freeform', '{count} results available.'),
        ];
    }
}
