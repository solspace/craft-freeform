<?php

namespace Solspace\Freeform\Tests\Bundles\Mcp;

use craft\elements\User as UserElement;
use craft\models\Site;
use craft\services\Sites;
use craft\web\User;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Mcp\Access;

#[CoversClass(Access::class)]
class AccessTest extends TestCase
{
    public function testRechecksEditableSitesForTheAuthenticatedMcpUser(): void
    {
        $allowedSite = new Site(['id' => 1, 'handle' => 'allowed', 'uid' => 'allowed-uid']);
        $restrictedSite = new Site(['id' => 2, 'handle' => 'restricted', 'uid' => 'restricted-uid']);
        $sites = $this->createPartialMock(Sites::class, ['getAllSites']);
        $sites->method('getAllSites')->willReturn([$allowedSite, $restrictedSite]);
        $session = new User(['identityClass' => UserElement::class, 'enableSession' => false]);
        $identity = $this->createStub(UserElement::class);
        $identity->method('can')->willReturnCallback(static fn (string $permission): bool => \in_array(
            $permission,
            ['accessCp', 'accessPlugin-freeform', 'editSite:allowed-uid'],
            true,
        ));

        $previousApp = \Craft::$app;
        \Craft::$app = new class($session, $sites) {
            public function __construct(private User $user, private Sites $sites) {}

            public function getUser(): User
            {
                return $this->user;
            }

            public function getSites(): Sites
            {
                return $this->sites;
            }

            public function getIsMultiSite(bool $refresh = false): bool
            {
                return true;
            }

            public function getIsInstalled(): bool
            {
                return false;
            }
        };

        try {
            self::assertSame([], $sites->getEditableSites());

            $session->setIdentity($identity);

            self::assertSame(
                [$allowedSite],
                Access::run('accessPlugin-freeform', $sites->getEditableSites(...)),
            );
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
