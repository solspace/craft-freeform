<?php

namespace Solspace\Freeform\Controllers\Migrations;

use Solspace\Freeform\Bundles\Migrations\Notifications\NotificationsMigrator;
use Solspace\Freeform\Controllers\BaseController;
use yii\web\Response;

class NotificationsController extends BaseController
{
    private $migrator;

    public function __construct($id, $module, $config = [], NotificationsMigrator $migrator = null)
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
