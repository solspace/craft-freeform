<?php

namespace Solspace\Freeform\Tests\Bundles\Form;

use craft\elements\db\UserQuery;
use craft\elements\User;
use craft\services\Elements;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\FormUserProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Types\Regular;
use yii\di\Container;

#[CoversClass(FormUserProvider::class)]
#[CoversClass(Form::class)]
class FormUserProviderTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousContainer;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousContainer = \Craft::$container;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Craft::$container = $this->previousContainer;
    }

    public function testRepeatedFormOwnersRunOneQueryAcrossForms(): void
    {
        $user = $this->createStub(User::class);
        $this->configureQuery($user, 1);

        \Craft::$container = new Container();
        \Craft::$container->setSingleton(FormUserProvider::class);

        for ($i = 0; $i < 40; ++$i) {
            $form = $this->createForm(1, 1);
            for ($call = 0; $call < 5; ++$call) {
                $this->assertSame($user, $form->getCreatedBy());
                $this->assertSame($user, $form->getUpdatedBy());
            }
        }
    }

    public function testMissingOwnersAreAlsoQueriedOnlyOnce(): void
    {
        $this->configureQuery(null, 1);
        \Craft::$container = new Container();
        \Craft::$container->setSingleton(FormUserProvider::class);

        foreach ([$this->createForm(1, 1), $this->createForm(1, 1)] as $form) {
            $this->assertNull($form->getCreatedBy());
            $this->assertNull($form->getUpdatedBy());
        }
    }

    public function testUnsetOwnerIdsDoNotQuery(): void
    {
        $this->configureQuery(null, 0);

        $provider = new FormUserProvider();
        $this->assertNull($provider->getUser(null));
        $this->assertNull($provider->getUser(0));

        $form = $this->createForm(null, null);
        $this->assertNull($form->getCreatedBy());
        $this->assertNull($form->getUpdatedBy());
    }

    public function testCacheIsScopedToSiteAndProviderInstance(): void
    {
        $user = $this->createStub(User::class);
        $app = $this->configureQuery($user, 3);
        $provider = new FormUserProvider();

        $this->assertSame($user, $provider->getUser(1));
        $app->siteId = 2;
        $this->assertSame($user, $provider->getUser(1));
        $app->siteId = 1;
        $this->assertSame($user, $provider->getUser(1));

        $nextRequest = new FormUserProvider();
        $this->assertSame($user, $nextRequest->getUser(1));
    }

    public function testDistinctOwnersAreResolvedSeparately(): void
    {
        $createdBy = $this->createStub(User::class);
        $updatedBy = $this->createStub(User::class);
        $query = $this->createMock(UserQuery::class);
        $query->expects($this->exactly(2))->method('id')->willReturnCallback(function ($id) use ($query) {
            $this->assertContains($id, [1, 2]);

            return $query;
        });
        $query->expects($this->exactly(2))->method('one')->willReturnOnConsecutiveCalls($createdBy, $updatedBy);
        $elements = $this->createMock(Elements::class);
        $elements->expects($this->exactly(2))->method('createElementQuery')->with(User::class)->willReturn($query);
        \Craft::$app = new FormUserProviderAppStub($elements);

        $provider = new FormUserProvider();
        $this->assertSame($createdBy, $provider->getUser(1));
        $this->assertSame($updatedBy, $provider->getUser(2));
        $this->assertSame($createdBy, $provider->getUser(1));
        $this->assertSame($updatedBy, $provider->getUser(2));
    }

    private function configureQuery(?User $user, int $count): FormUserProviderAppStub
    {
        $query = $this->createMock(UserQuery::class);
        $query->expects($this->exactly($count))->method('id')->with(1)->willReturnSelf();
        $query->expects($this->exactly($count))->method('one')->willReturn($user);
        $elements = $this->createMock(Elements::class);
        $elements->expects($this->exactly($count))->method('createElementQuery')->with(User::class)->willReturn($query);

        return \Craft::$app = new FormUserProviderAppStub($elements);
    }

    private function createForm(?int $createdBy, ?int $updatedBy): Form
    {
        $form = (new \ReflectionClass(Regular::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(Form::class, 'createdByUserId'))->setValue($form, $createdBy);
        (new \ReflectionProperty(Form::class, 'updatedByUserId'))->setValue($form, $updatedBy);

        return $form;
    }
}

class FormUserProviderAppStub
{
    public int $siteId = 1;

    public function __construct(private Elements $elements) {}

    public function getElements(): Elements
    {
        return $this->elements;
    }

    public function getSites(): self
    {
        return $this;
    }

    public function getCurrentSite(): object
    {
        return (object) ['id' => $this->siteId];
    }
}
