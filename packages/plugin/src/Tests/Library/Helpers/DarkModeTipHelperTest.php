<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\DarkModeTipHelper;

/**
 * @coversNothing
 */
class DarkModeTipHelperTest extends TestCase
{
    #[TestWith(['5.8.9', true, false, false, false])]
    #[TestWith(['5.9.0', true, false, false, true])]
    #[TestWith(['5.12.0.1', true, false, false, true])]
    #[TestWith(['6.0.0', true, false, false, false])]
    #[TestWith(['5.12.0', false, false, false, false])]
    #[TestWith(['5.12.0', true, true, false, false])]
    #[TestWith(['5.12.0', true, false, true, false])]
    public function testBannerVisibility(string $version, bool $admin, bool $installed, bool $dismissed, bool $visible): void
    {
        self::assertSame($visible, DarkModeTipHelper::isVisible($version, $admin, $installed, $dismissed));
    }
}
