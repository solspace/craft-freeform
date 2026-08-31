<?php

namespace Solspace\Freeform\Tests\Services\Headless;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;

/**
 * Live HTTP checks against a running Craft site (DDEV).
 *
 * Skip by default in CI unless FREEFORM_HEADLESS_BASE_URL is set.
 *
 * Example:
 *   FREEFORM_HEADLESS_BASE_URL=https://site.ddev.site composer test:unit -- --group headless-http
 */
#[Group('headless-http')]
#[CoversNothing]
class HeadlessHttpIntegrationTest extends TestCase
{
    private string $baseUrl;
    private string $cookieJar;

    protected function setUp(): void
    {
        $this->baseUrl = rtrim((string) (getenv('FREEFORM_HEADLESS_BASE_URL') ?: ''), '/');
        if ('' === $this->baseUrl) {
            self::markTestSkipped('Set FREEFORM_HEADLESS_BASE_URL to run live headless HTTP tests.');
        }

        $this->cookieJar = tempnam(sys_get_temp_dir(), 'ff-http-cookies');
    }

    protected function tearDown(): void
    {
        if (isset($this->cookieJar) && is_file($this->cookieJar)) {
            unlink($this->cookieJar);
        }
    }

    public function testManifestReturnsSuccessEnvelopeForSimpleForm(): void
    {
        [$status, $body] = $this->request('GET', '/freeform/api/forms/simpleForm/manifest');

        self::assertSame(200, $status);
        self::assertTrue($body['success'] ?? false);
        self::assertSame('1.0', $body['data']['schemaVersion'] ?? null);
        self::assertSame('simpleForm', $body['data']['form']['handle'] ?? null);
        self::assertArrayHasKey('fields', $body['data']);
        self::assertArrayHasKey('security', $body['data']);
        self::assertArrayHasKey('endpoints', $body['data']);
        self::assertArrayHasKey('conditionals', $body['data']);
    }

    public function testUnknownFormManifestReturnsNotFound(): void
    {
        [$status] = $this->request('GET', '/freeform/api/forms/doesNotExistForm999/manifest');

        self::assertContains($status, [403, 404]);
    }

    public function testJsonSubmitSucceedsWithCsrfCookieJar(): void
    {
        [, $manifest] = $this->request('GET', '/freeform/api/forms/simpleForm/manifest');
        $security = $manifest['data']['security'] ?? [];

        [, $tokens] = $this->request('GET', '/freeform/tokens');
        $csrf = $tokens['csrf']['value'] ?? null;
        self::assertNotEmpty($csrf);

        $meta = [];
        if (isset($security['honeypot']['name'])) {
            $meta['honeypot'] = ['name' => $security['honeypot']['name'], 'value' => ''];
        }
        if (isset($security['javascriptTest']['name'])) {
            $meta['javascriptTest'] = [
                'name' => $security['javascriptTest']['name'],
                'value' => $security['javascriptTest']['value'] ?? '',
            ];
        }

        [$status, $body] = $this->request(
            'POST',
            '/freeform/api/forms/simpleForm/submit',
            [
                'Content-Type: application/json',
                'X-CSRF-Token: '.$csrf,
            ],
            json_encode([
                'intent' => 'submit',
                'values' => [
                    'name' => 'HTTP Integration',
                    'email' => 'http-integration@example.com',
                    'feedback' => 'Phase 2.9 HTTP test',
                ],
                'meta' => $meta,
            ], \JSON_THROW_ON_ERROR)
        );

        self::assertSame(200, $status);
        self::assertTrue($body['success'] ?? false);
        self::assertSame('submitted', $body['status'] ?? null);
        self::assertTrue($body['complete'] ?? false);
    }

    public function testSubmitWithoutCsrfFails(): void
    {
        [$status, $body] = $this->request(
            'POST',
            '/freeform/api/forms/simpleForm/submit',
            ['Content-Type: application/json'],
            json_encode([
                'intent' => 'submit',
                'values' => [
                    'name' => 'No CSRF',
                    'email' => 'nocsrf@example.com',
                    'feedback' => 'should fail',
                ],
            ], \JSON_THROW_ON_ERROR)
        );

        self::assertSame(400, $status);
        self::assertStringContainsStringIgnoringCase('csrf', (string) ($body['message'] ?? json_encode($body)));
    }

    public function testSaveDraftIntentReturnsDraftSavedOrValidationFailed(): void
    {
        [, $manifest] = $this->request('GET', '/freeform/api/forms/simpleForm/manifest');
        $security = $manifest['data']['security'] ?? [];
        [, $tokens] = $this->request('GET', '/freeform/tokens');
        $csrf = $tokens['csrf']['value'] ?? '';

        $meta = [];
        if (isset($security['honeypot']['name'])) {
            $meta['honeypot'] = ['name' => $security['honeypot']['name'], 'value' => ''];
        }

        [$status, $body] = $this->request(
            'POST',
            '/freeform/api/forms/simpleForm/submit',
            [
                'Content-Type: application/json',
                'X-CSRF-Token: '.$csrf,
            ],
            json_encode([
                'intent' => 'saveDraft',
                'values' => ['name' => 'Draft'],
                'meta' => $meta,
            ], \JSON_THROW_ON_ERROR)
        );

        self::assertContains($status, [200, 422]);
        self::assertContains($body['status'] ?? null, ['draft_saved', 'validation_failed']);
        if ('draft_saved' === ($body['status'] ?? null)) {
            self::assertTrue($body['success'] ?? false);
            self::assertIsArray($body['draft'] ?? null);
            self::assertNotEmpty($body['draft']['token'] ?? null);
            self::assertNotEmpty($body['draft']['key'] ?? null);
        }
    }

    /**
     * @param string[] $headers
     *
     * @return array{0: int, 1: array<string, mixed>}
     */
    private function request(string $method, string $path, array $headers = [], ?string $body = null): array
    {
        $ch = curl_init($this->baseUrl.$path);
        $opts = [
            \CURLOPT_CUSTOMREQUEST => $method,
            \CURLOPT_RETURNTRANSFER => true,
            \CURLOPT_COOKIEJAR => $this->cookieJar,
            \CURLOPT_COOKIEFILE => $this->cookieJar,
            \CURLOPT_HTTPHEADER => array_merge(['Accept: application/json'], $headers),
            \CURLOPT_SSL_VERIFYPEER => false,
            \CURLOPT_SSL_VERIFYHOST => false,
            \CURLOPT_HEADER => true,
        ];

        if (null !== $body) {
            $opts[\CURLOPT_POSTFIELDS] = $body;
        }

        curl_setopt_array($ch, $opts);
        $raw = curl_exec($ch);
        if (false === $raw) {
            self::fail('cURL error: '.curl_error($ch));
        }

        $status = (int) curl_getinfo($ch, \CURLINFO_HTTP_CODE);
        $headerSize = (int) curl_getinfo($ch, \CURLINFO_HEADER_SIZE);
        curl_close($ch);

        $responseBody = substr($raw, $headerSize);
        $decoded = json_decode($responseBody, true);

        return [$status, \is_array($decoded) ? $decoded : ['raw' => $responseBody]];
    }
}
