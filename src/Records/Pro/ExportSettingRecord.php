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

namespace Solspace\Freeform\Records\Pro;

use Solspace\Commons\Records\SerializableActiveRecord;

/**
 * Class Freeform_ExportSettingRecord
 *
 * @property int   $id
 * @property int   $userId
 * @property array $setting
 */
class ExportSettingRecord extends SerializableActiveRecord
{
    const TABLE = '{{%freeform_export_settings}}';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @param int $userId
     *
     * @return $this
     */
    public static function create($userId): ExportSettingRecord
    {
        $record = new self();

        $record->userId  = $userId;
        $record->setting = [];

        return $record;
    }

    /**
     * @inheritDoc
     */
    protected function getSerializableFields(): array
    {
        return [
            'setting',
        ];
    }

    /**
     * @inheritDoc
     */
    public function rules(): array
    {
        return [
            [['userId'], 'required'],
        ];
    }
}
