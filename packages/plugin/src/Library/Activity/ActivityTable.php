<?php

namespace Solspace\Freeform\Library\Activity;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\Table;

class ActivityTable
{
    public const TABLE = '{{%freeform_activity}}';

    public static function definition(Migration $migration): Table
    {
        return (new Table('freeform_activity'))
            ->addField('id', $migration->primaryKey())
            ->addField('event', $migration->string(32)->notNull())
            ->addField('category', $migration->string(20)->notNull())
            ->addField('level', $migration->string(10)->notNull())
            ->addField('formId', $migration->integer())
            ->addField('submissionId', $migration->integer())
            ->addField('metadata', $migration->text())
            ->addIndex(['dateCreated', 'id'])
            ->addIndex(['category', 'id'])
            ->addIndex(['level', 'id'])
            ->addIndex(['event', 'id'])
            ->addIndex(['formId', 'id'])
            ->addIndex(['submissionId', 'id'])
        ;
    }
}
