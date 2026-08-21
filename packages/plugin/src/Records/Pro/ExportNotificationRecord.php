<?php

namespace Solspace\Freeform\Records\Pro;

use craft\db\ActiveRecord;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\CronExpressionHelper;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Models\Pro\ExportProfileModel;

/**
 * @property int    $id
 * @property int    $profileId
 * @property bool   $enabled
 * @property string $name
 * @property string $fileType
 * @property string $fileName
 * @property string $frequency
 * @property string $cronExpression
 * @property string $recipients
 * @property string $subject
 * @property string $message
 */
class ExportNotificationRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_export_notifications}}';

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
        return JsonHelper::decode($this->recipients) ?? [];
    }

    public function safeAttributes(): array
    {
        return [
            'profileId',
            'enabled',
            'name',
            'fileType',
            'fileName',
            'frequency',
            'cronExpression',
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
            [['cronExpression'], 'validateCronExpression', 'skipOnEmpty' => false],
        ];
    }

    public function validateCronExpression(string $attribute): void
    {
        if ('custom' !== $this->frequency) {
            return;
        }

        $expression = trim((string) $this->getAttribute($attribute));
        if ('' === $expression) {
            $this->addError($attribute, Freeform::t('A cron expression is required for a custom schedule.'));

            return;
        }

        if (!CronExpressionHelper::isValid($expression)) {
            $this->addError($attribute, Freeform::t('Enter a valid five-part cron expression.'));
        }
    }
}
