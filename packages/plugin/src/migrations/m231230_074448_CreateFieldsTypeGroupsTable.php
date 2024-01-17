<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m231230_074448_CreateFieldsTypeGroupsTable migration.
 */
class m231230_074448_CreateFieldsTypeGroupsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_fields_type_groups}}',
            [
                'id' => $this->primaryKey(),
                'color' => $this->string(10),
                'label' => $this->string(),
                'types' => $this->json()->notNull(),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        $this->batchInsert(
            '{{%freeform_fields_type_groups}}',
            ['color', 'label', 'types'],
            [
                [
                    '#007add',
                    'Text',
                    [
                        'Solspace\Freeform\Fields\Implementations\TextField',
                        'Solspace\Freeform\Fields\Implementations\TextareaField',
                        'Solspace\Freeform\Fields\Implementations\EmailField',
                        'Solspace\Freeform\Fields\Implementations\NumberField',
                        'Solspace\Freeform\Fields\Implementations\Pro\PhoneField',
                        'Solspace\Freeform\Fields\Implementations\Pro\DatetimeField',
                        'Solspace\Freeform\Fields\Implementations\Pro\WebsiteField',
                        'Solspace\Freeform\Fields\Implementations\Pro\RegexField',
                    ],
                ],
                [
                    '#9013fe',
                    'Options',
                    [
                        'Solspace\Freeform\Fields\Implementations\DropdownField',
                        'Solspace\Freeform\Fields\Implementations\MultipleSelectField',
                        'Solspace\Freeform\Fields\Implementations\CheckboxField',
                        'Solspace\Freeform\Fields\Implementations\CheckboxesField',
                        'Solspace\Freeform\Fields\Implementations\RadiosField',
                        'Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField',
                        'Solspace\Freeform\Fields\Implementations\Pro\RatingField',
                    ],
                ],
                [
                    '#f5a623',
                    'Files',
                    [
                        'Solspace\Freeform\Fields\Implementations\FileUploadField',
                        'Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField',
                    ],
                ],
                [
                    '#5d9901',
                    'Special',
                    [
                        'Solspace\Freeform\Fields\Implementations\Pro\GroupField',
                        'Solspace\Freeform\Fields\Implementations\Pro\TableField',
                        'Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField',
                        'Solspace\Freeform\Fields\Implementations\Pro\PasswordField',
                        'Solspace\Freeform\Fields\Implementations\Pro\SignatureField',
                    ],
                ],
                [
                    '#000000',
                    'Content',
                    [
                        'Solspace\Freeform\Fields\Implementations\HtmlField',
                        'Solspace\Freeform\Fields\Implementations\Pro\RichTextField',
                    ],
                ],
                [
                    '#9b9b9b',
                    'Hidden',
                    [
                        'Solspace\Freeform\Fields\Implementations\HiddenField',
                        'Solspace\Freeform\Fields\Implementations\Pro\InvisibleField',
                    ],
                ],
            ]
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m231230_074448_CreateFieldsTypeGroupsTable cannot be reverted.\n";

        return false;
    }
}
