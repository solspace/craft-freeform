<?php

namespace Solspace\Freeform\Bundles\Backup;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use craft\web\UrlRule;
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
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/backup/export',
                    'route' => 'freeform/backup-export',
                    'verb' => ['GET', 'POST'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/backup/import',
                    'route' => 'freeform/backup-import',
                    'verb' => ['GET', 'POST'],
                ]);
            }
        );
    }
}
