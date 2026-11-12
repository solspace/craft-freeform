<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\NotificationTemplateNames;

#[CoversClass(NotificationTemplateNames::class)]
class NotificationTemplateNamesTest extends TestCase
{
    #[TestWith(['Notification', 'notification', [], ['Notification', 'notification']])]
    #[TestWith(['Notification', 'notification', ['notification'], ['Notification 2', 'notification2']])]
    #[TestWith(['Notification', 'notification', ['notification', 'notification2'], ['Notification 3', 'notification3']])]
    #[TestWith(['Notification', 'notification', ['notification', 'notification2', 'notification4'], ['Notification 3', 'notification3']])]
    #[TestWith(['Notification 2', 'notification2', ['notification2', 'notification3'], ['Notification 4', 'notification4']])]
    #[TestWith(['Notification 2', 'notification-2', ['notification-2'], ['Notification 3', 'notification3']])]
    #[TestWith(['Admin Alert', 'adminAlert', ['notification'], ['Admin Alert', 'adminAlert']])]
    #[TestWith(['Notification', '', [''], ['Notification', '']])]
    public function testNewTemplatesReceiveAnAvailableNameAndHandle(string $name, string $handle, array $existing, array $expected): void
    {
        self::assertSame($expected, NotificationTemplateNames::unique($name, $handle, static fn (string $candidate): bool => \in_array($candidate, $existing, true)));
    }
}
