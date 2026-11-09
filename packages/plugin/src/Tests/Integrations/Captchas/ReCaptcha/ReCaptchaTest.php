<?php

namespace Solspace\Freeform\Tests\Integrations\Captchas\ReCaptcha;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\CaptchaResolver;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Captchas\ReCaptcha\ReCaptcha;
use Solspace\Freeform\Integrations\Captchas\ReCaptcha\ReCaptchaVerifier;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Services\SettingsService;

#[CoversClass(ReCaptcha::class)]
#[CoversClass(ReCaptchaVerifier::class)]
class ReCaptchaTest extends TestCase
{
    private array $history = [];

    public function testExistingMetadataRetainsLegacyDefaultsAndRequest(): void
    {
        $integration = $this->integration();
        self::assertSame('legacy', $integration->getVerificationMode());
        self::assertSame('managed', $integration->getFrontendMode());
        $client = $this->client(['success' => true]);
        self::assertSame([], (new ReCaptchaVerifier($client))->verify($integration, 'legacy-token', '192.0.2.1')->errors);
        $request = $this->history[0]['request'];
        self::assertSame('www.google.com', $request->getUri()->getHost());
        self::assertSame('/recaptcha/api/siteverify', $request->getUri()->getPath());
        parse_str((string) $request->getBody(), $body);
        self::assertSame(['secret' => 'legacy-secret', 'response' => 'legacy-token', 'remoteip' => '192.0.2.1'], $body);
        self::assertSame(10, $this->history[0]['options']['timeout']);
        self::assertSame(3, $this->history[0]['options']['connect_timeout']);
        self::assertFalse($this->history[0]['options']['allow_redirects']);
    }

    public function testEnterpriseUsesAssessmentsAndKeepsCredentialsOnTheServer(): void
    {
        $integration = $this->integration(['verificationMode' => 'enterprise', 'version' => 'v3', 'projectId' => 'my-project', 'apiKey' => 'server-api-key', 'secretKey' => null]);
        $integration->onBeforeSave();
        $result = (new ReCaptchaVerifier($this->client($this->assessment())))->verify($integration, 'enterprise-token', '192.0.2.1', 'QA browser');
        self::assertSame([], $result->errors);
        $request = $this->history[0]['request'];
        self::assertSame('recaptchaenterprise.googleapis.com', $request->getUri()->getHost());
        self::assertSame('/v1/projects/my-project/assessments', $request->getUri()->getPath());
        self::assertSame('', $request->getUri()->getQuery());
        self::assertSame('server-api-key', $request->getHeaderLine('X-Goog-Api-Key'));
        self::assertSame(['event' => ['token' => 'enterprise-token', 'siteKey' => 'public-site-key', 'userIpAddress' => '192.0.2.1', 'userAgent' => 'QA browser', 'expectedAction' => 'submit']], json_decode((string) $request->getBody(), true));
        $manifest = CaptchaResolver::getArguments($integration);
        self::assertSame('enterprise', $manifest['verificationMode']);
        self::assertSame('managed', $manifest['frontendMode']);
        self::assertStringNotContainsString('server-api-key', json_encode($manifest));
        self::assertArrayNotHasKey('apiKey', $manifest);
        self::assertArrayNotHasKey('secretKey', $manifest);
        self::assertArrayNotHasKey('projectId', $manifest);
    }

    public function testEnterpriseCheckboxDoesNotRequireAnActionOrScore(): void
    {
        $integration = $this->integration(['verificationMode' => 'enterprise', 'projectId' => 'my-project', 'apiKey' => 'key']);
        $result = (new ReCaptchaVerifier($this->client(['tokenProperties' => ['valid' => true, 'hostname' => 'example.test']])))->verify($integration, 'token');
        self::assertSame([], $result->errors);
        $body = json_decode((string) $this->history[0]['request']->getBody(), true);
        self::assertArrayNotHasKey('expectedAction', $body['event']);
    }

    public function testPastedCredentialsAreTrimmed(): void
    {
        $integration = $this->integration(['siteKey' => ' public-site-key ', 'secretKey' => " legacy-secret\n", 'projectId' => ' my-project ', 'apiKey' => " server-api-key\n"]);
        self::assertSame('public-site-key', $integration->getSiteKey());
        self::assertSame('legacy-secret', $integration->getSecretKey());
        self::assertSame('my-project', $integration->getProjectId());
        self::assertSame('server-api-key', $integration->getApiKey());
    }

    #[DataProvider('legacyResponses')]
    public function testLegacyResponseValidation(array $response, bool $accepted, bool $serviceError): void
    {
        $integration = $this->integration(['version' => 'v3']);
        $result = (new ReCaptchaVerifier($this->client($response)))->verify($integration, 'token');
        self::assertSame($accepted, [] === $result->errors);
        self::assertSame($serviceError, $result->serviceError);
    }

