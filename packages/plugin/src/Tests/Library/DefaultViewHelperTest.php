<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\DefaultViewHelper;
use yii\web\ForbiddenHttpException;

/**
 * @coversNothing
 */
class DefaultViewHelperTest extends TestCase
{
    #[TestWith(['spam'])]
    #[TestWith(['ab-tests'])]
    #[TestWith(['forms'])]
    #[TestWith(['submissions'])]
    public function testAccessiblePreferredViewIsUsed(string $view): void
    {
        self::assertSame($view, DefaultViewHelper::resolve($view, ['forms' => true, $view => true]));
    }

    #[TestWith(['spam'])]
    #[TestWith(['ab-tests'])]
    #[TestWith(['unknown'])]
    public function testUnavailableOrUnknownViewsFallBackToAnAccessibleSection(string $view): void
    {
        self::assertSame('forms', DefaultViewHelper::resolve($view, ['forms' => true, 'submissions' => true, $view => false]));
        self::assertSame('submissions', DefaultViewHelper::resolve($view, ['forms' => false, 'submissions' => true, $view => false]));
        self::assertSame('settings', DefaultViewHelper::resolve($view, ['forms' => false, 'submissions' => false, 'settings' => true, $view => false]));
    }

    public function testAnAbOnlyUserHasAnAccessibleFallback(): void
    {
        self::assertSame('ab-tests', DefaultViewHelper::resolve('forms', ['forms' => false, 'ab-tests' => true]));
    }

    public function testMissingPermissionsNeverRedirectToAnInaccessiblePage(): void
    {
        $this->expectException(ForbiddenHttpException::class);
        DefaultViewHelper::resolve('spam', ['spam' => false, 'forms' => false]);
    }
}
