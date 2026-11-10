<?php

namespace Solspace\Freeform\Tests\Bundles\Form\Limiting\LimitedUsers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserSettingsProvider;

#[CoversClass(LimitedUserSettingsProvider::class)]
class LimitedUserSettingsProviderTest extends TestCase
{
    public function testLegacyPickerAccessRequiresBothReplacedPermissions(): void
    {
        foreach ([
            [['datepicker', 'nativeTypes', 'dateOrder'], ['datepicker', 'nativeTypes', 'dateOrder', 'picker', 'minuteStep']],
            [['datepicker'], ['datepicker']],
            [['nativeTypes'], ['nativeTypes']],
            [['picker'], ['picker']],
            [false, false],
        ] as [$saved, $expected]) {
            $provider = new LimitedUserSettingsProvider();
            (new \ReflectionProperty($provider, 'cache'))->setValue($provider, [1 => ['props.date' => $saved]]);
            $this->assertSame(['props.date' => $expected], $provider->getSettings(1));
        }
    }
}
