<?php

namespace Solspace\Freeform\Tests\Bundles\Mcp;

use craft\models\Site;
use Mcp\Exception\ToolCallException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Mcp\ChoiceSources;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries\Entries;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Countries\Countries;
use yii\di\Container;

#[CoversClass(ChoiceSources::class)]
class ChoiceSourcesTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousContainer;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousContainer = \Craft::$container;
        \Craft::$container = new Container();
        \Craft::$app = new class {
            public function getUser(): object
            {
                return new class {
                    public function getIdentity(): object
                    {
                        return new class {
                            public function can(string $permission): bool
                            {
                                return 'viewEntries:permitted' === $permission;
                            }
                        };
                    }
                };
            }

            public function getEntries(): object
            {
                return new class {
                    public function getAllSections(): array
                    {
                        return [
                            $this->section(3, 'publicEntries', 'permitted', 2),
                            $this->section(4, 'restricted', 'restricted', 2),
                            $this->section(5, 'anotherSite', 'permitted', 3),
                        ];
                    }

                    private function section(int $id, string $handle, string $uid, int $siteId): object
                    {
                        return new class($id, $handle, $uid, $siteId) {
                            public string $name = 'Entries';

                            public function __construct(public int $id, public string $handle, public string $uid, private int $siteId) {}

                            public function getSiteSettings(): array
                            {
                                return [$this->siteId => (object) ['hasUrls' => true]];
                            }
                        };
                    }
                };
            }
        };
        $this->allowSources(true);
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Craft::$container = $this->previousContainer;
    }

    public function testEntrySourcePersistsAnExplicitSectionAndSite(): void
    {
        self::assertSame([
            'source' => 'elements',
            'typeClass' => Entries::class,
            'properties' => ['sectionId' => 3, 'siteId' => '2'],
        ], ChoiceSources::configuration(['type' => 'entries', 'handle' => 'publicEntries'], new Site(['id' => 2])));
    }

    public function testPredefinedSourcePersistsTheNativeProvider(): void
    {
        self::assertSame([
            'source' => 'predefined',
            'typeClass' => Countries::class,
            'properties' => [],
        ], ChoiceSources::configuration(['type' => 'predefined', 'handle' => 'countries'], new Site(['id' => 2])));
    }

    #[TestWith(['restricted'])]
    #[TestWith(['anotherSite'])]
    public function testEntrySourceMustBeAvailableToTheCraftUserOnTheChosenSite(string $handle): void
    {
        $this->expectException(ToolCallException::class);
        ChoiceSources::configuration(['type' => 'entries', 'handle' => $handle], new Site(['id' => 2]));
    }

    public function testLimitedUserCannotSelectAnOtherwiseAvailablePredefinedSource(): void
    {
        $this->allowSources(false);
        $this->expectException(ToolCallException::class);
        ChoiceSources::configuration(['type' => 'predefined', 'handle' => 'countries'], new Site(['id' => 2]));
    }

    private function allowSources(bool $allowed): void
    {
        $checker = $this->createStub(LimitedUserChecker::class);
        $checker->method('can')->willReturn($allowed);
        \Craft::$container->setSingleton(LimitedUserChecker::class, $checker);
    }
}
