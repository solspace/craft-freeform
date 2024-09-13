<?php

namespace Solspace\Freeform\Bundles\Digest;

use Carbon\Carbon;
use craft\helpers\Queue;
use craft\web\Application;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Jobs\SendDigestJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\FeedRecord;
use Solspace\Freeform\Services\Pro\DigestService;
use yii\base\Event;

class DigestBundle extends FeatureBundle
{
    public function __construct()
    {
        if (!$this->plugin()->isInstalled || \Craft::$app->request->getIsConsoleRequest()) {
            return;
        }

        Event::on(
            Application::class,
            Application::EVENT_INIT,
            [$this, 'triggerDigest']
        );
    }

    public function triggerDigest(): void
    {
        if (!\Craft::$app->db->tableExists(FeedRecord::TABLE)) {
            return;
        }

        if (Freeform::isLocked(DigestService::CACHE_KEY_DIGEST, DigestService::CACHE_TTL_DIGEST)) {
            return;
        }

        $settings = $this->plugin()->settings;

        $devRecipients = $settings->getDigestRecipients();
        $clientRecipients = $settings->getClientDigestRecipients();

        if (!$devRecipients->count() && !$clientRecipients->count()) {
            return;
        }

        $job = new SendDigestJob(new Carbon('now'));
        Queue::push($job, $settings->getQueuePriority());
    }
}
