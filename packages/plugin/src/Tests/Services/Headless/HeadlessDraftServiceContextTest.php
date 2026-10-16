<?php

namespace Solspace\Freeform\Tests\Services\Headless;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\Headless\HeadlessDraftService;

#[CoversClass(HeadlessDraftService::class)]
class HeadlessDraftServiceContextTest extends TestCase
{
    public function testFilterContextKeepsOnlyAllowListedKeys(): void
    {
        $service = new HeadlessDraftService();

        $filtered = $service->filterContext([
            'draftToken' => 'tok',
            'draftKey' => 'key',
            'stateToken' => 'state',
            'sourceUrl' => 'https://example.com',
            'token' => 'signed',
            'disable' => ['captchas' => true],
            'elementId' => 99,
            'submissionId' => 12,
            'savedSession' => ['token' => 'x', 'key' => 'y'],
        ]);

        self::assertSame([
            'draftToken' => 'tok',
            'draftKey' => 'key',
            'stateToken' => 'state',
            'sourceUrl' => 'https://example.com',
            'token' => 'signed',
        ], $filtered);
    }

    public function testNormalizeContextBuildsSavedSessionFromDraftTokens(): void
    {
        $service = new HeadlessDraftService();

        $normalized = $service->normalizeContext(
            $service->filterContext([
                'draftToken' => 'tok',
                'draftKey' => 'key',
                'disable' => ['captchas' => true],
            ])
        );

        self::assertSame('tok', $normalized['savedSession']['token']);
        self::assertSame('key', $normalized['savedSession']['key']);
        self::assertArrayNotHasKey('disable', $normalized);
    }
}
