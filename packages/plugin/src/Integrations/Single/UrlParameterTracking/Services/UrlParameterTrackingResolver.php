<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\Services;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Integrations\UrlParameterTracking\PrepareParametersEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\UrlParameterTracking;
use Solspace\Freeform\Library\Helpers\ArrayHelper;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use yii\base\Event;
use yii\web\Request;

class UrlParameterTrackingResolver
{
    private const COOKIE_NAME = 'freeform_url_parameters';
    private const MAX_COOKIE_SIZE = 3800;

    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {}

    public function requestContainsValues(array $parameterNames): bool
    {
        $request = $this->getRequest();
        $params = $request->getQueryParams();

        $parameterNames = array_map('strtolower', $parameterNames);
        $parameterNames = array_map('trim', $parameterNames);

        return ArrayHelper::some(
            $params,
            static fn ($value, $key) => \in_array(strtolower($key), $parameterNames, true) && \is_scalar($value)
        );
    }

    public function persistCookieValues(array $parameterNames, int $ttlMinutes): void
    {
        $values = $this->prepareRequestCookieValues($parameterNames);
        if (empty($values)) {
            return;
        }

        $encoded = json_encode($values);
        if (!\is_string($encoded) || \strlen($encoded) > self::MAX_COOKIE_SIZE) {
            FreeformLogger::getInstance(FreeformLogger::INTEGRATION)->error(
                'Unable to persist URL parameters to cookie, JSON length exceeded.',
                [
                    'max_cookie_size' => self::MAX_COOKIE_SIZE,
                    'actual_length' => \strlen($encoded),
                    'values' => $values,
                ]
            );

            return;
        }

        $request = \Craft::$app->request;
        $generalConfig = \Craft::$app->getConfig()->getGeneral();

        setcookie(
            self::COOKIE_NAME,
            $encoded,
            [
                'expires' => time() + (max(1, $ttlMinutes) * 60),
                'path' => '/',
                'domain' => $generalConfig->defaultCookieDomain,
                'secure' => $request->getIsSecureConnection(),
                'httponly' => true,
                'samesite' => $generalConfig->sameSiteCookieValue ?? 'Lax',
            ]
        );

        $_COOKIE[self::COOKIE_NAME] = $encoded;
    }

    public function resolveForForm(Form $form): array
    {
        $integration = $this->integrationsProvider->getSingleton($form, UrlParameterTracking::class);
        if (!$integration) {
            return [];
        }

        $trackedParameters = $integration->getCombinedParameters();
        $values = $this->prepareRequestCookieValues($trackedParameters);

        if ($form->isGraphQLPosted()) {
            $arguments = $form->getGraphQLArguments();
            foreach ($arguments['urlParameterTracking'] ?? [] as $parameter) {
                if (isset($parameter['name'])) {
                    $parameterValue = $parameter['value'] ?? null;
                    if ($parameterValue !== null) {
                        $values[$parameter['name']] = htmlspecialchars($parameterValue, \ENT_QUOTES, 'UTF-8');
                    }
                }
            }
        } else {
            // Get clean $_GET/$_POST parameters from the parameters defined here
            foreach ($trackedParameters as $parameter) {
                $value = $_GET[$parameter] ?? $_POST[$parameter] ?? null;
                if ($value !== null) {
                    $values[$parameter] = htmlspecialchars($value, \ENT_QUOTES, 'UTF-8');
                }
            }
        }

        return $this->prepareValues($values, $trackedParameters);
    }

    private function prepareValues(array $values, array $trackedParameters): array
    {
        $event = new PrepareParametersEvent($values, $trackedParameters);

        Event::trigger(
            UrlParameterTracking::class,
            UrlParameterTracking::EVENT_PREPARE_PARAMETERS,
            $event,
        );

        return $this->normalizeValues($event->getValues());
    }

    private function collectRequestValues(array $parameterNames): array
    {
        $request = $this->getRequest();
        $values = [];

        foreach ($parameterNames as $parameterName) {
            $value = $request->getQueryParam($parameterName);
            if (!\is_scalar($value)) {
                continue;
            }

            $values[$parameterName] = (string) $value;
        }

        return $values;
    }

    private function prepareRequestCookieValues(array $trackedParameters): array
    {
        $trackedLookup = array_fill_keys($trackedParameters, true);
        $cookieValues = array_intersect_key($this->readCookieValues(), $trackedLookup);
        $requestValues = $this->collectRequestValues($trackedParameters);

        $values = array_merge($cookieValues, $requestValues);

        return $this->prepareValues($values, $trackedParameters);
    }

    private function readCookieValues(): array
    {
        $cookie = $_COOKIE[self::COOKIE_NAME] ?? null;
        if (!\is_string($cookie) || '' === $cookie) {
            return [];
        }

        $decoded = json_decode($cookie, true);
        if (!\is_array($decoded)) {
            return [];
        }

        return $decoded;
    }

    private function normalizeValues(array $values): array
    {
        $normalized = [];
        foreach ($values as $key => $value) {
            $normalizedKey = trim((string) $key);
            if ('' === $normalizedKey) {
                continue;
            }

            if (\is_bool($value)) {
                $normalized[$normalizedKey] = $value ? '1' : '0';

                continue;
            }

            if (\is_int($value) || \is_float($value) || \is_string($value)) {
                $normalized[$normalizedKey] = (string) $value;

                continue;
            }

            if ($value instanceof \Stringable) {
                $normalized[$normalizedKey] = (string) $value;
            }
        }

        return $normalized;
    }

    private function getRequest(): Request
    {
        return \Craft::$app->request;
    }
}
