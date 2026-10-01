<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined\Types\SurveyScales;

use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Properties\Options\Predefined\TranslatedOptions;

class SurveyScales extends TranslatedOptions
{
    #[Select(
        label: 'Survey Scale',
        instructions: 'Identifiers are scores from 1 (lowest) to 5 (highest).',
        order: 0,
        options: [
            'agreement' => 'Agreement',
            'satisfaction' => 'Satisfaction',
            'frequency' => 'Frequency',
            'importance' => 'Importance',
            'likelihood' => 'Likelihood',
        ],
    )]
    private string $scale = 'agreement';

    public function getName(): string
    {
        return 'Survey Scales';
    }

    protected function getItems(): array
    {
        static $items;
        if (null === $items) {
            $items = json_decode(file_get_contents(__DIR__.'/survey-scales.json'), true, 512, \JSON_THROW_ON_ERROR);
        }

        return $items[$this->scale] ?? [];
    }
}
