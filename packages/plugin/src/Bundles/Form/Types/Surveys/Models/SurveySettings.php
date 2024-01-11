<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Models;

use craft\base\Model;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;

class SurveySettings extends Model
{
    public const CHART_HORIZONTAL = 'Horizontal';
    public const CHART_VERTICAL = 'Vertical';
    public const CHART_PIE = 'Pie';
    public const CHART_DONUT = 'Donut';
    public const CHART_HIDDEN = 'Hidden';
    public const CHART_TEXT = 'Text';

    public bool $highlightHighest = true;

    public array $chartTypes = [
        CheckboxesField::class => self::CHART_HORIZONTAL,
        RadiosField::class => self::CHART_HORIZONTAL,
        DropdownField::class => self::CHART_HORIZONTAL,
        MultipleSelectField::class => self::CHART_HORIZONTAL,
        OpinionScaleField::class => self::CHART_VERTICAL,
        RatingField::class => self::CHART_VERTICAL,
        TextField::class => self::CHART_TEXT,
        TextareaField::class => self::CHART_TEXT,
        EmailField::class => self::CHART_TEXT,
        NumberField::class => self::CHART_TEXT,
        PhoneField::class => self::CHART_TEXT,
        RegexField::class => self::CHART_TEXT,
        WebsiteField::class => self::CHART_TEXT,
    ];

    public static function fromSettings(array $settings): self
    {
        $instance = new self();
        $instance->highlightHighest = $settings['highlightHighest'] ?? true;

        $chartDefaults = $settings['chartTypes'] ?? [];
        foreach ($chartDefaults as $class => $chartType) {
            if (isset($instance->chartTypes[$class])) {
                $instance->chartTypes[$class] = $chartType;
            }
        }

        return $instance;
    }
}
