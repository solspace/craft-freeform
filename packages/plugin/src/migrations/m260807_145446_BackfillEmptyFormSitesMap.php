<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Records\Form\FormSiteRecord;
use Solspace\Freeform\Records\FormRecord;

class m260807_145446_BackfillEmptyFormSitesMap extends Migration
{
    public function safeUp(): bool
    {
        $mapTable = FormSiteRecord::TABLE;
        if (!$this->db->tableExists($mapTable)) {
            return true;
        }

        $formIds = (new Query())
            ->select('id')
            ->from(FormRecord::TABLE)
            ->column()
        ;

        $siteIds = (new Query())
            ->select('id')
            ->from('{{%sites}}')
            ->column()
        ;

        if (!$formIds || !$siteIds) {
            return true;
        }

        $mappedFormIds = (new Query())
            ->select('formId')
            ->distinct()
            ->from($mapTable)
            ->column()
        ;

        $mappedFormIds = array_flip(array_map('intval', $mappedFormIds));

        foreach ($formIds as $formId) {
            if (isset($mappedFormIds[(int) $formId])) {
                continue;
            }

            foreach ($siteIds as $siteId) {
                $this->insert(
                    $mapTable,
                    [
                        'formId' => $formId,
                        'siteId' => $siteId,
                    ],
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return true;
    }
}
