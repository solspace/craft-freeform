<?php

namespace Solspace\Freeform\Integrations\Other\Supabase;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Psr\Http\Message\RequestInterface;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Integrations\Other\Supabase\Controllers\SupabaseController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use yii\base\Event;
use yii\web\UrlRule;

class SupabaseBundle extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('supabase', SupabaseController::class);
        Event::on(UrlManager::class, UrlManager::EVENT_REGISTER_CP_URL_RULES, [$this, 'registerRoutes']);
        Event::on(IntegrationClientProvider::class, IntegrationClientProvider::EVENT_GET_CLIENT, [$this, 'configureClient']);
        Event::on(Supabase::class, Supabase::EVENT_PROCESS_VALUE, [$this, 'processValue']);
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public function registerRoutes(RegisterUrlRulesEvent $event): void
    {
        foreach (['tables', 'fields'] as $action) {
            $event->rules[] = new UrlRule([
                'pattern' => 'freeform/api/supabase/'.$action,
                'route' => 'freeform/supabase/'.$action,
                'verb' => ['GET'],
            ]);
        }
    }

    public function configureClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof Supabase) {
            return;
        }
        $event->addConfig([
            'allow_redirects' => false,
            'timeout' => 30,
            'connect_timeout' => 10,
        ]);
        $event->pushToStack(static function (callable $handler) use ($integration) {
            return static function (RequestInterface $request, array $options) use ($handler, $integration) {
                $uri = $request->getUri();
                if ($uri->getScheme().'://'.$uri->getAuthority() !== $integration->getProjectUrl()
                    || !str_starts_with($uri->getPath(), '/rest/v1/')
                ) {
                    throw new IntegrationException('Refusing to send a Supabase API key outside the configured project Data API.');
                }
                $key = $integration->getApiKey();
                $request = $request->withHeader('apikey', $key)
                    ->withHeader('Accept-Profile', $integration->getSchema())
                    ->withHeader('Content-Profile', $integration->getSchema())
                ;
                // Current secret keys are not JWTs and must not be used as bearer tokens.
                if (!str_starts_with($key, 'sb_secret_')) {
                    $request = $request->withHeader('Authorization', 'Bearer '.$key);
                } else {
                    $request = $request->withoutHeader('Authorization');
                }

                return $handler($request, $options);
            };
        }, 'supabase-auth');
    }

    public function processValue(ProcessValueEvent $event): void
    {
        $event->setValue(SupabaseValueConverter::convert($event->getIntegrationField(), $event->getValue(), $event->getFreeformField()));
        // Preserve structured data, signed numbers, zero and false before the shared processor runs.
        $event->handled = true;
    }
}
