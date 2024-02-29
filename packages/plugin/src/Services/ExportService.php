<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Freeform;

class ExportService extends BaseService
{
    public function getNavigation(): array
    {
        return [
            // ======= EXPORT =========
            ['heading' => 'Export'],
            [
                'title' => Freeform::t('Profiles'),
                'url' => 'freeform/export/profiles',
            ],
            [
                'title' => Freeform::t('Notifications'),
                'url' => 'freeform/export/notifications',
            ],

            // ======= IMPORT =========
            ['heading' => 'Import'],
            [
                'title' => Freeform::t('Import Express Forms'),
                'url' => 'freeform/import/express-forms',
            ],
        ];
    }
}
