<?php

namespace Solspace\Freeform\Tests\Services\Headless;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\Headless\Profile\HeadlessProfile;

#[CoversClass(HeadlessProfile::class)]
class HeadlessProfileTest extends TestCase
{
    public function testConfigurationRemainsReadableAndImmutable(): void
    {
        $profile = HeadlessProfile::fromConfig('rating', ['form' => 'productRating', 'requiresAuth' => true, 'allowedOrigins' => ['https://example.test']]);
        self::assertSame('rating', $profile->name);
        self::assertSame('productRating', $profile->formHandle);
        self::assertTrue($profile->requiresAuth);
        self::assertSame(['https://example.test'], $profile->allowedOrigins);
        self::assertTrue(isset($profile->allowSubmit));
        self::assertFalse(isset($profile->contextProviderClass));
        $this->expectException(\Error::class);
        $profile->requiresAuth = false;
    }

    public function testProfilePropertiesCannotBeUnset(): void
    {
        $profile = new HeadlessProfile('rating', 'productRating');
        $this->expectException(\Error::class);
        unset($profile->allowSubmit);
    }
}
