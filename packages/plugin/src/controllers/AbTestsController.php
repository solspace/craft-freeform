<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Records\AbTests\AbTestRecord;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class AbTestsController extends BaseController
{
    public function actionGetOne(int $id): Response
    {
        return $this->asJson(
            AbTestRecord::find()
                ->where(['id' => $id])
                ->asArray()
                ->one()
        );
    }

    public function actionPost(?int $id = null): Response
    {
        $this->requirePostRequest();
        $post = $this->request->post();

        if ($id) {
            $record = AbTestRecord::findOne(['id' => $id]);
            if (!$record) {
                throw new NotFoundHttpException('A/B Test group not found');
            }
        } else {
            $record = new AbTestRecord();
        }

        $record->name = $post['name'] ?? '';
        $record->description = $post['description'] ?? '';
        $record->save();

        if ($record->hasErrors()) {
            throw new ApiException(400, (new ErrorCollection())->fromRecord('abTest', $record));
        }

        return $this->asJson($record->toArray());
    }

    public function actionList(): Response
    {
        return $this->asJson(
            AbTestRecord::find()
                ->asArray()
                ->all()
        );
    }
}
