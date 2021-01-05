<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use craft\gql\GqlEntityRegistry;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\FieldArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\OptionsInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\ScalesInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\FieldType;
use Solspace\Freeform\Fields\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Pro\TableField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\FieldInterface as FreeformFieldInterface;

class FieldGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return FieldType::class;
    }

    public static function getArgumentsClass(): string
    {
        return FieldArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return FieldInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Form Field entity';
    }

    public static function generateTypes($context = null): array
    {
        $types = parent::generateTypes($context);

        $fieldTypes = Freeform::getInstance()->fields->getFieldTypes();
        $fieldTypes[FreeformFieldInterface::TYPE_SUBMIT] = FreeformFieldInterface::TYPE_SUBMIT;
        $fieldTypes[FreeformFieldInterface::TYPE_HTML] = FreeformFieldInterface::TYPE_HTML;
        $fieldTypes[FreeformFieldInterface::TYPE_MAILING_LIST] = FreeformFieldInterface::TYPE_MAILING_LIST;
        $fieldTypes[FreeformFieldInterface::TYPE_RICH_TEXT] = FreeformFieldInterface::TYPE_RICH_TEXT;
        $fieldTypes[FreeformFieldInterface::TYPE_RECAPTCHA] = FreeformFieldInterface::TYPE_RECAPTCHA;
        $fieldTypes[FreeformFieldInterface::TYPE_CONFIRMATION] = FreeformFieldInterface::TYPE_CONFIRMATION;
        $fieldTypes[FreeformFieldInterface::TYPE_PASSWORD] = FreeformFieldInterface::TYPE_PASSWORD;
        $fieldTypes[FreeformFieldInterface::TYPE_CREDIT_CARD_DETAILS] = FreeformFieldInterface::TYPE_CREDIT_CARD_DETAILS;

        foreach ($fieldTypes as $fieldType => $fieldTypeName) {
            $typeName = FieldType::getTypeFromString($fieldType);
            $types[$typeName] = self::generateType($typeName, $fieldType);
        }

        return $types;
    }

    private static function generateType(string $typeName, string $fieldType): Type
    {
        static $allFields;

        if (null === $allFields) {
            $allFields = FieldInterface::getFieldDefinitions();
        }

        $fields = array_merge($allFields, self::getFieldDefinitionsForType($fieldType));

        return GqlEntityRegistry::getEntity($typeName) ?: GqlEntityRegistry::createEntity(
            $typeName,
            new FieldType(
                [
                    'name' => $typeName,
                    'fields' => function () use ($fields) {
                        return $fields;
                    },
                    'resolveType' => function () use ($typeName) {
                        return $typeName;
                    },
                ]
            )
        );
    }

    private static function getFieldDefinitionsForType(string $typeName)
    {
        $fieldDefinitions = [
            'value' => self::getFieldValueDefinitions($typeName),
        ];

        if (FreeformFieldInterface::TYPE_TEXT === $typeName) {
            $fieldDefinitions['maxLength'] = [
                'name' => 'maxLength',
                'type' => Type::int(),
                'description' => 'The maximum length of characters for this field',
            ];
        }

        if (FreeformFieldInterface::TYPE_TEXTAREA === $typeName) {
            $fieldDefinitions['maxLength'] = [
                'name' => 'maxLength',
                'type' => Type::int(),
                'description' => 'The maximum length of characters for this field',
            ];

            $fieldDefinitions['rows'] = [
                'name' => 'rows',
                'type' => Type::int(),
                'description' => 'Number of rows to show for this textarea',
            ];
        }

        if (FreeformFieldInterface::TYPE_SUBMIT === $typeName) {
            $fieldDefinitions['labelNext'] = [
                'name' => 'labelNext',
                'type' => Type::string(),
                'description' => 'Label for the "next" button',
            ];

            $fieldDefinitions['labelPrev'] = [
                'name' => 'labelPrev',
                'type' => Type::string(),
                'description' => 'Label for the "previous" button',
            ];

            $fieldDefinitions['disablePrev'] = [
                'name' => 'disablePrev',
                'type' => Type::boolean(),
                'description' => 'Is the "previous" button disabled',
            ];

            $fieldDefinitions['position'] = [
                'name' => 'position',
                'type' => Type::string(),
                'description' => 'Position of the buttons',
            ];
        }

        $optionsFields = [
            FreeformFieldInterface::TYPE_CHECKBOX_GROUP,
            FreeformFieldInterface::TYPE_RADIO_GROUP,
            FreeformFieldInterface::TYPE_SELECT,
            FreeformFieldInterface::TYPE_MULTIPLE_SELECT,
            FreeformFieldInterface::TYPE_DYNAMIC_RECIPIENTS,
        ];
        if (\in_array($typeName, $optionsFields, true)) {
            $fieldDefinitions['options'] = [
                'name' => 'options',
                'type' => Type::listOf(OptionsInterface::getType()),
                'description' => 'Options',
            ];
        }

        if (FreeformFieldInterface::TYPE_NUMBER === $typeName) {
            $fieldDefinitions['minLength'] = [
                'name' => 'minLength',
                'type' => Type::int(),
                'description' => 'Minimum length of the number',
            ];

            $fieldDefinitions['minValue'] = [
                'name' => 'minValue',
                'type' => Type::int(),
                'description' => 'Minimum value of the number',
            ];

            $fieldDefinitions['maxValue'] = [
                'name' => 'maxValue',
                'type' => Type::int(),
                'description' => 'Maximum value of the number',
            ];

            $fieldDefinitions['decimalCount'] = [
                'name' => 'decimalCount',
                'type' => Type::int(),
                'description' => 'Number of decimals',
            ];

            $fieldDefinitions['step'] = [
                'name' => 'step',
                'type' => Type::float(),
                'description' => 'Step increment property',
            ];

            $fieldDefinitions['decimalSeparator'] = [
                'name' => 'decimalSeparator',
                'type' => Type::string(),
                'description' => 'The decimal separator',
            ];

            $fieldDefinitions['thousandsSeparator'] = [
                'name' => 'thousandsSeparator',
                'type' => Type::string(),
                'description' => 'The thousands separator',
            ];

            $fieldDefinitions['allowNegative'] = [
                'name' => 'allowNegative',
                'type' => Type::boolean(),
                'description' => 'Allow negative numbers',
            ];
        }

        if (FreeformFieldInterface::TYPE_FILE === $typeName) {
            $fieldDefinitions['fileKinds'] = [
                'name' => 'fileKinds',
                'type' => Type::listOf(Type::string()),
                'description' => 'List of allowed file kinds',
            ];

            $fieldDefinitions['maxFileSizeKB'] = [
                'name' => 'maxFileSizeKB',
                'type' => Type::int(),
                'description' => 'Maximum allowed filesize in KB',
            ];

            $fieldDefinitions['fileCount'] = [
                'name' => 'fileCount',
                'type' => Type::int(),
                'description' => 'Number of allowed simultaneous file uploads',
            ];
        }

        $notificationTypes = [FreeformFieldInterface::TYPE_DYNAMIC_RECIPIENTS, FreeformFieldInterface::TYPE_EMAIL];
        if (\in_array($typeName, $notificationTypes, true)) {
            $fieldDefinitions['notificationId'] = [
                'name' => 'notificationId',
                'type' => Type::string(),
                'description' => 'The ID of the DB notification or the string filename of the file based notification.',
            ];
        }

        if (FreeformFieldInterface::TYPE_DYNAMIC_RECIPIENTS === $typeName) {
            $fieldDefinitions['showAsRadio'] = [
                'name' => 'showAsRadio',
                'type' => Type::boolean(),
                'description' => 'Is this shown as a radio list',
            ];

            $fieldDefinitions['showAsCheckboxes'] = [
                'name' => 'showAsCheckboxes',
                'type' => Type::boolean(),
                'description' => 'Is this shown as a checkbox list',
            ];

            $fieldDefinitions['oneLine'] = [
                'name' => 'oneLine',
                'type' => Type::boolean(),
                'description' => 'Should this be shown in a single line',
            ];
        }

        $placeholderTypes = [
            FreeformFieldInterface::TYPE_TEXT,
            FreeformFieldInterface::TYPE_TEXTAREA,
            FreeformFieldInterface::TYPE_EMAIL,
            FreeformFieldInterface::TYPE_NUMBER,
            FreeformFieldInterface::TYPE_DATETIME,
            FreeformFieldInterface::TYPE_PASSWORD,
            FreeformFieldInterface::TYPE_PHONE,
            FreeformFieldInterface::TYPE_WEBSITE,
        ];
        if (\in_array($typeName, $placeholderTypes, true)) {
            $fieldDefinitions['placeholder'] = [
                'name' => 'placeholder',
                'type' => Type::string(),
                'description' => 'The placeholder of this field',
            ];
        }

        if (FreeformFieldInterface::TYPE_CHECKBOX_GROUP === $typeName) {
            $fieldDefinitions['oneLine'] = [
                'name' => 'oneLine',
                'type' => Type::boolean(),
                'description' => 'Should this be shown in a single line',
            ];
        }

        if (FreeformFieldInterface::TYPE_CHECKBOX === $typeName) {
            $fieldDefinitions['checked'] = [
                'name' => 'checked',
                'type' => Type::boolean(),
                'description' => 'Is this checkbox checked by default',
            ];
        }

        if (FreeformFieldInterface::TYPE_CONFIRMATION === $typeName) {
            $fieldDefinitions['targetFieldHash'] = [
                'name' => 'targetFieldHash',
                'type' => Type::string(),
                'description' => 'Hash of the field that has to be confirmed',
            ];
        }

        if (FreeformFieldInterface::TYPE_DATETIME === $typeName) {
            $fieldDefinitions['dateTimeType'] = [
                'name' => 'dateTimeType',
                'type' => Type::string(),
                'description' => 'Type of the date field. ("date", "time", "both")',
            ];

            $fieldDefinitions['generatePlaceholder'] = [
                'name' => 'generatePlaceholder',
                'type' => Type::boolean(),
                'description' => 'Should a placeholder be auto-generated for this field',
            ];

            $fieldDefinitions['dateOrder'] = [
                'name' => 'dateOrder',
                'type' => Type::string(),
                'description' => 'Order of the date chunks.',
            ];

            $fieldDefinitions['date4DigitYear'] = [
                'name' => 'date4DigitYear',
                'type' => Type::boolean(),
                'description' => 'Determines if the year should be displayed with 4 digits or two',
            ];

            $fieldDefinitions['dateLeadingZero'] = [
                'name' => 'dateLeadingZero',
                'type' => Type::boolean(),
                'description' => 'Determines if the dates should use a leading zero',
            ];

            $fieldDefinitions['dateSeparator'] = [
                'name' => 'dateSeparator',
                'type' => Type::string(),
                'description' => 'Date separator',
            ];

            $fieldDefinitions['clock24h'] = [
                'name' => 'clock24h',
                'type' => Type::boolean(),
                'description' => 'Should the clock use a 24h format',
            ];

            $fieldDefinitions['clockSeparator'] = [
                'name' => 'clockSeparator',
                'type' => Type::string(),
                'description' => 'Clock separator',
            ];

            $fieldDefinitions['clockAMPMSeparate'] = [
                'name' => 'clockAMPMSeparate',
                'type' => Type::boolean(),
                'description' => 'Should the AM/PM be separated from the time by a space',
            ];

            $fieldDefinitions['useDatepicker'] = [
                'name' => 'useDatepicker',
                'type' => Type::boolean(),
                'description' => 'Should the built-in datepicker be used',
            ];

            $fieldDefinitions['minDate'] = [
                'name' => 'minDate',
                'type' => Type::string(),
                'description' => 'Specifies the minimum allowed date that can be picked',
            ];

            $fieldDefinitions['maxDate'] = [
                'name' => 'maxDate',
                'type' => Type::string(),
                'description' => 'Specifies the maximum allowed date that can be picked',
            ];
        }

        if (FreeformFieldInterface::TYPE_OPINION_SCALE === $typeName) {
            $fieldDefinitions['scales'] = [
                'name' => 'scales',
                'type' => Type::listOf(ScalesInterface::getType()),
                'description' => 'Opinion field scales',
            ];

            $fieldDefinitions['legends'] = [
                'name' => 'legends',
                'type' => Type::listOf(Type::string()),
                'description' => 'Opinion field legends',
                'resolve' => function (OpinionScaleField $source, $arguments, $context, ResolveInfo $resolveInfo) {
                    $legends = $source->getLegends();

                    return array_map(
                        function ($item) {
                            return $item['legend'];
                        },
                        $legends
                    );
                },
            ];
        }

        if (FreeformFieldInterface::TYPE_PHONE === $typeName) {
            $fieldDefinitions['pattern'] = [
                'name' => 'pattern',
                'type' => Type::string(),
                'description' => 'Phone number pattern',
            ];

            $fieldDefinitions['useJsMask'] = [
                'name' => 'useJsMask',
                'type' => Type::boolean(),
                'description' => 'Should the built-in pattern matcher javascript be enabled',
            ];
        }

        if (FreeformFieldInterface::TYPE_RATING === $typeName) {
            $fieldDefinitions['maxValue'] = [
                'name' => 'maxValue',
                'type' => Type::int(),
                'description' => 'Maximum allowed rating value',
            ];

            $fieldDefinitions['colorIdle'] = [
                'name' => 'colorIdle',
                'type' => Type::string(),
                'description' => 'Color of the unselected, unhovered rating star',
            ];

            $fieldDefinitions['colorHover'] = [
                'name' => 'colorHover',
                'type' => Type::string(),
                'description' => 'Color of the hovered rating star',
            ];

            $fieldDefinitions['colorSelected'] = [
                'name' => 'colorSelected',
                'type' => Type::string(),
                'description' => 'Color of the selected rating star',
            ];
        }

        if (FreeformFieldInterface::TYPE_REGEX === $typeName) {
            $fieldDefinitions['pattern'] = [
                'name' => 'pattern',
                'type' => Type::string(),
                'description' => 'Regex pattern',
            ];

            $fieldDefinitions['message'] = [
                'name' => 'message',
                'type' => Type::string(),
                'description' => 'The error message to be displayed',
            ];
        }

        if (FreeformFieldInterface::TYPE_SIGNATURE === $typeName) {
            $fieldDefinitions['width'] = [
                'name' => 'width',
                'type' => Type::int(),
                'description' => 'Width in pixels',
            ];

            $fieldDefinitions['height'] = [
                'name' => 'height',
                'type' => Type::int(),
                'description' => 'Height in pixels',
            ];

            $fieldDefinitions['showClearButton'] = [
                'name' => 'showClearButton',
                'type' => Type::boolean(),
                'description' => 'Determines if the "clear" button should be displayed',
            ];

            $fieldDefinitions['borderColor'] = [
                'name' => 'borderColor',
                'type' => Type::string(),
                'description' => 'Signature field border color',
            ];

            $fieldDefinitions['backgroundColor'] = [
                'name' => 'backgroundColor',
                'type' => Type::string(),
                'description' => 'Signature field background color',
            ];

            $fieldDefinitions['penColor'] = [
                'name' => 'penColor',
                'type' => Type::string(),
                'description' => 'Signature field pen color',
            ];

            $fieldDefinitions['penDotSize'] = [
                'name' => 'penDotSize',
                'type' => Type::float(),
                'description' => 'The size of the pen dot',
            ];
        }

        if (FreeformFieldInterface::TYPE_TABLE === $typeName) {
            $fieldDefinitions['useScript'] = [
                'name' => 'useScript',
                'type' => Type::boolean(),
                'description' => 'Should the built-in javascript for handling table rows be used',
            ];

            $fieldDefinitions['maxRows'] = [
                'name' => 'maxRows',
                'type' => Type::int(),
                'description' => 'Number of maximum allowed rows this table can have',
            ];

            $fieldDefinitions['addButtonLabel'] = [
                'name' => 'addButtonLabel',
                'type' => Type::string(),
                'description' => 'The label for the "add row" button',
            ];

            $fieldDefinitions['addButtonMarkup'] = [
                'name' => 'addButtonMarkup',
                'type' => Type::string(),
                'description' => 'Custom html for the "add row" button',
            ];

            $fieldDefinitions['removeButtonLabel'] = [
                'name' => 'removeButtonLabel',
                'type' => Type::string(),
                'description' => 'The label for the "delete row" button',
            ];

            $fieldDefinitions['removeButtonMarkup'] = [
                'name' => 'removeButtonMarkup',
                'type' => Type::string(),
                'description' => 'Custom html for the "delete row" button',
            ];

            $fieldDefinitions['tableLayout'] = [
                'name' => 'tableLayout',
                'type' => Type::string(),
                'description' => 'JSON of the table layout',
                'resolve' => function (TableField $source, $arguments, $context, ResolveInfo $resolveInfo) {
                    return json_encode($source->getTableLayout());
                },
            ];
        }

        if (FreeformFieldInterface::TYPE_MAILING_LIST === $typeName) {
            $fieldDefinitions['hidden'] = [
                'name' => 'hidden',
                'type' => Type::boolean(),
                'description' => 'Should this field be a hidden field or a checkbox',
            ];
        }

        if (FreeformFieldInterface::TYPE_HTML === $typeName) {
            $fieldDefinitions['twig'] = [
                'name' => 'twig',
                'type' => Type::boolean(),
                'description' => 'Should twig be allowed in this field',
            ];
        }

        return $fieldDefinitions;
    }

    private static function getFieldValueDefinitions(string $typeName)
    {
        $multipleValues = [
            FreeformFieldInterface::TYPE_DYNAMIC_RECIPIENTS,
            FreeformFieldInterface::TYPE_EMAIL,
            FreeformFieldInterface::TYPE_CHECKBOX_GROUP,
            FreeformFieldInterface::TYPE_MULTIPLE_SELECT,
            FreeformFieldInterface::TYPE_TABLE,
        ];

        $isMultiple = \in_array($typeName, $multipleValues, true);

        return [
            'name' => 'value'.($isMultiple ? 's' : ''),
            'type' => ($isMultiple ? Type::listOf(Type::string()) : Type::string()),
            'description' => "Field's default value",
        ];
    }
}
