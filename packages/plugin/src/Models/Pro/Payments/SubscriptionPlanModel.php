<?php

namespace Solspace\Freeform\Models\Pro\Payments;

use craft\base\Model;

/**
 * @property string $id
 * @property string $integrationId
 * @property string $resourceId
 * @property string $name
 */
class SubscriptionPlanModel extends Model
{
    public $id;

    /** @var int */
    public $integrationId;

    /** @var string */
    public $resourceId;

    /** @var string */
    public $name;

    /** @var string */
    public $status;

    //TODO: should be some trait for this
    public $dateCreated;
    public $dateUpdated;
    public $uid;

    public function getId()
    {
        return $this->id;
    }

    public function rules(): array
    {
        return [
        ];
    }
}
