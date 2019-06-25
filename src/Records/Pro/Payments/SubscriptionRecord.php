<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Records\Pro\Payments;

use Solspace\Commons\Records\SerializableActiveRecord;
use Solspace\Freeform\Elements\Submission;
use yii\db\ActiveQuery;

/**
 * @property string $id
 * @property string $submissionId
 * @property string $planId
 * @property string $resourceId
 * @property string $planName
 * @property string $amount
 * @property string $currency
 * @property string $interval
 * @property string $intervalCount
 * @property string $last4
 * @property string $status
 * @property string $metadata
 * @property string $errorCode
 * @property string $errorMessage
 */
class SubscriptionRecord extends SerializableActiveRecord
{
    const TABLE = '{{%freeform_payments_subscriptions}}';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return ActiveQuery|Submission
     */
    public function getSubmission(): ActiveQuery
    {
        return $this->hasOne(Submission::TABLE, ['submissionId' => 'id']);
    }

    /**
     * @return ActiveQuery|SubscriptionPlanRecord
     */
    public function getPlan(): ActiveQuery
    {
        return $this->hasOne(SubscriptionPlanRecord::TABLE, ['planId' => 'id']);
    }

    /**
     * @inheritDoc
     */
    protected function getSerializableFields(): array
    {
        return [
            'metadata',
        ];
    }
}
