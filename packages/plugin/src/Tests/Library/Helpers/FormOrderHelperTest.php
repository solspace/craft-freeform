<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\FormOrderHelper;
use yii\web\BadRequestHttpException;

#[CoversClass(FormOrderHelper::class)]
class FormOrderHelperTest extends TestCase
{
    #[TestWith([[1, 90, 2, 3], 3, 1, [3, 1, 90, 2]])]
    #[TestWith([[1, 90, 2, 3], 1, null, [90, 2, 3, 1]])]
    #[TestWith([['1', '90', '2'], 3, 2, [1, 90, 3, 2]])]
    #[TestWith([[], 3, null, [3]])]
    public function testMovePreservesOtherForms(array $ids, int $formId, ?int $beforeId, array $expected): void
    {
        $this->assertSame($expected, FormOrderHelper::moveBefore($ids, $formId, $beforeId));
    }

    #[TestWith([4])]
    #[TestWith([1])]
    public function testRejectsInvalidDestination(int $beforeId): void
    {
        $this->expectException(BadRequestHttpException::class);
        FormOrderHelper::moveBefore([1, 2, 3], 1, $beforeId);
    }
}
