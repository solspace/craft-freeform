<?php

namespace Solspace\Freeform\Bundles\Persistence\ContentTables;

use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Managers\ContentManager;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FormContentTable extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FormsController::class,
            FormsController::EVENT_UPSERT_FORM,
            [$this, 'createContentTable']
        );
    }

    public static function getPriority(): int
    {
        return 305;
    }

    public function createContentTable(PersistFormEvent $event): void
    {
        $form = $event->getForm();
        if (!$form || !$form->getId()) {
            return;
        }

        $fields = $event->getFieldRecords();

        $contentManager = new ContentManager($form, $fields);
        $contentManager->performDatabaseColumnAlterations();
    }
}
