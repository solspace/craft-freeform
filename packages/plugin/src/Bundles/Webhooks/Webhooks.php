<?php

namespace Solspace\Freeform\Bundles\Webhooks;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class Webhooks extends FeatureBundle
{
    public function __construct()
    {
        $webhooks = Freeform::getInstance()->webhooks;

        Event::on(Submission::class, Submission::EVENT_PROCESS_SUBMISSION, [$webhooks, 'triggerWebhooks']);
    }

    public static function isProOnly(): bool
    {
        return true;
    }
}
