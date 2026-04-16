<?php

namespace Solspace\Freeform\Tests\Library\DataObjects;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\DataObjects\DisabledFunctionality;

#[CoversClass(DisabledFunctionality::class)]
class DisabledFunctionalityTest extends TestCase
{
    public function testConstructingFromFalseBool(): void
    {
        $disabledFunctionality = new DisabledFunctionality(false);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());

        $this->assertFalse($disabledFunctionality->api);
        $this->assertFalse($disabledFunctionality->elements);
        $this->assertFalse($disabledFunctionality->adminNotifications);
        $this->assertFalse($disabledFunctionality->userSelectNotifications);
        $this->assertFalse($disabledFunctionality->emailFieldNotifications);
        $this->assertFalse($disabledFunctionality->conditionalNotifications);
        $this->assertFalse($disabledFunctionality->payments);
        $this->assertFalse($disabledFunctionality->webhooks);
        $this->assertFalse($disabledFunctionality->submitButtons);
    }

    public function testConstructingFromTrueBool(): void
    {
        $disabledFunctionality = new DisabledFunctionality(true);

        $this->assertTrue($disabledFunctionality->isApi());
        $this->assertTrue($disabledFunctionality->isElements());
        $this->assertTrue($disabledFunctionality->isAdminNotifications());
        $this->assertTrue($disabledFunctionality->isUserSelectNotifications());
        $this->assertTrue($disabledFunctionality->isEmailFieldNotifications());
        $this->assertTrue($disabledFunctionality->isConditionalNotifications());
        $this->assertTrue($disabledFunctionality->isPayments());
        $this->assertTrue($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());

        $this->assertTrue($disabledFunctionality->api);
        $this->assertTrue($disabledFunctionality->elements);
        $this->assertTrue($disabledFunctionality->adminNotifications);
        $this->assertTrue($disabledFunctionality->userSelectNotifications);
        $this->assertTrue($disabledFunctionality->emailFieldNotifications);
        $this->assertTrue($disabledFunctionality->conditionalNotifications);
        $this->assertTrue($disabledFunctionality->payments);
        $this->assertTrue($disabledFunctionality->webhooks);
        $this->assertFalse($disabledFunctionality->submitButtons);
    }

    public function testConstructingTrueForApi(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['api' => true]);

        $this->assertTrue($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testConstructingTrueForConnections(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['elements' => true]);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertTrue($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testConstructingTrueForAdminNotifications(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['adminNotifications' => true]);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertTrue($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testConstructingTrueForDynamicRecipients(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['userSelectNotifications' => true]);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertTrue($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testConstructingTrueForSubmitterNotifications(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['emailFieldNotifications' => true]);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertTrue($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testConstructingTrueForConditionalNotifications(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['conditionalNotifications' => true]);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertTrue($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testConstructingTrueForPayments(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['payments' => true]);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertTrue($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testConstructingTrueForWebhooks(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['webhooks' => true]);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertTrue($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testConstructingAllTrue(): void
    {
        $disabledFunctionality = new DisabledFunctionality([
            'api' => true,
            'elements' => true,
            'adminNotifications' => true,
            'userSelectNotifications' => true,
            'emailFieldNotifications' => true,
            'conditionalNotifications' => true,
            'payments' => true,
            'webhooks' => true,
            'submitButtons' => true,
        ]);

        $this->assertTrue($disabledFunctionality->isApi());
        $this->assertTrue($disabledFunctionality->isElements());
        $this->assertTrue($disabledFunctionality->isAdminNotifications());
        $this->assertTrue($disabledFunctionality->isUserSelectNotifications());
        $this->assertTrue($disabledFunctionality->isEmailFieldNotifications());
        $this->assertTrue($disabledFunctionality->isConditionalNotifications());
        $this->assertTrue($disabledFunctionality->isPayments());
        $this->assertTrue($disabledFunctionality->isWebhooks());
        $this->assertTrue($disabledFunctionality->isSubmitButtons());
    }

    public function testConstructingRandomValues(): void
    {
        $disabledFunctionality = new DisabledFunctionality([
            'random1' => true,
            'test' => true,
            'non existent' => true,
        ]);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testNotificationsKeyword(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['notifications']);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertTrue($disabledFunctionality->isAdminNotifications());
        $this->assertTrue($disabledFunctionality->isUserSelectNotifications());
        $this->assertTrue($disabledFunctionality->isEmailFieldNotifications());
        $this->assertTrue($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }

    public function testCaptchasKeyword(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['captchas']);

        $this->assertFalse($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
        $this->assertTrue($disabledFunctionality->isCaptchas());
    }

    public function testShorthandKeyword(): void
    {
        $disabledFunctionality = new DisabledFunctionality(['api']);

        $this->assertTrue($disabledFunctionality->isApi());
        $this->assertFalse($disabledFunctionality->isElements());
        $this->assertFalse($disabledFunctionality->isAdminNotifications());
        $this->assertFalse($disabledFunctionality->isUserSelectNotifications());
        $this->assertFalse($disabledFunctionality->isEmailFieldNotifications());
        $this->assertFalse($disabledFunctionality->isConditionalNotifications());
        $this->assertFalse($disabledFunctionality->isPayments());
        $this->assertFalse($disabledFunctionality->isWebhooks());
        $this->assertFalse($disabledFunctionality->isSubmitButtons());
    }
}
