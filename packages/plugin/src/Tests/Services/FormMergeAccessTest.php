<?php

namespace Solspace\Freeform\Tests\Services;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Services\FormMergeService;
use yii\di\Container;

#[CoversClass(FormMergeService::class)]
class FormMergeAccessTest extends TestCase
{
    #[TestWith([Freeform::EDITION_EXPRESS, true, false])]
    #[TestWith([Freeform::EDITION_LITE, true, false])]
    #[TestWith([Freeform::EDITION_PRO, true, true])]
    #[TestWith([Freeform::EDITION_PRO, false, false])]
    public function testOnlyProUsersWithFieldLayoutAccessCanMerge(string $edition, bool $canEditLayout, bool $expected): void
    {
        $plugin = $this->createStub(Freeform::class);
        $plugin->method('edition')->willReturn(new EditionHelper($edition, [
            Freeform::EDITION_EXPRESS,
            Freeform::EDITION_LITE,
            Freeform::EDITION_PRO,
        ]));
        $request = $this->createStub(Request::class);
        $request->method('getIsConsoleRequest')->willReturn(true);
        $limitedUser = $this->createStub(LimitedUserChecker::class);
        $limitedUser->method('can')->willReturn($canEditLayout);

        $app = \Craft::$app;
        $yiiApp = \Yii::$app;
        $container = \Craft::$container;

        try {
            \Craft::$app = \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin], 'request' => $request];
            \Craft::$container = new Container();
            \Craft::$container->setSingleton(LimitedUserChecker::class, $limitedUser);

            self::assertSame($expected, FormMergeService::canAccess());
        } finally {
            \Craft::$app = $app;
            \Yii::$app = $yiiApp;
            \Craft::$container = $container;
        }
    }
}
