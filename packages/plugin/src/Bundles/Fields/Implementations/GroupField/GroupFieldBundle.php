<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\GroupField;

use Solspace\Freeform\Bundles\Persistence\LayoutPersistence;
use Solspace\Freeform\Events\Fields\RemoveFieldRecordEvent;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use yii\base\Event;

class GroupFieldBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            LayoutPersistence::class,
            LayoutPersistence::EVENT_REMOVE_FIELD,
            [$this, 'removeField']
        );
    }

    public function removeField(RemoveFieldRecordEvent $event): void
    {
        $record = $event->getRecord();
        if (GroupField::class !== $record->type) {
            return;
        }

        $event->isValid = false;

        $this->removeNestedFields($record);
    }

    private function removeNestedFields(FormFieldRecord $record): void
    {
        if (GroupField::class === $record->type) {
            $metadata = json_decode($record->metadata, true);
            $layoutUid = $metadata['layout'] ?? null;
            if ($layoutUid) {
                $layout = FormLayoutRecord::findOne(['uid' => $layoutUid]);
                if ($layout) {
                    $rows = FormRowRecord::findAll(['layoutId' => $layout->id]);
                    foreach ($rows as $row) {
                        $fields = FormFieldRecord::findAll(['rowId' => $row->id]);
                        foreach ($fields as $field) {
                            $this->removeNestedFields($field);
                        }

                        $row->delete();
                    }

                    $layout->delete();
                }
            }
        }

        $record->delete();
    }
}
