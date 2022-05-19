<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Freeform;
use yii\web\Response;

class FeedsController extends BaseController
{
    public function actionShowSummary(): Response
    {
        $this->requireAdmin(false);

        return $this->asJson(Freeform::getInstance()->summary->getSummary()->statistics);
    }

    public function actionDismissMessage(): Response
    {
        $this->requirePostRequest();

        $id = \Craft::$app->request->post('id');

        if (Freeform::getInstance()->feed->markFeedMessageAsRead($id)) {
            return $this->asJson(['success' => true]);
        }

        return $this->asJson(['success' => false]);
    }

    public function actionDismissType(): Response
    {
        $this->requirePostRequest();

        $type = \Craft::$app->request->post('type');

        Freeform::getInstance()->feed->markFeedCategoryAsRead($type);

        return $this->asJson(['success' => true]);
    }
}