    public static function legacyResponses(): iterable
    {
        yield 'valid v3' => [['success' => true, 'score' => 0.7, 'action' => 'submit'], true, false];

        yield 'threshold inclusive' => [['success' => true, 'score' => 0.5, 'action' => 'submit'], true, false];

        yield 'low score' => [['success' => true, 'score' => 0.2, 'action' => 'submit'], false, false];

        yield 'wrong action' => [['success' => true, 'score' => 0.9, 'action' => 'login'], false, false];

        yield 'missing action' => [['success' => true, 'score' => 0.9], false, false];

        yield 'missing score' => [['success' => true, 'action' => 'submit'], false, true];

        yield 'string score' => [['success' => true, 'score' => '0.9', 'action' => 'submit'], false, true];

        yield 'out of range score' => [['success' => true, 'score' => 2, 'action' => 'submit'], false, true];

        yield 'string success' => [['success' => 'true', 'score' => 0.9, 'action' => 'submit'], false, true];

        yield 'false without reason' => [['success' => false], false, false];

        yield 'false empty reasons' => [['success' => false, 'error-codes' => []], false, false];

        yield 'unknown reason' => [['success' => false, 'error-codes' => ['future-code']], false, false];

        yield 'expired' => [['success' => false, 'error-codes' => ['timeout-or-duplicate']], false, false];

        yield 'wrong secret' => [['success' => false, 'error-codes' => ['invalid-input-secret']], false, true];

        yield 'quota success fallback' => [['success' => true, 'score' => 0.9, 'action' => 'submit', 'error-codes' => ['Over free quota.']], false, true];

        yield 'quota error message' => [['success' => true, 'score' => 0.9, 'action' => 'submit', 'error' => 'Over free quota.'], false, true];

        yield 'missing response fields' => [[], false, true];

        yield 'malformed errors' => [['success' => true, 'error-codes' => 'oops'], false, true];

        yield 'nested malformed errors' => [['success' => true, 'error-codes' => [['oops']]], false, true];
    }

    #[DataProvider('enterpriseResponses')]
    public function testEnterpriseResponseValidation(array $response, bool $serviceError): void
    {
        $integration = $this->integration(['verificationMode' => 'enterprise', 'version' => 'v3', 'projectId' => 'project', 'apiKey' => 'key']);
        $result = (new ReCaptchaVerifier($this->client($response)))->verify($integration, 'token');
        self::assertNotEmpty($result->errors);
        self::assertSame($serviceError, $result->serviceError);
    }

    public static function enterpriseResponses(): iterable
    {
        yield 'invalid token' => [['tokenProperties' => ['valid' => false, 'invalidReason' => 'EXPIRED']], false];

        yield 'missing validity' => [['tokenProperties' => []], true];

        yield 'missing score' => [['tokenProperties' => ['valid' => true, 'action' => 'submit']], true];

        yield 'wrong action' => [['tokenProperties' => ['valid' => true, 'action' => 'login'], 'riskAnalysis' => ['score' => 0.9]], false];

        yield 'low score' => [['tokenProperties' => ['valid' => true, 'action' => 'submit'], 'riskAnalysis' => ['score' => 0.1]], false];
    }

    #[DataProvider('unavailableResponses')]
    public function testServiceFailuresAreHandledWithoutLeakingResponseBodies(mixed $response): void
    {
        $result = (new ReCaptchaVerifier($this->client($response)))->verify($this->integration(), 'private-token');
        self::assertTrue($result->serviceError);
        self::assertNotEmpty($result->errors);
        self::assertStringNotContainsString('private', implode(' ', $result->errors));
    }

    public static function unavailableResponses(): iterable
    {
        foreach ([302, 400, 401, 403, 429, 500] as $status) {
            yield 'HTTP '.$status => [new Response($status, [], '{"message":"private-token private-key"}')];
        }

        yield 'invalid JSON' => [new Response(200, [], 'private-token')];

        yield 'JSON scalar' => [new Response(200, [], 'true')];

        yield 'timeout' => [new ConnectException('private-token', new Request('POST', 'https://example.test'))];
    }

    public function testHostnameAllowlistAndAlternativeDomain(): void
    {
        $integration = $this->integration(['allowedHostnames' => "EXAMPLE.TEST\nheadless.example.test", 'scriptDomain' => 'recaptcha.net']);
        $verifier = new ReCaptchaVerifier($this->client(['success' => true, 'hostname' => 'Example.Test.']));
        self::assertSame([], $verifier->verify($integration, 'token')->errors);
        self::assertSame('www.recaptcha.net', $this->history[0]['request']->getUri()->getHost());
        $result = (new ReCaptchaVerifier($this->client(['success' => true, 'hostname' => 'attacker.test'])))->verify($integration, 'token');
        self::assertNotEmpty($result->errors);
        self::assertFalse($result->serviceError);
    }

