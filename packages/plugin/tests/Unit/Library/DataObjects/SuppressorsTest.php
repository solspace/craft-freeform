<?php

namespace Solspace\Tests\Freeform\Unit\Library\DataObjects;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\DataObjects\Suppressors;

/**
 * @internal
 *
 * @coversNothing
 */
class SuppressorsTest extends TestCase
{
    public function testConstructingFromFalseBool()
    {
        $suppressors = new Suppressors(false);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isElements());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isUserSelectNotifications());
        $this->assertFalse($suppressors->isEmailFieldNotifications());
        $this->assertFalse($suppressors->isConditionalNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingFromTrueBool()
    {
        $suppressors = new Suppressors(true);

        $this->assertTrue($suppressors->isApi());
        $this->assertTrue($suppressors->isElements());
        $this->assertTrue($suppressors->isAdminNotifications());
        $this->assertTrue($suppressors->isUserSelectNotifications());
        $this->assertTrue($suppressors->isEmailFieldNotifications());
        $this->assertTrue($suppressors->isConditionalNotifications());
        $this->assertTrue($suppressors->isPayments());
        $this->assertTrue($suppressors->isWebhooks());
    }

    public function testConstructingTrueForApi()
    {
        $suppressors = new Suppressors(['api' => true]);

        $this->assertTrue($suppressors->isApi());
        $this->assertFalse($suppressors->isElements());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isUserSelectNotifications());
        $this->assertFalse($suppressors->isEmailFieldNotifications());
        $this->assertFalse($suppressors->isConditionalNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForConnections()
    {
        $suppressors = new Suppressors(['elements' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertTrue($suppressors->isElements());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isUserSelectNotifications());
        $this->assertFalse($suppressors->isEmailFieldNotifications());
        $this->assertFalse($suppressors->isConditionalNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForAdminNotifications()
    {
        $suppressors = new Suppressors(['adminNotifications' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isElements());
        $this->assertTrue($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isUserSelectNotifications());
        $this->assertFalse($suppressors->isEmailFieldNotifications());
        $this->assertFalse($suppressors->isConditionalNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForDynamicRecipients()
    {
        $suppressors = new Suppressors(['userSelectNotifications' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isElements());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertTrue($suppressors->isUserSelectNotifications());
        $this->assertFalse($suppressors->isEmailFieldNotifications());
        $this->assertFalse($suppressors->isConditionalNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForSubmitterNotifications()
    {
        $suppressors = new Suppressors(['emailFieldNotifications' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isElements());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isUserSelectNotifications());
        $this->assertTrue($suppressors->isEmailFieldNotifications());
        $this->assertFalse($suppressors->isConditionalNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForConditionalNotifications()
    {
        $suppressors = new Suppressors(['conditionalNotifications' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isElements());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isUserSelectNotifications());
        $this->assertFalse($suppressors->isEmailFieldNotifications());
        $this->assertTrue($suppressors->isConditionalNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForPayments()
    {
        $suppressors = new Suppressors(['payments' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isElements());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isUserSelectNotifications());
        $this->assertFalse($suppressors->isEmailFieldNotifications());
        $this->assertTrue($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }

    public function testConstructingTrueForWebhooks()
    {
        $suppressors = new Suppressors(['webhooks' => true]);

        $this->assertFalse($suppressors->isApi());
        $this->assertFalse($suppressors->isElements());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isUserSelectNotifications());
        $this->assertFalse($suppressors->isEmailFieldNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertTrue($suppressors->isWebhooks());
    }

    public function testConstructingAllTrue()
    {
        $suppressors = new Suppressors([
            'api' => true,
            'elements' => true,
            'adminNotifications' => true,
            'userSelectNotifications' => true,
            'emailFieldNotifications' => true,
            'conditionalNotifications' => true,
            'payments' => true,
            'webhooks' => true,
        ]);

        $this->assertTrue($suppressors->isApi());
        $this->assertTrue($suppressors->isElements());
        $this->assertTrue($suppressors->isAdminNotifications());
        $this->assertTrue($suppressors->isUserSelectNotifications());
        $this->assertTrue($suppressors->isEmailFieldNotifications());
        $this->assertTrue($suppressors->isConditionalNotifications());
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
        $this->assertFalse($suppressors->isElements());
        $this->assertFalse($suppressors->isAdminNotifications());
        $this->assertFalse($suppressors->isUserSelectNotifications());
        $this->assertFalse($suppressors->isEmailFieldNotifications());
        $this->assertFalse($suppressors->isConditionalNotifications());
        $this->assertFalse($suppressors->isPayments());
        $this->assertFalse($suppressors->isWebhooks());
    }
}
