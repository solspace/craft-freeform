<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use CraftCms\Cms\Cp\Data\NavItem;
use Illuminate\Container\Container;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Events\Freeform\RegisterCpSubnavItemsEvent;
use Solspace\Freeform\Freeform;

/**
 * @coversNothing
 */
#[CoversNothing]
class Craft6NavigationTest extends TestCase
{
    private Container $previousContainer;

    protected function setUp(): void
    {
        $this->previousContainer = Container::getInstance();
        Container::setInstance(new Container());
        app()->instance('session', new Store('test', new ArraySessionHandler(120)));
    }

    protected function tearDown(): void
    {
        Container::setInstance($this->previousContainer);
    }

    public function testNativeNavigationReceivesListsAndAnInlinePluginIcon(): void
    {
        $plugin = $this->getMockBuilder(Freeform::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['triggerPluginEvent'])
            ->getMock()
        ;
        $plugin->name = 'Custom Freeform Name';
        $plugin->handle = 'freeform';
        $plugin->expects(self::once())->method('triggerPluginEvent')->willReturnCallback(
            static function (string $name, RegisterCpSubnavItemsEvent $event): void {
                self::assertSame(Freeform::EVENT_REGISTER_SUBNAV_ITEMS, $name);
                $event->addSubnavItem('forms', 'Forms', 'freeform/forms');
                $event->addSubnavItem('spam', 'Spam', 'freeform/spam', extraOptions: ['badgeCount' => null]);
                $event->addSubnavItem('export', 'Import / Export', 'freeform/export/profiles', extraOptions: [
                    'subnav' => ['profiles' => ['label' => 'Profiles', 'url' => 'freeform/export/profiles']],
                ]);
                $event->addSubnavItem('settings', 'Settings', 'freeform/settings');
            }
        );

        $nav = $plugin->getCpNavItem();
        self::assertInstanceOf(NavItem::class, $nav);
        self::assertSame('Custom Freeform Name', $nav->label);
        self::assertStringContainsString('<svg', $nav->iconSvg);
        self::assertFileExists($nav->icon, 'Keep the file icon for Craft\'s legacy Twig renderer.');
        self::assertTrue(array_is_list($nav->subnav));
        self::assertTrue(array_is_list($nav->subnav[2]->subnav));
        self::assertSame(0, $nav->subnav[1]->badgeCount);
        self::assertSame('freeform/settings', $nav->subnav[3]->href);

        // This is the shape the CP sends to Vue, which only accepts subnav arrays.
        $json = json_encode($nav, \JSON_THROW_ON_ERROR);
        $data = json_decode($json, flags: \JSON_THROW_ON_ERROR);
        self::assertIsArray($data->subnav);
        self::assertIsArray($data->subnav[2]->subnav);
        self::assertStringContainsString('<svg', $data->iconSvg);
    }
}
