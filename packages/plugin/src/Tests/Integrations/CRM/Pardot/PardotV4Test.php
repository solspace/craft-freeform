<?php

namespace Solspace\Freeform\Tests\Integrations\CRM\Pardot;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Integrations\CRM\Pardot\BasePardotIntegration;
use Solspace\Freeform\Integrations\CRM\Pardot\Versions\PardotV4;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;

#[CoversClass(BasePardotIntegration::class)]
class PardotV4Test extends TestCase
{
    public function testOAuthSettingsKeepCredentialProtectionAndCallbackGeneration(): void
    {
        $integration = new \ReflectionClass(PardotV4::class);
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
            $reflection = new \ReflectionClass(PardotV4::class);
            $integration = $reflection->newInstanceWithoutConstructor();
            foreach (['sandboxMode' => $sandbox, 'useCustomUrl' => $custom, 'customUrl' => 'https://example.my.salesforce.com'] as $handle => $value) {
                $reflection->getProperty($handle)->setValue($integration, $value);
            }
            self::assertSame($domain.'/services/oauth2/authorize', $integration->getAuthorizeUrl());
            self::assertSame($domain.'/services/oauth2/token', $integration->getAccessTokenUrl());
            self::assertSame('https://pi.pardot.com/api', $integration->getApiRootUrl());
        }
    }

    public function testCustomLoginUrlResolvesEnvironmentVariables(): void
    {
        $name = 'FREEFORM_TEST_PARDOT_LOGIN_URL';
        $original = getenv($name);
        putenv($name.'= https://example.my.salesforce.com/ ');

        try {
            $reflection = new \ReflectionClass(PardotV4::class);
            $integration = $reflection->newInstanceWithoutConstructor();
            $reflection->getProperty('useCustomUrl')->setValue($integration, 'true');
            $reflection->getProperty('customUrl')->setValue($integration, '$'.$name);
            self::assertSame('https://example.my.salesforce.com/services/oauth2/authorize', $integration->getAuthorizeUrl());
            self::assertSame('https://example.my.salesforce.com/services/oauth2/token', $integration->getAccessTokenUrl());
        } finally {
            putenv(false === $original ? $name : $name.'='.$original);
        }
    }

    public function testCustomFieldQueryMapsPardotTypes(): void
    {
        $fields = $this->fetchCustomFields([
            ['field_id' => 'favorite_color', 'name' => 'Favorite Color', 'type' => 'Text'],
            ['field_id' => 'interests', 'name' => 'Interests', 'type' => 'Multi-Select'],
            ['field_id' => 'rating', 'name' => 'Rating', 'type' => 'Number'],
            ['field_id' => 'unsupported', 'name' => 'Unsupported', 'type' => 'CRM User'],
        ]);

        self::assertSame(['favorite_color', 'interests', 'rating'], array_map(
            static fn (FieldObject $field) => $field->getHandle(),
            $fields,
        ));
        self::assertSame(
            [FieldObject::TYPE_STRING, FieldObject::TYPE_ARRAY, FieldObject::TYPE_NUMERIC],
            array_map(static fn (FieldObject $field) => $field->getType(), $fields),
        );
        self::assertSame('Favorite Color', $fields[0]->getLabel());
    }

    public function testSingleCustomFieldIsReturned(): void
    {
        $fields = $this->fetchCustomFields([
            'field_id' => 'favorite_color',
            'name' => 'Favorite Color',
            'type' => 'Text',
        ]);

        self::assertCount(1, $fields);
        self::assertSame('favorite_color', $fields[0]->getHandle());
    }

    private function fetchCustomFields(array $customFields): array
    {
        $integration = (new \ReflectionClass(PardotV4::class))->newInstanceWithoutConstructor();
        $client = new Client([
            'handler' => new MockHandler([
                new Response(200, [], json_encode(['result' => ['customField' => $customFields]])),
            ]),
        ]);

        return $integration->fetchFields('Custom', $client);
    }
}
