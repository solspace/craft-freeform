<?php

namespace Solspace\Freeform\Records\AbTests;

use craft\db\ActiveRecord;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use yii\db\ActiveQuery;

/**
 * @property int          $id
 * @property int          $abTestId
 * @property int          $formId
 * @property int          $weight
 * @property AbTestRecord $abTest
 */
class AbTestVariantRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_ab_tests_variants}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function getForm(): ?Form
    {
        if ($this->formId) {
            return Freeform::getInstance()->forms->getFormById($this->formId);
        }

        return null;
    }

    public function getAbTest(): ActiveQuery
    {
        return $this->hasOne(AbTestRecord::class, ['id' => 'abTestId']);
    }
}
