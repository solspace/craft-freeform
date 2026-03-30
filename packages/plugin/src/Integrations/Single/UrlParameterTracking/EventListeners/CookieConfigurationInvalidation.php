<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\EventListeners;

use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Providers\CookieConfigurationProvider;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class CookieConfigurationInvalidation extends FeatureBundle
{
    public function __construct(
        private CookieConfigurationProvider $cookieConfigurationProvider,
    ) {
        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_AFTER_SAVE,
            [$this, 'invalidate'],
        );

        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_AFTER_DELETE,
            [$this, 'invalidate'],
        );

        Event::on(
            FormsController::class,
            FormsController::EVENT_AFTER_SAVE_FORM,
            [$this, 'invalidate'],
        );
    }

    public function invalidate(): void
    {
        $this->cookieConfigurationProvider->invalidate();
    }
}
