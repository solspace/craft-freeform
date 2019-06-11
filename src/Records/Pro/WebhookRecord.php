<?php

namespace Solspace\Freeform\Records\Pro;

use Solspace\Commons\Records\SerializableActiveRecord;

/**
 * @property int    $id
 * @property string $type
 * @property string $name
 * @property string $webhook
 * @property array  $settings
 */
class WebhookRecord extends SerializableActiveRecord
{
    const TABLE          = '{{%freeform_webhooks}}';
    const RELATION_TABLE = '{{%freeform_webhooks_form_relations}}';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return array
     */
    protected function getSerializableFields(): array
    {
        return ['settings'];
    }

    /**
     * @inheritDoc
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
