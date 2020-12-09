<?php

namespace Solspace\Freeform\Records\Pro;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property string $type
 * @property string $name
 * @property string $webhook
 * @property array  $settings
 */
class WebhookRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_webhooks}}';
    const RELATION_TABLE = '{{%freeform_webhooks_form_relations}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * {@inheritDoc}
     */
    public function rules(): array
    {
        return [
            [['type'], 'required'],
            [['name'], 'required'],
            [['webhook'], 'required'],
        ];
    }
}
