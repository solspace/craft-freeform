<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
#[CoversNothing]
class Craft6ControllerAutoloadTest extends TestCase
{
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    #[TestWith(['export\ProfilesController'])]
    #[TestWith(['export\NotificationsController'])]
    #[TestWith(['export\QuickExportController'])]
    #[TestWith(['notifications\AbstractNotificationsController'])]
    #[TestWith(['notifications\FilesController'])]
    #[TestWith(['notifications\DatabaseController'])]
    #[TestWith(['notifications\SenderController'])]
    #[TestWith(['migrations\NotificationsController'])]
    public function testControllerLoadsWithoutAnotherPagePreloadingItsBaseClass(string $controller): void
    {
        // PHP's class cache ignores case, so a shared process could mask a
        // PSR-4 path mismatch after another controller loads BaseController.
        self::assertTrue(class_exists('Solspace\Freeform\controllers\\'.$controller));
    }
}
