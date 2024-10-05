<?php

namespace Solspace\Freeform\Records\Rules;

use Solspace\Freeform\Records\Form\FormNotificationRecord;
use yii\db\ActiveQuery;

/**
 * @property int       $id
 * @property int       $notificationId
 * @property bool      $send
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class NotificationRuleRecord extends RuleRecord
{
    public const TABLE = '{{%freeform_rules_notifications}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return self[]
     */
    public static function getExistingRules(int $formId): array
    {
        /** @var PageRuleRecord[] $records */
        $records = self::find()
            ->select(['fr.*'])
            ->from(self::TABLE.' fr')
            ->innerJoin(RuleRecord::TABLE.' r', '[[fr.id]] = [[r.id]]')
            ->innerJoin(FormNotificationRecord::TABLE.' fn', '[[fr.notificationId]] = [[fn.id]]')
            ->where(['fn.formId' => $formId])
            ->with('rule', 'conditions', 'notification')
            ->indexBy('id')
            ->all()
        ;

        $indexed = [];
        foreach ($records as $record) {
            $indexed[$record->getRule()->one()->uid] = $record;
        }

        return $indexed;
    }

    public function getRule(): ActiveQuery
    {
        return $this->hasOne(RuleRecord::class, ['id' => 'id']);
    }

    public function getNotification(): ActiveQuery
    {
        return $this->hasOne(FormNotificationRecord::class, ['id' => 'notificationId']);
    }

    public function rules(): array
    {
        return [
            [['notificationId'], 'required'],
        ];
    }

    public function safeAttributes(): array
    {
        return [
            'notificationId',
            'send',
        ];
    }
}
