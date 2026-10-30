<?php

namespace Solspace\Freeform\Tests\Bundles\GraphQL;

use craft\config\GeneralConfig;
use craft\gql\GqlEntityRegistry;
use craft\gql\TypeLoader;
use craft\services\Config;
use craft\services\Gql;
use GraphQL\GraphQL;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Schema;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input\Attributes;
use Solspace\Freeform\Bundles\Fields\FieldsBundle;
use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Bundles\GraphQL\FieldTypeMetadata;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FreeformInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\FieldType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AttributesGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\FieldGenerator;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\InvalidFieldTypeException;
use yii\di\Container;

#[CoversClass(FieldTypeMetadata::class)]
#[CoversClass(FieldGenerator::class)]
#[CoversClass(AttributesGenerator::class)]
class FieldSchemaGenerationTest extends TestCase
{
    private FieldTypesProvider $provider;
    private mixed $originalApp;
    private mixed $originalContainer;

    protected function setUp(): void
    {
        $this->originalApp = \Craft::$app;
        $this->originalContainer = \Craft::$container;

        $this->provider = $this->createMock(FieldTypesProvider::class);
        // These APIs hydrate editor properties and must never run for schema generation.
        $this->provider->expects(self::never())->method('getTypes');
        $this->provider->expects(self::never())->method('getTypeShorthands');

        $container = $this->createMock(Container::class);
        $container->method('get')->with(FieldTypesProvider::class)->willReturn($this->provider);
        \Craft::$container = $container;

        $gql = $this->createMock(Gql::class);
        $gql->method('prepareFieldDefinitions')->willReturnCallback(static fn ($fields) => $fields);
        $config = $this->createMock(Config::class);
        $config->method('getGeneral')->willReturn(new GeneralConfig());
        \Craft::$app = new class($gql, $config) {
            public function __construct(public Gql $gql, private Config $config) {}

            public function getGql(): Gql
            {
                return $this->gql;
            }

            public function getConfig(): Config
            {
                return $this->config;
            }
        };

        GqlEntityRegistry::setPrefix('');
        GqlEntityRegistry::flush();
        TypeLoader::flush();
    }

    protected function tearDown(): void
    {
        GqlEntityRegistry::setPrefix('');
        GqlEntityRegistry::flush();
        TypeLoader::flush();
        \Craft::$app = $this->originalApp;
        \Craft::$container = $this->originalContainer;
    }

    public function testFieldTypesAndCustomAttributesArePreservedWithoutEditorMetadata(): void
    {
        $this->provider->method('getRegisteredTypes')->willReturn([
            TextField::class,
            NumberField::class,
            DropdownField::class,
            CheckboxesField::class,
            FileUploadField::class,
            OpinionScaleField::class,
            TableField::class,
            CustomGraphqlField::class,
        ]);

        $types = FieldGenerator::generateTypes();

        self::assertArrayHasKey('FreeformField_Text', $types);
        self::assertSame('Int', (string) $types['FreeformField_Number']->getField('minValue')->getType());
        self::assertSame('[String]', (string) $types['FreeformField_Checkboxes']->getField('values')->getType());
        self::assertSame('[String]', (string) $types['FreeformField_File']->getField('values')->getType());
        self::assertArrayHasKey('options', $types['FreeformField_Dropdown']->getFields());
        self::assertArrayHasKey('tableLayout', $types['FreeformField_Table']->getFields());

        $opinionAttributes = $types['FreeformField_OpinionScale']->getField('attributes')->getType();
        self::assertArrayHasKey('optionLabel', $opinionAttributes->getFields());
        self::assertArrayHasKey('option', $opinionAttributes->getFields());

        $customAttributes = $types['FreeformField_CustomGraphql']->getField('attributes')->getType();
        self::assertSame(
            ['container', 'input', 'label', 'instructions', 'error', 'customGroup'],
            array_keys($customAttributes->getFields()),
        );

        foreach (['Html', 'RichText', 'Confirm', 'Password', 'CreditCard'] as $legacyType) {
            self::assertArrayHasKey('FreeformField_'.$legacyType, $types);
        }

        $repeatedTypes = FieldGenerator::generateTypes();
        self::assertSame($types['FreeformField_CustomGraphql'], $repeatedTypes['FreeformField_CustomGraphql']);
    }

