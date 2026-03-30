<?php

namespace Solspace\Freeform\Bundles\ABTesting\Endpoints;

use craft\web\Controller;
use Solspace\Freeform\Records\AbTests\AbTestStatisticsRecord;
use yii\web\Response;

class StatisticsTracker extends Controller
{
    private const LOCKED_STATUSES = [
        AbTestStatisticsRecord::STATUS_COMPLETED,
    ];
    protected array|bool|int $allowAnonymous = ['track'];

    public function actionTrack(): Response
    {
        $this->requirePostRequest();

        $sessionId = $this->request->post('sessionId');
        $fieldName = $this->request->post('fieldName');
        $errors = $this->request->post('errors');

        $record = AbTestStatisticsRecord::findOne(['sessionId' => $sessionId]);
        if (!$record || \in_array($record->status, self::LOCKED_STATUSES, true)) {
            return $this->asJson(['status' => 'failed']);
        }

        $record->status = AbTestStatisticsRecord::STATUS_INTERACTED;

        if ($fieldName) {
            $record->lastField = $fieldName;
        }

        if (null !== $errors) {
            $record->lastError = \json_encode($errors);
            $record->status = AbTestStatisticsRecord::STATUS_FAILED;
        }

        $record->save();

        return $this->asJson(['status' => 'ok']);
    }
}
