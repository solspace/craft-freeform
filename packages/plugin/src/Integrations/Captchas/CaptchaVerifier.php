<?php

namespace Solspace\Freeform\Integrations\Captchas;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;

/** Keeps provider outages and configuration errors separate from rejected tokens. */
class CaptchaVerifier
{
    public function __construct(private ClientInterface $client) {}

    public function verify(string $provider, string $siteKey, string $secret, string $token, ?string $ip = null): CaptchaVerificationResult
    {
        $url = match ($provider) {
            'hcaptcha' => 'https://api.hcaptcha.com/siteverify',
            'turnstile' => 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            'friendly-captcha' => 'https://global.frcapi.com/api/v2/captcha/siteverify',
            default => null,
        };
        if (!$url || '' === $siteKey || '' === $secret) {
            return $this->serviceError('The captcha credentials are not configured.');
        }
        $options = ['http_errors' => false, 'allow_redirects' => false, 'connect_timeout' => 3, 'timeout' => 10];
        if ('friendly-captcha' === $provider) {
            $options['headers'] = ['X-API-Key' => $secret, 'Accept' => 'application/json'];
            $options['json'] = ['response' => $token, 'sitekey' => $siteKey];
        } else {
            $options['form_params'] = ['secret' => $secret, 'response' => $token];
            if ($ip) {
                $options['form_params']['remoteip'] = $ip;
            }
            if ('hcaptcha' === $provider) {
                $options['form_params']['sitekey'] = $siteKey;
            }
        }

        try {
            $response = $this->client->request('POST', $url, $options);
            if (200 !== $response->getStatusCode()) {
                return $this->serviceError('Captcha verification is unavailable. Check the credentials, provider usage, and service status.');
            }
            $result = json_decode((string) $response->getBody(), true, 512, \JSON_THROW_ON_ERROR);
        } catch (GuzzleException|\JsonException) {
            // Requests, exception messages, and response bodies may contain credentials or tokens.
            return $this->serviceError('The captcha verification service could not be reached or returned an invalid response.');
        }
        if (!\is_array($result) || !\is_bool($result['success'] ?? null)) {
            return $this->serviceError('The captcha verification service returned an incomplete response.');
        }
        if ('friendly-captcha' === $provider) {
            if ($result['success']) {
                if (isset($result['error'])) {
                    return $this->serviceError('The captcha verification service returned conflicting results.');
                }

                return new CaptchaVerificationResult(data: $result);
            }
            $code = $result['error']['error_code'] ?? null;
            if (!\is_string($code) || !\in_array($code, ['response_missing', 'response_invalid', 'response_timeout', 'response_duplicate'], true)) {
                return $this->serviceError('Friendly Captcha verification is unavailable. Check the site key and API key.');
            }
        } else {
            $codes = $result['error-codes'] ?? [];
            if (!\is_array($codes) || \count(array_filter($codes, 'is_string')) !== \count($codes)) {
                return $this->serviceError('The captcha verification service returned invalid error details.');
            }
            if (array_intersect($codes, ['missing-input-secret', 'invalid-input-secret', 'invalid-keys', 'sitekey-secret-mismatch', 'not-using-dummy-passcode', 'bad-request', 'internal-error'])) {
                return $this->serviceError('Captcha verification is unavailable. Check the site key and secret key.');
            }
            if ($result['success']) {
                if ($codes) {
                    return $this->serviceError('The captcha verification service returned conflicting results.');
                }

                return new CaptchaVerificationResult();
            }
        }

        return new CaptchaVerificationResult(['The captcha response is invalid, expired, or already used.']);
    }

    private function serviceError(string $message): CaptchaVerificationResult
    {
        return new CaptchaVerificationResult([$message], true);
    }
}
