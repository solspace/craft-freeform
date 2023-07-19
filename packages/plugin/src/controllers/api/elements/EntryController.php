<?php

namespace Solspace\Freeform\controllers\api\elements;

use Solspace\Freeform\controllers\BaseApiController;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class EntryController extends BaseApiController
{
    public function actionAttributes(): Response
    {
        return $this->asJson([
            ['id' => 'title', 'label' => 'Title', 'required' => false],
            ['id' => 'siteId', 'label' => 'Site ID', 'required' => false],
            ['id' => 'slug', 'label' => 'Slug', 'required' => false],
            ['id' => 'authorId', 'label' => 'Author ID', 'required' => false],
            ['id' => 'postDate', 'label' => 'Post Date', 'required' => false],
            ['id' => 'expiryDate', 'label' => 'Expiry Date', 'required' => false],
            ['id' => 'enabled', 'label' => 'Enabled', 'required' => false],
            ['id' => 'dateCreated', 'label' => 'Date Created', 'required' => false],
            ['id' => 'dateUpdated', 'label' => 'Date Updated', 'required' => false],
        ]);
    }

    public function actionFields(): Response
    {
        $entryTypeId = $this->request->get('entryTypeId');
        if (!$entryTypeId) {
            return $this->asJson([]);
        }

        $entryType = \Craft::$app->sections->getEntryTypeById($entryTypeId);
        if (!$entryType) {
            throw new NotFoundHttpException('Entry type not found');
        }

        $layout = $entryType->getFieldLayout();

        $fields = [];
        foreach ($layout->getCustomFields() as $item) {
            $fields[] = [
                'id' => $item->id,
                'label' => $item->name,
                'required' => $item->required,
            ];
        }

        return $this->asJson($fields);
    }
}
