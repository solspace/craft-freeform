<?php

namespace Solspace\Freeform\Tests\Bundles\GraphQL;

use craft\events\RegisterGqlTypesEvent;
use craft\services\Gql;
use CraftCms\Yii2Adapter\Gql\LegacyGqlTypes;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AbstractInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FormInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FreeformInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SubmissionInterface;
use yii\base\Event;

#[CoversClass(AbstractInterface::class)]
class Craft6TypeRegistrationTest extends TestCase
{
    public function testCraft6AcceptsFreeformTypesRegisteredThroughTheLegacyEvent(): void
    {
        $previousApp = \Craft::$app;
        $gql = new Gql();
        \Craft::$app = new class($gql) {
            public function __construct(private Gql $gql) {}

            public function getGql(): Gql
            {
                return $this->gql;
            }
        };
        $interfaces = [FreeformInterface::class, FormInterface::class, SubmissionInterface::class];
        $handler = static function (RegisterGqlTypesEvent $event) use ($interfaces): void {
            $event->types = array_merge($event->types, $interfaces);
        };
        Event::on(Gql::class, Gql::EVENT_REGISTER_GQL_TYPES, $handler);

        try {
            $registered = (new LegacyGqlTypes())->types()->all();
            foreach ($interfaces as $interface) {
                self::assertContains($interface, $registered);
            }
        } finally {
            Event::off(Gql::class, Gql::EVENT_REGISTER_GQL_TYPES, $handler);
            \Craft::$app = $previousApp;
        }
    }
}
