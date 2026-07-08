<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

class m240814_120443_RefactorGridAndFlexboxFormattingTemplatePaths extends Migration
{
    private const REPLACE_PATTERN = [
        'grid.twig' => 'grid/index.twig',
        'flexbox.twig' => 'flexbox/index.twig',
    ];

    public function safeUp(): bool
    {
        $results = (new Query())
            ->select(['metadata'])
            ->from('{{%freeform_forms}}')
            ->indexBy('id')
            ->column()
        ;

        foreach ($results as $formId => $metadata) {
            foreach (self::REPLACE_PATTERN as $old => $new) {
                $match = '"formattingTemplate":"'.$old.'"';
                $replacement = '"formattingTemplate":"'.$new.'"';
                if (!str_contains($metadata, $match)) {
                    continue;
                }

                $metadata = str_replace($match, $replacement, $metadata);

                $this
                    ->db
                    ->createCommand()
                    ->update(
                        '{{%freeform_forms}}',
                        ['metadata' => $metadata],
                        ['id' => $formId]
                    )
                    ->execute()
                ;
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        $results = (new Query())
            ->select(['metadata'])
            ->from('{{%freeform_forms}}')
            ->indexBy('id')
            ->column()
        ;

        foreach ($results as $formId => $metadata) {
            foreach (self::REPLACE_PATTERN as $old => $new) {
                $match = '"formattingTemplate":"'.$new.'"';
                $replacement = '"formattingTemplate":"'.$old.'"';
                if (!str_contains($metadata, $match)) {
                    continue;
                }

                $metadata = str_replace($match, $replacement, $metadata);

                $this
                    ->db
                    ->createCommand()
                    ->update(
                        '{{%freeform_forms}}',
                        ['metadata' => $metadata],
                        ['id' => $formId]
                    )
                    ->execute()
                ;
            }
        }

        return true;
    }
}
