<?php

namespace Solspace\Freeform\Tests\Integrations\CRM\Salesforce;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Integrations\CRM\Salesforce\BaseSalesforceIntegration;
use Solspace\Freeform\Integrations\CRM\Salesforce\Versions\SalesforceV58;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;

#[CoversClass(BaseSalesforceIntegration::class)]
#[CoversClass(SalesforceV58::class)]
class SalesforceV58Test extends TestCase
{
    public function testOAuthSettingsKeepCredentialProtectionAndCallbackGeneration(): void
    {
        $integration = new \ReflectionClass(SalesforceV58::class);
        $trait = new \ReflectionClass(OAuth2Trait::class);
        foreach (['redirectUri', 'clientId', 'clientSecret'] as $handle) {
            $original = $trait->getProperty($handle);
            $updated = $integration->getProperty($handle);
            foreach ([Flag::class, ValueGenerator::class] as $attribute) {
                $arguments = static fn (\ReflectionAttribute $item) => $item->getArguments();
                self::assertSame(
                    array_map($arguments, $original->getAttributes($attribute)),
                    array_map($arguments, $updated->getAttributes($attribute)),
                    $handle.' must retain its OAuth protection and value generator.',
                );
            }
        }
    }

    public function testSalesforceLoginServerPriorityIsPreserved(): void
    {
        foreach ([
            ['false', 'false', 'https://login.salesforce.com'],
            ['true', 'false', 'https://test.salesforce.com'],
            ['false', 'true', 'https://example.my.salesforce.com'],
            ['true', 'true', 'https://example.my.salesforce.com'],
        ] as [$sandbox, $custom, $domain]) {
            $reflection = new \ReflectionClass(SalesforceV58::class);
            $integration = $reflection->newInstanceWithoutConstructor();
            foreach (['sandboxMode' => $sandbox, 'useCustomUrl' => $custom, 'customUrl' => 'https://example.my.salesforce.com'] as $handle => $value) {
                $reflection->getProperty($handle)->setValue($integration, $value);
            }
            self::assertSame($domain.'/services/oauth2/authorize', $integration->getAuthorizeUrl());
            self::assertSame($domain.'/services/oauth2/token', $integration->getAccessTokenUrl());
            $integration->setInstanceUrl('https://instance.my.salesforce.com');
            self::assertSame('https://instance.my.salesforce.com/services/data/v58.0', $integration->getApiRootUrl());
        }
    }

    public function testCustomLoginUrlResolvesEnvironmentVariables(): void
    {
        $name = 'FREEFORM_TEST_SALESFORCE_LOGIN_URL';
        $original = getenv($name);
        putenv($name.'= https://example.my.salesforce.com/ ');

        try {
            $reflection = new \ReflectionClass(SalesforceV58::class);
            $integration = $reflection->newInstanceWithoutConstructor();
            $reflection->getProperty('useCustomUrl')->setValue($integration, 'true');
            $reflection->getProperty('customUrl')->setValue($integration, '$'.$name);
            self::assertSame('https://example.my.salesforce.com/services/oauth2/authorize', $integration->getAuthorizeUrl());
            self::assertSame('https://example.my.salesforce.com/services/oauth2/token', $integration->getAccessTokenUrl());
        } finally {
            putenv(false === $original ? $name : $name.'='.$original);
        }
    }
}
