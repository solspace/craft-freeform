<?php

namespace Solspace\Freeform\Library\Forms\Merge;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;
use Solspace\Freeform\Library\Migrations\Table;

final class BackgroundMergeTables
{
    public const JOBS = '{{%freeform_form_merges}}';
    public const BATCHES = '{{%freeform_form_merge_batches}}';

    /** @return Table[] */
    public static function definitions(Migration $migration): array
    {
        return [
            (new Table('freeform_form_merges'))
                ->addField('id', $migration->primaryKey())
                ->addField('sourceId', $migration->integer()->notNull())
                ->addField('targetId', $migration->integer()->notNull())
                ->addField('userId', $migration->integer()->notNull())
                ->addField('status', $migration->string(16)->notNull())
                ->addField('state', $migration->longText()->notNull())
                ->addIndex(['userId', 'id'])
                ->addIndex(['sourceId', 'status'])
                ->addIndex(['targetId', 'status']),
            (new Table('freeform_form_merge_batches'))
                ->addField('id', $migration->primaryKey())
                ->addField('mergeId', $migration->integer()->notNull())
                ->addField('throughId', $migration->integer()->notNull())
                ->addField('checksum', $migration->string(64)->notNull())
                ->addIndex(['mergeId', 'throughId'], true)
                ->addForeignKey('mergeId', 'freeform_form_merges', 'id', ForeignKey::CASCADE),
        ];
    }
}
