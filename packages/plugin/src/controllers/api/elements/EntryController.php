<?php

namespace Solspace\Freeform\controllers\api\elements;

use Solspace\Freeform\controllers\BaseApiController;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class EntryController extends BaseApiController
{
    public function actionAttributes(): Response
    {
        return $this->asJson([
            'title' => 'Title',
            'siteId' => 'Site ID',
            'slug' => 'Slug',
            'authorId' => 'Author',
            'postDate' => 'Post Date',
            'expiryDate' => 'Expiry Date',
            'enabled' => 'Enabled',
            'dateCreated' => 'Date Created',
            'dateUpdated' => 'Date Updated',
        ]);
    }

    public function actionFields(): Response
    {
        $entryTypeId = $this->request->get('entryTypeId');
        if (!$entryTypeId) {
            throw new BadRequestHttpException('Entry type ID not specified');
        }

        $entryType = \Craft::$app->sections->getEntryTypeById($entryTypeId);
        if (!$entryType) {
            throw new NotFoundHttpException('Entry type not found');
        }

        $layout = $entryType->getFieldLayout();

        $fields = [];
        foreach ($layout->getCustomFields() as $item) {
            $fields[$item->id] = $item->name;
        }

        return $this->asJson($fields);
    }
}
