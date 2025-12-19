<?php

namespace Solspace\Freeform\controllers;

use craft\db\Query;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Records\AbTests\AbTestRecord;
use Solspace\Freeform\Records\AbTests\AbTestStatisticsRecord;
use Solspace\Freeform\Records\AbTests\AbTestVariantRecord;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class AbTestsController extends BaseController
{
    public function actionGetOne(int $id): Response
    {
        return $this->asJson(
            AbTestRecord::find()
                ->with('variants')
                ->where(['id' => $id])
                ->asArray()
                ->one()
        );
    }

    public function actionStatistics(): Response
    {
        $statistics = [];

        $data = (new Query())
            ->select(['abVariantId', 'status', 'COUNT(*) as count'])
            ->from(AbTestStatisticsRecord::TABLE)
            ->groupBy(['abVariantId', 'status'])
            ->all()
        ;

        foreach ($data as $row) {
            $variantId = $row['abVariantId'];
            $count = $row['count'];
            $status = $row['status'];

            if (!isset($statistics[$variantId])) {
                $statistics[$variantId] = [
                    'completed' => 0,
                    'interacted' => 0,
                    'failed' => 0,
                    'served' => 0,
                ];
            }

            $statistics[$variantId][$status] = $count;
        }

        foreach ($statistics as $variantId => $variant) {
            $statistics[$variantId]['served']
                = $variant['served']
                + $variant['completed']
                + $variant['interacted']
                + $variant['failed'];

            $statistics[$variantId]['interacted']
                = $variant['interacted']
                + $variant['completed']
                + $variant['failed'];
        }

        return $this->asJson($statistics);
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

        $errorCollection = new ErrorCollection();

        $record->name = $post['name'] ?? '';
        $record->description = $post['description'] ?? '';
        $record->save();

        $usedIds = [];
        $variants = $post['variants'] ?? [];
        foreach ($variants as $variant) {
            $formId = $variant['formId'] ?? null;
            if (!$formId) {
                continue;
            }

            $variantRecord = AbTestVariantRecord::findOne(['abTestId' => $record->id, 'id' => $variant['id']]);
            if (!$variantRecord) {
                $variantRecord = new AbTestVariantRecord(['abTestId' => $record->id]);
            }

            $variantRecord->formId = $formId;
            $variantRecord->weight = $variant['weight'] ?? 1;
            $variantRecord->save();

            if ($variantRecord->hasErrors()) {
                $errorCollection->fromRecord('abTestVariant-'.($variant['id'] ?? ''), $variantRecord);
            } else {
                $usedIds[] = $variantRecord->id;
            }
        }

        if ($record->hasErrors()) {
            $errorCollection->fromRecord('abTest', $record);
        }

        if ($errorCollection->hasErrors()) {
            throw new ApiException(400, $errorCollection);
        }

        $existingIds = AbTestVariantRecord::find()
            ->select(['id'])
            ->where(['abTestId' => $record->id])
            ->column()
        ;

        $idsToDelete = array_diff($existingIds, $usedIds);
        AbTestVariantRecord::deleteAll(['id' => $idsToDelete]);

        return $this->asJson($record->toArray());
    }

    public function actionList(): Response
    {
        return $this->asJson(
            AbTestRecord::find()
                ->with('variants')
                ->asArray()
                ->all()
        );
    }
}
