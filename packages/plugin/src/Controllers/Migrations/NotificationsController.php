<?php

namespace Solspace\Freeform\controllers\migrations;

use Solspace\Freeform\Bundles\Migrations\Notifications\NotificationsMigrator;
use Solspace\Freeform\Controllers\BaseController;
use yii\web\Response;

class NotificationsController extends BaseController
{
    private NotificationsMigrator $migrator;

    public function __construct($id, $module, $config = [], NotificationsMigrator $migrator)
    {
        parent::__construct($id, $module, $config);

        $this->migrator = $migrator;
    }

    public function actionDbToFile(): Response
    {
        $this->requirePostRequest();
        $this->requireAcceptsJson();

        $removeDbNotifications = (bool) \Craft::$app->request->post('removeDbNotifications');

        $this->migrator->migrate($removeDbNotifications);

        return $this->asJson(['success' => true]);
    }
}
