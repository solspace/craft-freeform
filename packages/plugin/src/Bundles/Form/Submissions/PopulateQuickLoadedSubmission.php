<?php

namespace Solspace\Freeform\Bundles\Form\Submissions;

use Solspace\Freeform\Form\Form;
use yii\base\Event;

class PopulateQuickLoadedSubmission extends PopulateSubmission
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_QUICK_LOAD,
            [$this, 'populateSubmissionValues']
        );
    }

    public static function getPriority(): int
    {
        return 1500;
    }
}
