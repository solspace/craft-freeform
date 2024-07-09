<?php

namespace Solspace\Freeform\Bundles\Backup;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Bundles\Backup\Controllers\ExportController;
use Solspace\Freeform\Bundles\Backup\Controllers\ImportController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class BackupBundle extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('backup-export', ExportController::class);
        $this->registerController('backup-import', ImportController::class);

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules['freeform/api/import/prepare'] = 'freeform/backup-import/prepare-import';
                $event->rules['freeform/api/import'] = 'freeform/backup-import/import';
                $event->rules['freeform/import/data'] = 'freeform/forms';
                $event->rules['freeform/import/express-forms'] = 'freeform/forms';
                $event->rules['freeform/import/express-forms/data'] = 'freeform/backup-import/express-forms';

                $event->rules['freeform/export/forms'] = 'freeform/forms';
                $event->rules['freeform/export/forms/data'] = 'freeform/backup-export/freeform';
                $event->rules['freeform/export'] = 'freeform/backup-export/export';
            }
        );
    }
}
