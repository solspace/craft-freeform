<?php

namespace Solspace\Freeform\Tests\Bundles\GraphQL;

use craft\gql\GqlEntityRegistry;
use craft\models\GqlSchema;
use craft\services\Gql;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SubmissionGenerator;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Library\Collections\FieldCollection;

#[CoversClass(GqlPermissions::class)]
#[CoversClass(SubmissionGenerator::class)]
#[CoversClass(Submission::class)]
class GraphQLStateTest extends TestCase
{
    private mixed $previousApp;
    private GqlSchema $schema;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $gql = $this->createMock(Gql::class);
        $gql->method('getActiveSchema')->willReturnCallback(fn () => $this->schema);
        \Craft::$app = new class($gql) {
            public function __construct(private Gql $gql) {}

            public function getGql(): Gql
            {
                return $this->gql;
            }
        };
        GqlEntityRegistry::setPrefix('');
        GqlEntityRegistry::flush();
    }

    protected function tearDown(): void
    {
        GqlEntityRegistry::flush();
        SubmissionGenerator::$inputFields = [];
        SubmissionGenerator::$resolverFields = [];
        \Craft::$app = $this->previousApp;
    }

    public function testFormReadPermissionsFollowTheActiveSchema(): void
    {
        $this->schema = new GqlSchema(['scope' => ['freeformForms.all:read']]);
        self::assertNull(GqlPermissions::allowedFormUids());

        $this->schema = new GqlSchema(['scope' => ['freeformForms.form-b:read']]);
        self::assertSame(['form-b'], GqlPermissions::allowedFormUids());

        $this->schema = new GqlSchema(['scope' => []]);
        self::assertSame([], GqlPermissions::allowedFormUids());
        self::assertFalse(GqlPermissions::canQueryForms());
    }

    public function testSubmissionScopeUsesTheFormsActualUid(): void
    {
        $form = $this->createMock(Form::class);
        $form->method('getUid')->willReturn('form-a-uid');
        self::assertSame(['freeformSubmissions.form-a-uid'], Submission::gqlScopesByContext($form));
    }

    public function testSubmissionPermissionsRespectBothSupportedActions(): void
    {
        foreach (['create', 'save'] as $action) {
            $this->schema = new GqlSchema(['scope' => ['freeformSubmissions.form-a:'.$action]]);
            self::assertTrue(GqlPermissions::canCreateSubmissions('form-a'));
            self::assertFalse(GqlPermissions::canCreateSubmissions('form-b'));
            self::assertFalse(GqlPermissions::canCreateAllSubmissions());
            self::assertSame(['form-a'], GqlPermissions::allowedSubmissionUids());

            $this->schema = new GqlSchema(['scope' => ['freeformSubmissions.all:'.$action]]);
            self::assertTrue(GqlPermissions::canCreateAllSubmissions());
            self::assertNull(GqlPermissions::allowedSubmissionUids());
        }
        $this->schema = new GqlSchema(['scope' => []]);
        self::assertFalse(GqlPermissions::canCreateSubmissions('form-a'));
        self::assertSame([], GqlPermissions::allowedSubmissionUids());
    }

    public function testCachedSubmissionTypesKeepTheirOwnMutationInputs(): void
    {
        $a = $this->createMock(FieldInterface::class);
        $a->method('includeInGqlSchema')->willReturn(true);
        $a->method('getContentGqlHandle')->willReturn('fieldA');
        $a->method('getContentGqlType')->willReturn(Type::string());
        $b = $this->createMock(FieldInterface::class);
        $b->method('includeInGqlSchema')->willReturn(true);
        $b->method('getContentGqlHandle')->willReturn('fieldB');
        $b->method('getContentGqlType')->willReturn(Type::int());

        $formA = $this->formWithField('formA', $a);
        $formB = $this->formWithField('formB', $b);
        $cachedType = new ObjectType(['name' => 'formA_Submission', 'fields' => ['fieldA' => Type::string()]]);
        GqlEntityRegistry::createEntity('formA_Submission', $cachedType);

        SubmissionGenerator::setFields($formB);
        self::assertSame($cachedType, SubmissionGenerator::generateType($formA));
        self::assertSame([$a], SubmissionGenerator::getInputFields());
        self::assertSame(['fieldA' => Type::string()], SubmissionGenerator::getResolverFields());
    }

    private function formWithField(string $handle, FieldInterface $field): Form
    {
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection([$field]));
        $form = $this->createMock(Form::class);
        $form->method('__get')->with('handle')->willReturn($handle);
        $form->method('getLayout')->willReturn($layout);

        return $form;
    }
}
