<?php

namespace Solspace\Freeform\Controllers;

use Solspace\Freeform\Freeform;

class FeedsController extends BaseController
{
    public function actionShowSummary()
    {
        $this->requireAdmin(false);

        return $this->asJson(Freeform::getInstance()->summary->getSummary()->statistics);
    }

    public function actionDismissMessage()
    {
        $this->requirePostRequest();

        $id = \Craft::$app->request->post('id');

        if (Freeform::getInstance()->feed->markFeedMessageAsRead($id)) {
            return $this->asJson(['success' => true]);
        }

        return $this->asJson(['success' => false]);
    }

    public function actionDismissType()
    {
        $this->requirePostRequest();

        $type = \Craft::$app->request->post('type');

        Freeform::getInstance()->feed->markFeedCategoryAsRead($type);

        return $this->asJson(['success' => true]);
    }
}
