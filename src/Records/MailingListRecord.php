<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;
use yii\db\ActiveQuery;

/**
 * @property int    $id
 * @property int    $integrationId
 * @property string $resourceId
 * @property string $name
 * @property int    $memberCount
 */
class MailingListRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_mailing_lists}}';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return MailingListRecord
     */
    public static function create(): MailingListRecord
    {
        return new self();
    }

    /**
     * @return ActiveQuery|IntegrationRecord
     */
    public function getIntegration(): ActiveQuery
    {
        return $this->hasOne(IntegrationRecord::class, ['integrationId' => 'id']);
    }
}
