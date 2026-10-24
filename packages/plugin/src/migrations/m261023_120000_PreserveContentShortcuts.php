<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\Pro\ImageField;
use Solspace\Freeform\Fields\Implementations\Pro\RichTextField;
use Solspace\Freeform\Fields\Implementations\Pro\SummaryField;
use Solspace\Freeform\Records\FieldTypeGroupRecord;

/** Keep previously unassigned content fields at the end of the existing palette. */
class m261023_120000_PreserveContentShortcuts extends Migration
{
    public function safeUp(): bool
    {
        $assigned = [];
        foreach ((new Query())->select('types')->from(FieldTypeGroupRecord::TABLE)->column() as $types) {
            $assigned = array_merge($assigned, json_decode($types, true) ?: []);
        }

        $unassigned = array_values(array_diff([HtmlField::class, RichTextField::class, ImageField::class, SummaryField::class, GroupField::class], $assigned));
        if ($unassigned) {
            $this->insert(FieldTypeGroupRecord::TABLE, ['label' => '', 'types' => json_encode($unassigned)]);
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
