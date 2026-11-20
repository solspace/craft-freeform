<?php

namespace Solspace\Freeform\Tests\Commands;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Commands\PurgeController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\FilesService;
use yii\console\ExitCode;
use yii\helpers\Console;

#[CoversClass(PurgeController::class)]
class PurgeControllerTest extends TestCase
{
    public function testUnfinalizedAssetsCannotPurgeAllInNoninteractiveMode(): void
    {
        $controller = $this->createController();
        $controller->interactive = false;
        $controller->expects($this->never())->method('confirm');

        self::assertSame(ExitCode::UNSPECIFIED_ERROR, $controller->actionUnfinalizedAssets());
    }

    public function testDecliningConfirmationCancelsPurge(): void
    {
        $controller = $this->createController();
        $controller->expects($this->once())->method('confirm')
            ->with('Continue?', false)
            ->willReturn(false)
        ;
        $output = [];
        $controller->method('stdout')->willReturnCallback(static function (...$arguments) use (&$output): void {
            $output[] = $arguments;
        });

        $files = $this->createMock(FilesService::class);
        $files->expects($this->once())->method('countUnfinalizedAssets')->willReturn(3452);
        $files->expects($this->never())->method('cleanUpUnfinalizedAssets');

        self::assertSame(ExitCode::UNSPECIFIED_ERROR, $this->runWithFiles($controller, $files));
        self::assertSame([
            ["WARNING: You're about to permanently delete 3,452 unfinalized Freeform uploads across the site.\n", Console::FG_RED, Console::BOLD],
            ["Purge cancelled.\n"],
        ], $output);
    }

    public function testEmptyPurgeSkipsConfirmationAndDeletion(): void
    {
        $controller = $this->createController();
        $controller->expects($this->never())->method('confirm');

        $files = $this->createMock(FilesService::class);
        $files->method('countUnfinalizedAssets')->willReturn(0);
        $files->expects($this->never())->method('cleanUpUnfinalizedAssets');

        self::assertSame(ExitCode::OK, $this->runWithFiles($controller, $files));
    }

    public function testAllAndAgeCannotBeCombined(): void
    {
        $controller = $this->createController();
        $controller->ageInMinutes = 30;
        $controller->expects($this->never())->method('confirm');

        self::assertSame(ExitCode::USAGE, $controller->actionUnfinalizedAssets());
    }

    public function testExplicitFalseStillRequiresAnAge(): void
    {
        $controller = $this->createController();
        $controller->all = 'false';
        $controller->expects($this->never())->method('confirm');

        self::assertSame(ExitCode::USAGE, $controller->actionUnfinalizedAssets());
    }

    public function testConfirmedPurgeExplicitlyDisablesAgeLimit(): void
    {
        $controller = $this->createController();
        $controller->expects($this->once())->method('confirm')->willReturn(true);

        $files = $this->createMock(FilesService::class);
        $files->method('countUnfinalizedAssets')->willReturn(2);
        $files->expects($this->once())->method('cleanUpUnfinalizedAssets')->with(null, true)->willReturn(2);

        self::assertSame(ExitCode::OK, $this->runWithFiles($controller, $files));
    }

    private function runWithFiles(PurgeController $controller, FilesService $files): int
    {
        $app = \Yii::$app;
        \Yii::$app = (object) ['loadedModules' => []];

        try {
            $freeform = (new \ReflectionClass(Freeform::class))->newInstanceWithoutConstructor();
            $freeform->set('files', $files);
            Freeform::setInstance($freeform);

            return $controller->actionUnfinalizedAssets();
        } finally {
            \Yii::$app = $app;
        }
    }

    private function createController(): PurgeController
    {
        $controller = $this->getMockBuilder(PurgeController::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['confirm', 'stdout', 'stderr', 'ansiFormat'])
            ->getMock()
        ;
        $controller->all = true;
        $controller->interactive = true;

        return $controller;
    }
}
