<?php

namespace Solspace\Freeform\Records\Pro;

use craft\db\ActiveRecord;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Pro\ExportProfileModel;

/**
 * @property int    $id
 * @property int    $profileId
 * @property string $name
 * @property string $fileType
 * @property string $fileName
 * @property string $frequency
 * @property string $recipients
 * @property string $subject
 * @property string $message
 */
class ExportNotificationRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_export_notifications}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function getProfile(): ExportProfileModel
    {
        return Freeform::getInstance()->exportProfiles->getProfileById($this->profileId);
    }

    public function getRecipientArray(): array
    {
        return json_decode($this->recipients) ?? [];
    }

    public function safeAttributes(): array
    {
        return [
            'profileId',
            'name',
            'fileType',
            'fileName',
            'frequency',
            'recipients',
            'subject',
            'message',
        ];
    }

    public function rules(): array
    {
        return [
            [['name'], 'unique'],
            [['name', 'fileType', 'frequency', 'profileId'], 'required'],
        ];
    }
}
