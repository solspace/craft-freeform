<?php

namespace Solspace\Freeform\Tests\Integrations\CRM\Pardot;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Integrations\CRM\Pardot\BasePardotIntegration;
use Solspace\Freeform\Integrations\CRM\Pardot\Versions\PardotV4;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[CoversClass(BasePardotIntegration::class)]
class PardotV4Test extends TestCase
{
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
