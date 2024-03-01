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
        $navigation = [
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
        ];

        // ======= IMPORT =========
        $isInstalled = \Craft::$app->plugins->isPluginInstalled('express-forms');
        $isEnabled = \Craft::$app->plugins->isPluginEnabled('express-forms');
        if ($isInstalled && $isEnabled) {
            $navigation[] = ['heading' => 'Import'];
            $navigation[] = [
                'title' => Freeform::t('Express Forms'),
                'url' => 'freeform/import/express-forms',
            ];
        }

        return $navigation;
    }
}
