<?php

namespace Solspace\Freeform\Tests\Services\Headless;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\Headless\Profile\ProfilePropertyExtractor;
use yii\web\BadRequestHttpException;

#[CoversClass(ProfilePropertyExtractor::class)]
class ProfilePropertyExtractorTest extends TestCase
{
    private mixed $previousApp = null;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app ?? null;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    public function testExtractsAndCastsAllowListedProperties(): void
    {
        $this->stubRequest(
            query: ['eventId' => '42', 'slug' => 'spring-sale'],
            body: ['active' => 'true'],
        );

        $extractor = new ProfilePropertyExtractor();
        $result = $extractor->extract([
            'eventId' => ['type' => 'integer', 'required' => true],
            'slug' => ['type' => 'string'],
            'active' => ['type' => 'boolean'],
        ]);

        self::assertSame([
            'eventId' => 42,
            'slug' => 'spring-sale',
            'active' => true,
        ], $result);
    }

    public function testRejectsUnknownProperties(): void
    {
        $this->stubRequest(query: ['eventId' => '1', 'hack' => 'x']);

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Property "hack" is not allowed');

        (new ProfilePropertyExtractor())->extract([
            'eventId' => ['type' => 'integer'],
        ]);
    }

    public function testRequiresMissingRequiredProperty(): void
    {
        $this->stubRequest(query: []);

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Missing required property "eventId"');

        (new ProfilePropertyExtractor())->extract([
            'eventId' => ['type' => 'integer', 'required' => true],
        ]);
    }

    public function testRejectsNonIntegerValues(): void
    {
        $this->stubRequest(query: ['eventId' => 'abc']);

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('must be an integer');

        (new ProfilePropertyExtractor())->extract([
            'eventId' => ['type' => 'integer'],
        ]);
    }

    public function testRejectsUnsupportedTypes(): void
    {
        $this->stubRequest(query: ['meta' => '{}']);

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Unsupported property type');

        (new ProfilePropertyExtractor())->extract([
            'meta' => ['type' => 'json'],
        ]);
    }

    private function stubRequest(array $query = [], array $body = []): void
    {
        $request = new class($query, $body) {
            public function __construct(
                private array $query,
                private array $body,
            ) {}

            public function getQueryParam(string $name, mixed $default = null): mixed
            {
                if ('properties' === $name) {
                    return $this->query;
                }

                return $default;
            }

            public function getBodyParam(string $name, mixed $default = null): mixed
            {
                if ('properties' === $name) {
                    return $this->body;
                }

                return $default;
            }
        };

        \Craft::$app = new class($request) {
            public function __construct(private object $request) {}

            public function getRequest(): object
            {
                return $this->request;
            }
        };
    }
}
