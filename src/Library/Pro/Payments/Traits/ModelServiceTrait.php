<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Pro\Payments\Traits;

use craft\base\Model;
use craft\db\ActiveRecord;

trait ModelServiceTrait
{
    /**
     * Validates the record if record have error passes them down to model, saves record otherwise
     *
     * @param ActiveRecord $record
     * @param Model $model
     * @return bool true if saved false if validation saved
     *
     * @throws \Exception database exceptions if save failed
     */
    protected function validateAndSave(ActiveRecord $record, Model $model): bool
    {
        $isNew = $model->id ? false : true;

        $record->validate();
        $model->addErrors($record->getErrors());

        if ($model->hasErrors()) {
            return false;
        }

        $transaction = \Craft::$app->getDb()->getTransaction() ?? \Craft::$app->getDb()->beginTransaction();
        try {
            $record->save(false);

            if ($isNew) {
                $model->id = $record->id;
            }

            if ($transaction !== null) {
                $transaction->commit();
            }

            return true;
        } catch (\Exception $e) {
            if ($transaction !== null) {
                $transaction->rollBack();
            }

            throw $e;
        }
    }
}
