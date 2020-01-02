<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Records\Pro\Payments;

use Solspace\Commons\Records\SerializableActiveRecord;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Records\IntegrationRecord;
use yii\db\ActiveQuery;

/**
 * @property string $id
 * @property int    $submissionId
 * @property int    $integrationId
 * @property int    $subscriptionId
 * @property string $resourceId
 * @property float  $amount
 * @property string $currency
 * @property int    $last4
 * @property string $status
 * @property string $metadata
 * @property string $errorCode
 * @property string $errorMessage
 */
class PaymentRecord extends SerializableActiveRecord
{
    const TABLE = '{{%freeform_payments_payments}}';

    const STATUS_SUCCESS  = 'success';
    const STATUS_PAID     = 'paid';
    const STATUS_FAILED   = 'failed';
    const STATUS_ACTIVE   = 'active';
    const STATUS_INACTIVE = 'inactive';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return ActiveQuery|IntegrationRecord
     */
    public function getIntegration(): ActiveQuery
    {
        return $this->hasOne(IntegrationRecord::TABLE, ['integrationId' => 'id']);
    }

    /**
     * @return ActiveQuery|Submission
     */
    public function getSubmission(): ActiveQuery
    {
        return $this->hasOne(Submission::TABLE, ['submissionId' => 'id']);
    }

    /**
     * @return ActiveQuery|SubscriptionRecord
     */
    public function getSubscription(): ActiveQuery
    {
        return $this->hasOne(SubscriptionRecord::TABLE, ['subscriptionId' => 'id']);
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
