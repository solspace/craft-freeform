<?php

namespace Solspace\Freeform\Tests\Commands;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Commands\DatabaseController;
use Solspace\Freeform\Library\Database\DatabaseIntegrity;
use Solspace\Freeform\Library\Database\ForeignKeyRepair;
use Solspace\Freeform\Library\Database\IntegrityScan;
use yii\console\ExitCode;

#[CoversClass(DatabaseController::class)]
class DatabaseControllerTest extends TestCase
{
    public function testDefaultInvocationIsReadOnlyAndReportsIssues(): void
    {
        [$controller, $repair] = $this->fixture();
        $repair->expects($this->never())->method('restore');

        $this->assertSame(ExitCode::UNSPECIFIED_ERROR, $controller->actionRepairForeignKeys());
    }

    public function testExplicitDryRunOverridesApply(): void
    {
        [$controller, $repair] = $this->fixture();
        $controller->apply = true;
        $controller->dryRun = true;
        $repair->expects($this->never())->method('restore');

        $this->assertSame(ExitCode::UNSPECIFIED_ERROR, $controller->actionRepairForeignKeys());
    }

    public function testApplyRestoresUnblockedMissingKeys(): void
    {
        [$controller, $repair, $definition] = $this->fixture();
        $controller->apply = true;
        $repair->expects($this->once())->method('restore')->with($definition);

        $this->assertSame(ExitCode::OK, $controller->actionRepairForeignKeys());
    }

    public function testApplyLeavesOrphanedRowsForReview(): void
    {
        [$controller, $repair] = $this->fixture('blocked', 9);
        $controller->apply = true;
        $repair->expects($this->never())->method('restore');

        $this->assertSame(ExitCode::UNSPECIFIED_ERROR, $controller->actionRepairForeignKeys());
    }

    public function testRepairFailureReturnsNonzeroExitCode(): void
    {
        [$controller, $repair] = $this->fixture();
        $controller->apply = true;
        $repair->method('restore')->willThrowException(new \RuntimeException('DDL failed'));

        $this->assertSame(ExitCode::UNSPECIFIED_ERROR, $controller->actionRepairForeignKeys());
    }

    public function testGeneralIntegrityCheckNeverRepairsEvenWithApply(): void
    {
        $controller = $this->getMockBuilder(DatabaseController::class)->disableOriginalConstructor()->onlyMethods(['createRepair', 'createIntegrity', 'createScan', 'stdout', 'stderr'])->getMock();
        $controller->apply = true;
        $repair = $this->createMock(ForeignKeyRepair::class);
        $repair->method('getDefinitions')->willReturn([[null, '{{%freeform_submissions}}', 'id', '{{%elements}}', 'id', 'CASCADE', null]]);
        $repair->method('inspect')->willReturn(['status' => 'missing', 'orphanCount' => 0, 'message' => 'Missing key']);
        $repair->expects($this->never())->method('restore');
        $integrity = $this->createMock(DatabaseIntegrity::class);
        $integrity->method('inspect')->willReturn([['relationship' => 'test', 'message' => 'Missing index']]);
        $scan = $this->createMock(IntegrityScan::class);
        $scan->method('getTasks')->willReturn([['type' => 'duplicates', 'table' => 'test', 'columns' => ['id'], 'error' => null]]);
        $scan->method('scanTask')->willReturn(['cursor' => 0, 'maxId' => null, 'affected' => 2, 'complete' => true, 'error' => null]);
        $controller->method('createRepair')->willReturn($repair);
        $controller->method('createIntegrity')->willReturn($integrity);
        $controller->method('createScan')->willReturn($scan);

        $this->assertSame(ExitCode::UNSPECIFIED_ERROR, $controller->actionCheckIntegrity());
    }

    private function fixture(string $status = 'missing', int $orphans = 0): array
    {
        $controller = $this->getMockBuilder(DatabaseController::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['createRepair', 'stdout', 'stderr'])
            ->getMock()
        ;
        $repair = $this->createMock(ForeignKeyRepair::class);
        $definition = [null, '{{%freeform_submissions}}', 'id', '{{%elements}}', 'id', 'CASCADE', null];
        $repair->method('getDefinitions')->willReturn([$definition]);
        $repair->method('inspect')->willReturn(['status' => $status, 'orphanCount' => $orphans, 'message' => 'Test result.']);
        $controller->method('createRepair')->willReturn($repair);

        return [$controller, $repair, $definition];
    }
}
