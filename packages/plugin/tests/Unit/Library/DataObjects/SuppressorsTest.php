<?php

namespace Solspace\Tests\Freeform\Unit\Library\DataObjects;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\DataObjects\Suppressors;

/**
 * @internal
 * @coversNothing
 */
class SuppressorsTest extends TestCase
{
    public function testConstructingFromFalseBool()
    {
        $suppressors = new Suppressors(false);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isConnections());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isDynamicRecipients());
        $this->assertFalse($suppressors->isSubmitterNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingFromTrueBool()
    {
        $suppressors = new Suppressors(true);

        $this->assertTrue($suppressors->isApi());
        $this->assertTrue($suppressors->isConnections());
        $this->assertTrue($suppressors->isAdminNotifications());
        $this->assertTrue($suppressors->isDynamicRecipients());
        $this->assertTrue($suppressors->isSubmitterNotifications());
        $this->assertTrue($suppressors->isPayments());
        $this->assertTrue($suppressors->isWebhooks());
    }

    public function testConstructingTrueForApi()
    {
        $suppressors = new Suppressors(['api' => true]);

        $this->assertTrue($suppressors->isApi());
        $this->assertFalse($suppressors->isConnections());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isDynamicRecipients());
        $this->assertFalse($suppressors->isSubmitterNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForConnections()
    {
        $suppressors = new Suppressors(['connections' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertTrue($suppressors->isConnections());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isDynamicRecipients());
        $this->assertFalse($suppressors->isSubmitterNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForAdminNotifications()
    {
        $suppressors = new Suppressors(['adminNotifications' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isConnections());
        $this->assertTrue($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isDynamicRecipients());
        $this->assertFalse($suppressors->isSubmitterNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForDynamicRecipients()
    {
        $suppressors = new Suppressors(['dynamicRecipients' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isConnections());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertTrue($suppressors->isDynamicRecipients());
        $this->assertFalse($suppressors->isSubmitterNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForSubmitterNotifications()
    {
        $suppressors = new Suppressors(['submitterNotifications' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isConnections());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isDynamicRecipients());
        $this->assertTrue($suppressors->isSubmitterNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForPayments()
    {
        $suppressors = new Suppressors(['payments' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isConnections());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isDynamicRecipients());
        $this->assertFalse($suppressors->isSubmitterNotifications());
        $this->assertTrue($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForWebhooks()
    {
        $suppressors = new Suppressors(['webhooks' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isConnections());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isDynamicRecipients());
        $this->assertFalse($suppressors->isSubmitterNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertTrue($suppressors->isWebhooks());
    }

    public function testConstructingAllTrue()
    {
        $suppressors = new Suppressors([
            'api' => true,
            'connections' => true,
            'adminNotifications' => true,
            'dynamicRecipients' => true,
            'submitterNotifications' => true,
            'payments' => true,
            'webhooks' => true,
        ]);

        $this->assertTrue($suppressors->isApi());
        $this->assertTrue($suppressors->isConnections());
        $this->assertTrue($suppressors->isAdminNotifications());
        $this->assertTrue($suppressors->isDynamicRecipients());
        $this->assertTrue($suppressors->isSubmitterNotifications());
        $this->assertTrue($suppressors->isPayments());
        $this->assertTrue($suppressors->isWebhooks());
    }

    public function testConstructingRandomValues()
    {
        $suppressors = new Suppressors([
            'random1' => true,
            'test' => true,
            'non existent' => true,
        ]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isConnections());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isDynamicRecipients());
        $this->assertFalse($suppressors->isSubmitterNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }
}
