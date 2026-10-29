<?php

namespace Solspace\Freeform\Integrations\Captchas\ReCaptcha;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;

class ReCaptchaVerifier
{
    public function __construct(private ClientInterface $client) {}

    public function verify(ReCaptcha $integration, string $token, ?string $ip = null, string $userAgent = ''): ReCaptchaVerificationResult
    {
        $enterprise = ReCaptcha::MODE_ENTERPRISE === $integration->getVerificationMode();
        if (!\in_array($integration->getVerificationMode(), [ReCaptcha::MODE_LEGACY, ReCaptcha::MODE_ENTERPRISE], true)
            || !\in_array($integration->getVersion(), [ReCaptcha::VERSION_V3, ReCaptcha::VERSION_V2_CHECKBOX, ReCaptcha::VERSION_V2_INVISIBLE], true)
            || !\in_array($integration->getScriptDomain(), ['google.com', 'recaptcha.net'], true)
            || !$integration->getSiteKey()
        ) {
            return $this->serviceError('The reCAPTCHA configuration is invalid.');
        }
        if ($enterprise && (ReCaptcha::VERSION_V2_INVISIBLE === $integration->getVersion()
            || !preg_match('/^[a-zA-Z0-9][a-zA-Z0-9.:-]*$/D', $integration->getProjectId()) || !$integration->getApiKey())) {
            return $this->serviceError('Enterprise requires a project ID, server API key, and a Checkbox or Score Based site key.');
        }
        if (!$enterprise && !$integration->getSecretKey()) {
            return $this->serviceError('The reCAPTCHA legacy secret key is missing.');
        }

        $options = ['http_errors' => false, 'allow_redirects' => false, 'connect_timeout' => 3, 'timeout' => 10];
        if ($enterprise) {
            $url = 'https://recaptchaenterprise.googleapis.com/v1/projects/'.rawurlencode($integration->getProjectId()).'/assessments';
            $event = ['token' => $token, 'siteKey' => $integration->getSiteKey()];
            if ($ip) {
                $event['userIpAddress'] = $ip;
            }
            if ('' !== $userAgent) {
                $event['userAgent'] = $userAgent;
            }
            if (ReCaptcha::VERSION_V3 === $integration->getVersion()) {
                $event['expectedAction'] = $integration->getAction();
            }
            $options['headers'] = ['X-Goog-Api-Key' => $integration->getApiKey()];
            $options['json'] = ['event' => $event];
        } else {
            $url = 'https://www.'.$integration->getScriptDomain().'/recaptcha/api/siteverify';
            $options['form_params'] = ['secret' => $integration->getSecretKey(), 'response' => $token];
            if ($ip) {
                $options['form_params']['remoteip'] = $ip;
            }
        }

        try {
            $response = $this->client->request('POST', $url, $options);
            $status = $response->getStatusCode();
            if (200 !== $status) {
                $message = match ($status) {
                    400 => 'Google rejected the reCAPTCHA configuration or assessment request.',
                    401, 403 => 'Google denied reCAPTCHA access. Check the API key restrictions, project permissions, and enabled API.',
                    429 => 'The reCAPTCHA quota was exceeded. Check Google Cloud usage and billing.',
                    default => 'The reCAPTCHA verification service is unavailable.',
                };

                return $this->serviceError($message);
            }
            $result = json_decode((string) $response->getBody(), true, 512, \JSON_THROW_ON_ERROR);
        } catch (GuzzleException|\JsonException) {
            // Never log exception bodies/requests: they can contain keys or tokens.
            return $this->serviceError('The reCAPTCHA verification service could not be reached or returned an invalid response.');
        }

        if (!\is_array($result)) {
            return $this->serviceError('The reCAPTCHA verification service returned an invalid response.');
        }

        return $enterprise ? $this->assessEnterprise($integration, $result) : $this->assessLegacy($integration, $result);
    }

    private function assessLegacy(ReCaptcha $integration, array $result): ReCaptchaVerificationResult
    {
        $codes = $result['error-codes'] ?? [];
        if (!\is_array($codes) || \count(array_filter($codes, 'is_string')) !== \count($codes) || !\is_bool($result['success'] ?? null)) {
            return $this->serviceError('Google returned an incomplete reCAPTCHA verification response.');
        }
        // Migrated keys can return success=true and a fixed score when billing
        // is absent. Do not mistake that quota fallback for a genuine assessment.
        foreach (array_merge($codes, [$result['error'] ?? '', $result['error-message'] ?? '']) as $code) {
            if (\is_string($code) && str_contains(strtolower($code), 'quota')) {
                return $this->serviceError('The reCAPTCHA quota was exceeded. Check Google Cloud usage and billing.');
            }
        }
        if (!$result['success']) {
            if (array_intersect($codes, ['missing-input-secret', 'invalid-input-secret', 'invalid-keys', 'bad-request', 'internal-error'])) {
                return $this->serviceError('Google rejected reCAPTCHA verification. Check the site key and legacy secret key configuration.');
            }

            return new ReCaptchaVerificationResult(['The reCAPTCHA response token is invalid, expired, or already used.']);
        }

        return $this->checkToken($integration, $result['hostname'] ?? null, $result['action'] ?? null, $result['score'] ?? null);
    }

    private function assessEnterprise(ReCaptcha $integration, array $result): ReCaptchaVerificationResult
    {
        $properties = $result['tokenProperties'] ?? null;
        if (!\is_array($properties) || !\is_bool($properties['valid'] ?? null) || isset($result['error'])) {
            return $this->serviceError('Google returned an incomplete reCAPTCHA assessment.');
        }
        if (!$properties['valid']) {
            return new ReCaptchaVerificationResult(['The reCAPTCHA response token is invalid, expired, or already used.']);
        }

        return $this->checkToken($integration, $properties['hostname'] ?? null, $properties['action'] ?? null, $result['riskAnalysis']['score'] ?? null);
    }

    private function checkToken(ReCaptcha $integration, mixed $hostname, mixed $action, mixed $score): ReCaptchaVerificationResult
    {
        $hostnames = $integration->getAllowedHostnames();
        if ($hostnames && (!\is_string($hostname) || !\in_array(strtolower(rtrim($hostname, '.')), $hostnames, true))) {
            return new ReCaptchaVerificationResult(['The reCAPTCHA token was generated for an unexpected hostname.']);
        }
        if (ReCaptcha::VERSION_V3 === $integration->getVersion()) {
            if (!\is_string($action) || $action !== $integration->getAction()) {
                return new ReCaptchaVerificationResult(['The reCAPTCHA token action does not match the expected form action.']);
            }
            if ((!\is_int($score) && !\is_float($score)) || !is_finite((float) $score) || $score < 0 || $score > 1) {
                return $this->serviceError('Google did not return a valid reCAPTCHA score. Check that the configured key is score-based.');
            }
            $threshold = max(0, min(1, (float) $integration->getScoreThreshold()));
            if ($score < $threshold) {
                return new ReCaptchaVerificationResult(['The reCAPTCHA score is below the configured threshold.']);
            }
        }

        return new ReCaptchaVerificationResult();
    }

    private function serviceError(string $message): ReCaptchaVerificationResult
    {
        return new ReCaptchaVerificationResult([$message], true);
    }
}