    public function testExternalFrontendRetainsVerificationAndDoesNotLoadScripts(): void
    {
        $integration = $this->integration(['frontendMode' => 'external']);
        self::assertSame([], $integration->getScriptPaths());
        self::assertSame('', $integration->getHtmlTag($this->createMock(Form::class)));
        self::assertSame('external', CaptchaResolver::getArguments($integration)['frontendMode']);
        self::assertSame([], (new ReCaptchaVerifier($this->client(['success' => true])))->verify($integration, 'external-token')->errors);
    }

    #[DataProvider('invalidConfigurations')]
    public function testConfigurationValidation(array $values): void
    {
        $this->expectException(IntegrationException::class);
        $this->integration($values)->onBeforeSave();
    }

    public static function invalidConfigurations(): iterable
    {
        yield 'legacy secret required' => [['secretKey' => null]];

        yield 'enterprise project required' => [['verificationMode' => 'enterprise', 'apiKey' => 'key']];

        yield 'enterprise API key required' => [['verificationMode' => 'enterprise', 'projectId' => 'project']];

        yield 'invisible v2 is legacy only' => [['verificationMode' => 'enterprise', 'version' => 'v2-invisible', 'projectId' => 'project', 'apiKey' => 'key']];

        yield 'invalid domain' => [['scriptDomain' => 'attacker.test']];

        yield 'invalid mode' => [['verificationMode' => 'future']];
    }

    public function testServiceErrorsDisplayAnErrorEvenWhenSpamBehaviorIsSelected(): void
    {
        $this->validate(['success' => false, 'error-codes' => ['invalid-input-secret']], true);
    }

    public function testInvalidTokensStillUseConfiguredSpamBehavior(): void
    {
        $this->validate(['success' => false, 'error-codes' => ['timeout-or-duplicate']], false);
    }

    private function validate(array $response, bool $serviceError): void
    {
        $previousCraft = \Craft::$app;
        $previousYii = \Yii::$app;
        $settings = $this->createMock(SettingsService::class);
        $settings->method('isBypassSpamCheckOnLoggedInUsers')->willReturn(false);
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->willReturn($settings);
        $request = new class {
            public function post($name)
            {
                return 'token';
            }

            public function getUserIP()
            {
                return '192.0.2.1';
            }

            public function getUserAgent()
            {
                return 'QA browser';
            }
        };
        \Craft::$app = \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin], 'request' => $request];

        try {
            $integration = $this->getMockBuilder(ReCaptcha::class)->disableOriginalConstructor()->onlyMethods(['createClient'])->getMock();
            $integration->method('createClient')->willReturn($this->client($response));
            $this->configure($integration, ['failureBehavior' => 'send-to-spam']);
            $form = $this->createMock(Form::class);
            $form->method('getHandle')->willReturn('qa');
            $form->method('isCaptchaEnabled')->willReturn(true);
            $form->expects($serviceError ? self::once() : self::never())->method('addError');
            $form->expects($serviceError ? self::never() : self::once())->method('markAsSpam');
            $integration->validate($form);
        } finally {
            \Craft::$app = $previousCraft;
            \Yii::$app = $previousYii;
        }
    }

    private function assessment(): array
    {
        return ['tokenProperties' => ['valid' => true, 'action' => 'submit', 'hostname' => 'example.test'], 'riskAnalysis' => ['score' => 0.9]];
    }

    private function integration(array $values = []): ReCaptcha
    {
        $integration = (new \ReflectionClass(ReCaptcha::class))->newInstanceWithoutConstructor();
        $this->configure($integration, $values);

        return $integration;
    }

    private function configure(ReCaptcha $integration, array $values): void
    {
        foreach (array_merge(['siteKey' => 'public-site-key', 'secretKey' => 'legacy-secret'], $values) as $key => $value) {
            (new \ReflectionProperty(ReCaptcha::class, $key))->setValue($integration, $value);
        }
        (new \ReflectionProperty(BaseIntegration::class, 'logger'))->setValue($integration, new NullLogger());
    }

    private function client(mixed $response): Client
    {
        $this->history = [];
        if (\is_array($response)) {
            $response = new Response(200, [], json_encode($response));
        }
        $stack = HandlerStack::create(new MockHandler([$response]));
        $stack->push(Middleware::history($this->history));

        return new Client(['handler' => $stack]);
    }
}
