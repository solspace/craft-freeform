<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Compatibility\YiiComponentPluginTrait;
use yii\base\Module;
use yii\console\Request;
use yii\console\Response;

#[CoversNothing]
class Craft6CommandDiscoveryTest extends TestCase
{
    #[TestWith(['Solspace\Freeform\Commands', 'database/delete-orphans'])]
    #[TestWith(['Solspace\Freeform\Commands', 'database/repair-foreign-keys'])]
    #[TestWith(['Solspace\Freeform\Commands', 'submissions/fix-table-names'])]
    #[TestWith(['Solspace\Freeform\controllers', null])]
    public function testModulePreservesTheRequestControllerNamespace(string $namespace, ?string $action): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;
        \Yii::$app = new Module('application', null, [
            'components' => [
                'request' => Request::class,
                'response' => Response::class,
            ],
        ]);
        \Craft::$app = new Module('application');

        try {
            $plugin = new class {
                use YiiComponentPluginTrait;

                public string $handle = 'freeform';
                public string $controllerNamespace;
                public array $controllerMap = [];

                public function register(): void
                {
                    $this->registerFreeformYiiApplicationModule();
                }
            };
            $plugin->controllerNamespace = $namespace;
            $plugin->register();

            $module = \Craft::$app->getModule('freeform');
            self::assertSame($namespace, $module->controllerNamespace);

            if ($action !== null) {
                [$controller, $actionId] = $module->createController($action);
                self::assertNotNull($controller->createAction($actionId));
                self::assertIsArray($controller->options($actionId));
            }
        } finally {
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }
}