    #[TestWith([''])]
    #[TestWith(['QA_'])]
    public function testEveryBuiltInFieldGeneratesAValidSchema(string $prefix): void
    {
        $classes = [];
        $registration = $this->createMock(RegisterFieldTypesEvent::class);
        $registration->method('addBuiltInType')->willReturnCallback(static function (...$registered) use (&$classes): void {
            $classes = $registered;
        });
        $bundle = (new \ReflectionClass(FieldsBundle::class))->newInstanceWithoutConstructor();
        $bundle->registerFieldTypes($registration);
        $this->provider->method('getRegisteredTypes')->willReturn($classes);
        GqlEntityRegistry::setPrefix($prefix);

        $types = FieldGenerator::generateTypes();
        $field = $this->createMock(\Solspace\Freeform\Fields\FieldInterface::class);
        $field->method('getType')->willReturn('opinion-scale');
        $field->method('getHandle')->willReturn('example');
        $field->method('getLabel')->willReturn('Example');
        $queryType = new ObjectType(['name' => 'Query', 'fields' => [
            'field' => ['type' => FieldInterface::getType(), 'resolve' => static fn () => $field],
            'freeform' => ['type' => FreeformInterface::getType(), 'resolve' => static fn () => (object) ['version' => '5.17.6']],
        ]]);
        TypeLoader::registerType('Query', static fn () => $queryType);
        $schema = new Schema([
            'query' => $queryType,
            'types' => array_values($types),
            'typeLoader' => TypeLoader::class.'::loadType',
        ]);
        $schema->assertValid();
        $result = GraphQL::executeQuery($schema, '{field {__typename handle label} freeform {version}}')->toArray();
        self::assertArrayNotHasKey('errors', $result);
        self::assertSame([
            'field' => ['__typename' => $prefix.'FreeformField_OpinionScale', 'handle' => 'example', 'label' => 'Example'],
            'freeform' => ['version' => '5.17.6'],
        ], $result['data']);

        foreach (FieldTypeMetadata::getClasses() as $shorthand => $class) {
            $typeName = FieldType::getTypeFromString($shorthand);
            self::assertSame($prefix.$typeName, $types[$typeName]->name);
            $attributes = $types[$typeName]->getField('attributes')->getType();
            foreach (['container', 'input', 'label', 'instructions', 'error'] as $group) {
                self::assertArrayHasKey($group, $attributes->getFields(), $class);
            }
        }
    }

    public function testUnknownFieldRetainsDefaultAttributeGroups(): void
    {
        $this->provider->method('getRegisteredTypes')->willReturn([]);

        $type = AttributesGenerator::getAttributesForFieldType('unknown');
        self::assertSame(['container', 'input', 'label', 'instructions', 'error'], array_keys($type->getFields()));
        self::assertSame($type, AttributesGenerator::getAttributesForFieldType('unknown'));
    }

    public function testRegisteredCustomFieldInheritsAttributeGroups(): void
    {
        $this->provider->method('getRegisteredTypes')->willReturn([InheritedAttributesGraphqlField::class]);

        $type = AttributesGenerator::getAttributesForFieldType('inherited-graphql');
        self::assertArrayHasKey('customGroup', $type->getFields());
    }

    public function testMetadataReflectsCurrentRegistrationsWithoutStaleGlobalCache(): void
    {
        $this->provider->method('getRegisteredTypes')->willReturnOnConsecutiveCalls(
            [CustomGraphqlField::class, \stdClass::class],
            [TextField::class],
        );

        self::assertSame(['custom-graphql' => CustomGraphqlField::class], FieldTypeMetadata::getClasses());
        self::assertSame(['text' => TextField::class], FieldTypeMetadata::getClasses());
    }

    public function testMissingFieldTypeMetadataStillRaisesConfigurationError(): void
    {
        $this->provider->method('getRegisteredTypes')->willReturn([MissingMetadataGraphqlField::class]);

        $this->expectException(InvalidFieldTypeException::class);
        FieldGenerator::generateTypes();
    }
}

#[Type('Custom GraphQL', 'custom-graphql', '/missing/icon.svg', '/missing/preview.twig')]
class CustomGraphqlField extends TextField
{
    #[Attributes(tabs: [['handle' => 'customGroup'], ['handle' => 'input'], ['label' => 'No handle']])]
    protected FieldAttributesCollection $attributes;

    public function __construct()
    {
        throw new \LogicException('Schema generation must not instantiate fields.');
    }
}

#[Type('Inherited GraphQL', 'inherited-graphql', '/missing/icon.svg')]
class InheritedAttributesGraphqlField extends CustomGraphqlField {}

class MissingMetadataGraphqlField extends TextField {}
