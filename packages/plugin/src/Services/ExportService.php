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

use craft\helpers\UrlHelper;
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
                'url' => UrlHelper::cpUrl('freeform/export/profiles'),
            ],
            [
                'title' => Freeform::t('Notifications'),
                'url' => UrlHelper::cpUrl('freeform/export/notifications'),
            ],
            [
                'title' => Freeform::t('Forms & Data'),
                'url' => UrlHelper::cpUrl('freeform/export/forms'),
            ],

            // ======= IMPORT =========
            ['heading' => 'Import'],
            [
                'title' => Freeform::t('Import Freeform Data'),
                'url' => UrlHelper::cpUrl('freeform/import/data'),
            ],
            [
                'title' => Freeform::t('Import Express Forms'),
                'url' => UrlHelper::cpUrl('freeform/import/express-forms'),
            ],
        ];
    }
}
