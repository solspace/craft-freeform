<?php

namespace Solspace\Freeform\Tests\Integrations\Captchas;

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
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Captchas\CaptchaVerifier;
use Solspace\Freeform\Integrations\Captchas\FriendlyCaptcha\FriendlyCaptcha;
use Solspace\Freeform\Integrations\Captchas\hCaptcha\hCaptcha;
use Solspace\Freeform\Integrations\Captchas\Turnstile\Turnstile;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Services\SettingsService;

#[CoversClass(CaptchaVerifier::class)]
#[CoversClass(hCaptcha::class)]
#[CoversClass(Turnstile::class)]
#[CoversClass(FriendlyCaptcha::class)]
class CaptchaVerifierTest extends TestCase
{
    private array $history = [];

    #[DataProvider('providers')]
    public function testDefaultsAndProviderBoundRequests(string $provider, string $class, string $secret): void
    {
        $integration = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($class, 'siteKey'))->setValue($integration, " site-key\n");
        (new \ReflectionProperty($class, $secret))->setValue($integration, ' server-key ');
        self::assertSame('site-key', $integration->getSiteKey());
        $getter = 'get'.ucfirst($secret);
        self::assertSame('server-key', $integration->{$getter}());
        self::assertSame('display-error', $integration->getFailureBehavior());
        $result = (new CaptchaVerifier($this->client(['success' => true])))->verify($provider, 'site-key', 'server-key', 'private-token', '192.0.2.1');
        self::assertSame([], $result->errors);
        $request = $this->history[0]['request'];
        self::assertSame(3, $this->history[0]['options']['connect_timeout']);
        self::assertSame(10, $this->history[0]['options']['timeout']);
        self::assertFalse($this->history[0]['options']['allow_redirects']);
        if ('friendly-captcha' === $provider) {
            self::assertSame('global.frcapi.com', $request->getUri()->getHost());
            self::assertSame('server-key', $request->getHeaderLine('X-API-Key'));
            self::assertSame(['response' => 'private-token', 'sitekey' => 'site-key'], json_decode((string) $request->getBody(), true));
        } else {
            self::assertSame('hcaptcha' === $provider ? 'api.hcaptcha.com' : 'challenges.cloudflare.com', $request->getUri()->getHost());
            parse_str((string) $request->getBody(), $body);
            self::assertSame('server-key', $body['secret']);
            self::assertSame('private-token', $body['response']);
            self::assertSame('192.0.2.1', $body['remoteip']);
            if ('hcaptcha' === $provider) {
                self::assertSame('site-key', $body['sitekey']);
            }
        }
    }

    #[DataProvider('responses')]
    public function testInvalidTokensAndServiceErrorsStaySeparate(string $provider, mixed $response, bool $accepted, bool $serviceError): void
    {
        $result = (new CaptchaVerifier($this->client($response)))->verify($provider, 'site-key', 'server-key', 'private-token');
        self::assertSame($accepted, [] === $result->errors);
        self::assertSame($serviceError, $result->serviceError);
        self::assertStringNotContainsString('private', implode(' ', $result->errors));
    }

    public static function responses(): iterable
    {
        foreach (['hcaptcha', 'turnstile', 'friendly-captcha'] as $provider) {
            yield $provider.' success' => [$provider, ['success' => true], true, false];

            yield $provider.' string success' => [$provider, ['success' => 'true'], false, true];

            yield $provider.' missing result' => [$provider, [], false, true];

            yield $provider.' malformed JSON' => [$provider, new Response(200, [], 'private-token private-key'), false, true];

            yield $provider.' timeout' => [$provider, new ConnectException('private-token private-key', new Request('POST', 'https://example.test')), false, true];
            foreach ([302, 400, 401, 403, 429, 500] as $status) {
                yield $provider.' HTTP '.$status => [$provider, new Response($status, [], 'private-token private-key'), false, true];
            }
            if ('friendly-captcha' === $provider) {
                yield 'Friendly conflicting result' => [$provider, ['success' => true, 'error' => ['error_code' => 'response_invalid']], false, true];
                foreach (['response_invalid', 'response_timeout', 'response_duplicate', 'response_missing'] as $code) {
                    yield $code => [$provider, ['success' => false, 'error' => ['error_code' => $code]], false, false];
                }

                yield 'Friendly bad credentials' => [$provider, ['success' => false, 'error' => ['error_code' => 'auth_invalid']], false, true];

                yield 'Friendly unknown error' => [$provider, ['success' => false, 'error' => ['detail' => 'private-key']], false, true];
            } else {
                yield $provider.' conflicting result' => [$provider, ['success' => true, 'error-codes' => ['invalid-input-response']], false, true];

                yield $provider.' rejected token' => [$provider, ['success' => false, 'error-codes' => ['timeout-or-duplicate']], false, false];

                yield $provider.' rejected without code' => [$provider, ['success' => false], false, false];

                yield $provider.' malformed errors' => [$provider, ['success' => true, 'error-codes' => 'private-key'], false, true];

                yield $provider.' nested errors' => [$provider, ['success' => false, 'error-codes' => [['invalid-input-response']]], false, true];

                yield $provider.' key mismatch' => [$provider, ['success' => false, 'error-codes' => ['sitekey-secret-mismatch']], false, true];
            }
        }
    }

    public function testFriendlyRiskIntelligenceRemainsAvailable(): void
    {
        $data = ['success' => true, 'data' => ['risk_intelligence' => ['risk_scores' => ['overall' => 2, 'network' => 1]]]];
        $result = (new CaptchaVerifier($this->client($data)))->verify('friendly-captcha', 'site', 'key', 'token');
        self::assertSame($data, $result->data);
        self::assertSame('Overall 2/5, Network 1/5', FriendlyCaptcha::formatRiskScores($result->data['data']['risk_intelligence']['risk_scores']));
    }

    #[DataProvider('providers')]
    public function testServiceFailuresShowErrorsEvenWhenSpamIsSelected(string $provider, string $class, string $secret): void
    {
        $this->validate($class, $secret, new Response(503), true);
    }

    #[DataProvider('providers')]
    public function testRejectedTokensKeepTheSavedSpamBehavior(string $provider, string $class, string $secret): void
    {
        $response = 'friendly-captcha' === $provider ? ['success' => false, 'error' => ['error_code' => 'response_invalid']] : ['success' => false];
        $this->validate($class, $secret, $response, false);
    }

    public static function providers(): iterable
    {
        yield 'hCaptcha' => ['hcaptcha', hCaptcha::class, 'secretKey'];

        yield 'Turnstile' => ['turnstile', Turnstile::class, 'secretKey'];

        yield 'Friendly Captcha' => ['friendly-captcha', FriendlyCaptcha::class, 'apiKey'];
    }

    public function testFriendlyWidgetStatusIsNotTreatedAsSpam(): void
    {
        $this->validate(FriendlyCaptcha::class, 'apiKey', ['success' => false], true, '.UNCONNECTED');
        self::assertSame([], $this->history);
    }

    private function validate(string $class, string $secret, mixed $response, bool $serviceError, string $token = 'token'): void
    {
        $oldCraft = \Craft::$app;
        $oldYii = \Yii::$app;
        $settings = $this->createMock(SettingsService::class);
        $settings->method('isBypassSpamCheckOnLoggedInUsers')->willReturn(false);
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->willReturn($settings);
        $request = new class($token) {
            public function __construct(private string $token) {}

            public function post($name)
            {
                return $this->token;
            }

            public function getUserIP()
            {
                return '192.0.2.1';
            }
        };
        \Craft::$app = \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin], 'request' => $request];

        try {
            $integration = $this->getMockBuilder($class)->disableOriginalConstructor()->onlyMethods(['createClient'])->getMock();
            $integration->method('createClient')->willReturn($this->client($response));
            foreach (['siteKey' => 'site', $secret => 'key', 'failureBehavior' => 'send-to-spam'] as $key => $value) {
                (new \ReflectionProperty($class, $key))->setValue($integration, $value);
            }
            (new \ReflectionProperty(BaseIntegration::class, 'logger'))->setValue($integration, new NullLogger());
            $form = $this->createMock(Form::class);
            $form->method('isCaptchaEnabled')->willReturn(true);
            $form->method('getHandle')->willReturn('qa');
            $form->expects($serviceError ? self::once() : self::never())->method('addError');
            $form->expects($serviceError ? self::never() : self::once())->method('markAsSpam');
            $integration->validate($form);
        } finally {
            \Craft::$app = $oldCraft;
            \Yii::$app = $oldYii;
        }
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
