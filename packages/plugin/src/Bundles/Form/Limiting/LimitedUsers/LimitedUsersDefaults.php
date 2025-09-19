<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes\Boolean;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes\Group;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes\Toggles;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Assets\Assets;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries\Entries;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\OptionTypesProvider;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Users\Users;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Days\Days;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\DaysOfWeek\DaysOfWeek;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Languages\Languages;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Months\Months;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Numbers\Numbers;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\States\States;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Years\Years;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField as EmailFieldNotification;

class LimitedUsersDefaults
{
    public function __construct(
        private FieldTypesProvider $fieldTypesProvider,
        private OptionTypesProvider $optionTypesProvider,
    ) {}

    public function get(): array
    {
        return [
            (new Group('layout', 'Layout'))
                ->setChildren([
                    new Boolean('multiPageForms', 'Add Pages to Forms', true),
                    (new Toggles('fieldTypes', 'Allowed Field Types'))
                        ->setValues([
                            TextField::class,
                            TextareaField::class,
                            EmailField::class,
                            HiddenField::class,
                            DropdownField::class,
                            CheckboxesField::class,
                            RadiosField::class,
                            FileDragAndDropField::class,
                            NumberField::class,
                            ConfirmationField::class,
                            DatetimeField::class,
                            PhoneField::class,
                            RatingField::class,
                            WebsiteField::class,
                            OpinionScaleField::class,
                            TableField::class,
                        ])
                        ->setOptions($this->getFieldTypes()),

                    (new Boolean('fields', 'Advanced Field Properties', true))
                        ->setChildren([
                            new Boolean('handles', 'Field Handles', true),
                            new Boolean('attributes', 'Field Attribute Editor', true),
                            new Boolean('encrypted', 'Encrypt Field Data'),
                            new Boolean('types', 'Field Type Switcher'),
                        ]),

                    new Boolean('buttons', 'Advanced Settings on Submit Buttons', true),
                    new Boolean('fieldManager', 'Access Field Type Manager', true),
                    new Boolean('formsFields', 'Access Fields from other Forms', true),
                    new Boolean('favoritesManager', 'Access Favorite Fields Manager', true),
                    new Boolean('favorite', 'Save Fields as Favorites', true),

                    (new Group('options', 'Field Option Sources'))
                        ->setChildren([
                            new Boolean('custom', 'Custom Options', true),
                            (new Boolean('elements', 'Elements', true))
                                ->setChildren([
                                    (new Toggles('types', 'Allowed Types'))
                                        ->setValues([
                                            Assets::class,
                                            Entries::class,
                                            Users::class,
                                        ])
                                        ->setOptions($this->getElementTypes()),
                                ]),
                            (new Boolean('predefined', 'Predefined', true))
                                ->setChildren([
                                    (new Toggles('types', 'Allowed Types'))
                                        ->setValues([
                                            States::class,
                                            Languages::class,
                                            Numbers::class,
                                            Years::class,
                                            Months::class,
                                            Days::class,
                                            DaysOfWeek::class,
                                        ])
                                        ->setOptions($this->getPredefinedTypes()),
                                ]),
                            new Boolean('convert', 'Convert to Custom Values'),
                        ]),
                ]),

            (new Group('props', 'Field Properties'))
                ->setChildren([
                    (new Toggles('date', 'Date & Time Field'))
                        ->setValues([
                            'type',
                            'initialValue',
                            'locale',
                            'datepicker',
                            'nativeTypes',
                            'formatAsPlaceholder',
                            'dateOrder',
                            'date4DigitYear',
                            'dateLeadingZero',
                            'dateSeparator',
                            'minDate',
                            'maxDate',
                            'clock24h',
                            'clockSeparator',
                            'clockAMPMSeparate',
                        ])
                        ->setOptions([
                            'type' => 'Type',
                            'initialValue' => 'Initial Value',
                            'locale' => 'Force Locale',
                            'datepicker' => 'Use Built-In Datepicker',
                            'nativeTypes' => 'Use Native Input Types',
                            'formatAsPlaceholder' => 'Use Format as Placeholder',
                            'dateOrder' => 'Date Order',
                            'date4DigitYear' => '4-Digit Year',
                            'dateLeadingZero' => 'Leading Zero on Date',
                            'dateSeparator' => 'Date Separator',
                            'minDate' => 'Minimum Date',
                            'maxDate' => 'Maximum Date',
                            'clock24h' => '24-Hour Clock',
                            'clockSeparator' => 'Clock Separator',
                            'clockAMPMSeparate' => 'Separate AM/PM with a space',
                        ]),
                    (new Toggles('phone', 'Phone Field'))
                        ->setValues([
                            'pattern',
                            'javascript',
                        ])
                        ->setOptions([
                            'pattern' => 'Pattern Validation',
                            'javascript' => 'Built-in javascript validation',
                        ]),
                    (new Toggles('file', 'File Uplaod Fields'))
                        ->setValues([
                            'count',
                            'source',
                            'uploadLocation',
                            'fileKinds',
                            'maxFileSizeKB',
                            'accentColor',
                            'theme',
                            'placeholder',
                            'removeFileMessage',
                            'dialogElement',
                            'dialogSelector',
                        ])
                        ->setOptions([
                            'count' => 'File Count',
                            'source' => 'Asset Source',
                            'uploadLocation' => 'Upload Location',
                            'fileKinds' => 'File Kinds',
                            'maxFileSizeKB' => 'Maximum File Size',
                            'accentColor' => 'Accent Color',
                            'theme' => 'Theme',
                            'placeholder' => 'Placeholder',
                            'removeFileMessage' => 'Remove File Message',
                            'dialogElement' => 'Use Dialog Element',
                            'dialogSelector' => 'Custom Dialog Selector',
                        ]),
                    (new Toggles('html', 'HTML Field'))
                        ->setValues(['twig'])
                        ->setOptions([
                            'twig' => 'Allow Twig',
                        ]),
                    (new Toggles('table', 'Table Field'))
                        ->setValues([
                            'javascript',
                            'maxRows',
                            'addButtonLabel',
                            'addButtonMarkup',
                            'removeButtonLabel',
                            'removeButtonMarkup',
                            'tableAttributes',
                        ])
                        ->setOptions([
                            'javascript' => 'Use built-in javascript for adding/removing rows',
                            'maxRows' => 'Maximum Rows',
                            'addButtonLabel' => 'Add Button Label',
                            'addButtonMarkup' => 'Add Button Markup',
                            'removeButtonLabel' => 'Remove Button Label',
                            'removeButtonMarkup' => 'Remove Button Markup',
                            'tableAttributes' => 'Table Attributes',
                        ]),
                    (new Toggles('rating', 'Rating Field'))
                        ->setValues([
                            'max',
                            'idle',
                            'hover',
                            'selected',
                        ])
                        ->setOptions([
                            'max' => 'Maximum Stars',
                            'idle' => 'Unselected Color',
                            'hover' => 'Hover Color',
                            'selected' => 'Selected Color',
                        ]),
                    (new Toggles('signature', 'Signature Field'))
                        ->setValues([
                            'width',
                            'height',
                            'clear',
                            'borderColor',
                            'backgroundColor',
                            'penColor',
                            'penDotSize',
                        ])
                        ->setOptions([
                            'width' => 'Width of Pad',
                            'height' => 'Height of Pad',
                            'clear' => 'Show "Clear" Button',
                            'borderColor' => 'Border Color',
                            'backgroundColor' => 'Background Color',
                            'penColor' => 'Pen Color',
                            'penDotSize' => 'Pen Dot Size',
                        ]),
                    (new Toggles('calculation', 'Calculation Field'))
                        ->setValues([
                            'decimalCount',
                            'inputType',
                        ])
                        ->setOptions([
                            'decimalCount' => 'Decimal Count',
                            'inputType' => 'Input Type',
                        ]),
                    (new Toggles('cards', 'Cards Field'))
                        ->setValues([
                            'max',
                            'perRow',
                            'transform',
                        ])
                        ->setOptions([
                            'max' => 'Maximum Selected Values',
                            'perRow' => 'Cards Per Row',
                            'transform' => 'Image Transform',
                        ]),
                ]),

            (new Group('notifications', 'Notifications'))
                ->setChildren([
                    (new Boolean('tab', 'Notifications Tab', true))
                        ->setChildren([
                            new Boolean(Admin::class, 'Admin'),
                            new Boolean(Conditional::class, 'Conditional'),
                            new Boolean(Dynamic::class, 'User Select'),
                            new Boolean(EmailFieldNotification::class, 'Email Field'),
                        ]),
                ]),
            (new Group('rules', 'Rules'))
                ->setChildren([
                    (new Boolean('tab', 'Rules Tab', true))
                        ->setChildren([
                            new Boolean('fields', 'Rules on Fields'),
                            new Boolean('buttons', 'Rules on Buttons'),
                            new Boolean('pages', 'Rules on Pages'),
                            new Boolean('submit', 'Rules on Submit Form'),
                        ]),
                ]),
            (new Group('integrations', 'Integrations'))
                ->setChildren([
                    new Boolean('tab', 'Integrations Tab', true),
                ]),
            (new Group('settings', 'Settings'))
                ->setChildren([
                    (new Boolean('tab', 'Settings Tab', true))
                        ->setChildren([
                            (new Boolean('general', 'General'))
                                ->setChildren([
                                    new Boolean('handle', 'Form Handle'),
                                    new Boolean('type', 'Form Type'),
                                    new Boolean('translations', 'Translatable'),
                                    new Boolean('submissionTitle', 'Submission Title'),
                                    new Boolean('formattingTemplate', 'Formatting Template'),
                                    new Boolean('attributes', 'Attributes'),
                                ]),
                            new Boolean('data-storage', 'Data Storage'),
                            new Boolean('processing', 'Processing'),
                            new Boolean('success-and-errors', 'Success & Errors'),
                            new Boolean('limits', 'Limits'),
                        ]),
                ]),
        ];
    }

    private function getFieldTypes(): array
    {
        $types = $this->fieldTypesProvider->getTypes();

        $result = [];
        foreach ($types as $type) {
            $result[$type->typeClass] = $type->getName();
        }

        return $result;
    }

    private function getElementTypes(): array
    {
        $types = $this->optionTypesProvider->getElementTypes();

        $result = [];
        foreach ($types as $type) {
            $result[$type::class] = $type->getName();
        }

        return $result;
    }

    private function getPredefinedTypes(): array
    {
        $types = $this->optionTypesProvider->getPredefinedTypes();

        $result = [];
        foreach ($types as $type) {
            $result[$type::class] = $type->getName();
        }

        return $result;
    }
}
