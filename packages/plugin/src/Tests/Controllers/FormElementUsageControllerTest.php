<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\db\Connection;
use craft\elements\Entry;
use craft\fieldlayoutelements\CustomField;
use craft\fields\Matrix;
use craft\models\FieldLayout;
use craft\models\Site;
use craft\services\Elements;
use craft\services\Fields;
use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\api\forms\ElementsController;
use Solspace\Freeform\FieldTypes\FormFieldType;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\FormsService;
use yii\db\Command;
use yii\db\QueryBuilder;
use yii\web\Response;

#[CoversClass(ElementsController::class)]
class FormElementUsageControllerTest extends TestCase
{
    #[TestWith([5, 0, 5])]
    #[TestWith([25, 5, 25])]
    #[TestWith([999, 0, 50])]
    #[TestWith([5, 200, 0])]
    public function testOnlyRequestedElementsAreLoaded(int $limit, int $offset, int $expectedLoaded): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;

        try {
            [$controller, $elements] = $this->fixture(['limit' => $limit, 'offset' => $offset]);
            $elements->expects(self::exactly($expectedLoaded))->method('getElementById')->willReturnCallback(function ($id) {
                $element = $this->getMockBuilder(Entry::class)->disableOriginalConstructor()->onlyMethods(['getStatus', 'getCpEditUrl'])->getMock();
                $element->id = $id;
                $element->title = 'Entry '.$id;
                $element->method('getStatus')->willReturn('live');
                $element->method('getCpEditUrl')->willReturn('/admin/entries/'.$id);

                return $element;
            });
            $response = $controller->actionGet(2)->data;
            self::assertSame(200, $response['total']);
            self::assertSame(min(50, $limit), $response['limit']);
            self::assertSame($offset, $response['offset']);
            self::assertCount($expectedLoaded, $response['items']);
            if ($expectedLoaded) {
                self::assertSame($offset + 1, $response['items'][0]['id']);
            }
        } finally {
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }

    #[TestWith([[]])]
    #[TestWith([['limit' => 5, 'offset' => 10]])]
    public function testSitesWithoutFreeformFieldsSkipLayoutsAndElementQueries(array $params): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;

        try {
            [$controller, $elements, $db] = $this->fixture($params, hasFields: false);
            $db->expects(self::never())->method('createCommand');
            $elements->expects(self::never())->method('getElementById');

            self::assertSame(isset($params['limit']) ? [
                'items' => [],
                'total' => 0,
                'offset' => 10,
                'limit' => 5,
            ] : [], $controller->actionGet(2)->data);
        } finally {
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }

    public function testUnusedFreeformFieldsReturnEmptyUsageWithoutElementQueries(): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;

        try {
            [$controller, $elements, $db] = $this->fixture(['limit' => 5], layouts: []);
            $db->expects(self::never())->method('createCommand');
            $elements->expects(self::never())->method('getElementById');

            self::assertSame([
                'items' => [],
                'total' => 0,
                'offset' => 0,
                'limit' => 5,
            ], $controller->actionGet(2)->data);
        } finally {
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }

    public function testMatrixLayoutsAreScannedWithoutFollowingRecursiveEntryTypes(): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;

        try {
            $matrix = $this->createMock(Matrix::class);
            $matrix->expects(self::never())->method('getEntryTypes');
            $matrixElement = $this->createMock(CustomField::class);
            $matrixElement->method('getField')->willReturn($matrix);
            $parentLayout = $this->createMock(FieldLayout::class);
            $parentLayout->expects(self::once())->method('getCustomFieldElements')->willReturn([$matrixElement]);

            $formElement = $this->createMock(CustomField::class);
            $formElement->uid = 'nested-field-uid';
            $formElement->method('getField')->willReturn($this->createMock(FormFieldType::class));
            $nestedLayout = $this->createMock(FieldLayout::class);
            $nestedLayout->expects(self::once())->method('getCustomFieldElements')->willReturn([$matrixElement, $formElement]);

            [$controller, $elements, $db] = $this->fixture(['limit' => 5, 'offset' => 200], [$parentLayout, $nestedLayout]);
            $db->expects(self::exactly(2))->method('createCommand')->with(self::callback(static fn ($sql) => str_contains($sql, 'nested-field-uid')));
            $elements->expects(self::never())->method('getElementById');

            self::assertSame([
                'items' => [],
                'total' => 200,
                'offset' => 200,
                'limit' => 5,
            ], $controller->actionGet(2)->data);
        } finally {
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }

    private function fixture(array $params, ?array $layouts = null, bool $hasFields = true): array
    {
        $request = $this->createMock(Request::class);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $request->method('getQueryParam')->willReturnCallback(static fn ($name, $default = null) => $params[$name] ?? $default);
        $request->method('get')->willReturn(null);
        $site = new Site(['id' => 1]);
        $sites = new class($site) {
            public function __construct(private Site $site) {}

            public function getCurrentSite(): Site
            {
                return $this->site;
            }
        };
        $field = $this->createMock(FormFieldType::class);
        $custom = $this->createMock(CustomField::class);
        $custom->uid = 'field-uid';
        $custom->method('getField')->willReturn($field);
        $layout = $this->createMock(FieldLayout::class);
        $layout->method('getCustomFieldElements')->willReturn([$custom]);
        $fields = $this->createMock(Fields::class);
        $fields->expects(self::once())->method('getFieldsByType')->with(FormFieldType::class)->willReturn($hasFields ? [$field] : []);
        $fields->expects($hasFields ? self::once() : self::never())->method('getAllLayouts')->willReturn($layouts ?? [$layout]);
        $db = $this->getMockBuilder(Connection::class)->setConstructorArgs([['dsn' => 'mysql:host=localhost;dbname=test']])->onlyMethods(['createCommand', 'getQueryBuilder'])->getMock();
        $db->method('getQueryBuilder')->willReturn(new QueryBuilder($db));
        $db->method('createCommand')->willReturnCallback(function ($sql) {
            $command = $this->createMock(Command::class);
            if (str_contains($sql, 'COUNT(*)')) {
                self::assertStringNotContainsString('LIMIT', $sql);
                $command->method('queryScalar')->willReturn('200');
            } else {
                self::assertStringContainsString('ORDER BY `es`.`elementId`', $sql);
                self::assertStringContainsString('[[es.siteId]]', $sql);
                preg_match('/LIMIT (\d+)(?: OFFSET (\d+))?/', $sql, $matches);
                self::assertNotEmpty($matches, 'Element hydration must use a limited query.');
                $limit = (int) $matches[1];
                $offset = (int) ($matches[2] ?? 0);
                $ids = $offset >= 200 ? [] : range($offset + 1, min(200, $offset + $limit));
                $command->method('queryColumn')->willReturn($ids);
            }

            return $command;
        });
        $elements = $this->createMock(Elements::class);
        \Craft::$app = \Yii::$app = new class($request, $sites, $db, $fields, $elements) {
            public function __construct(public Request $request, public object $sites, private Connection $db, private object $fields, public Elements $elements) {}

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getFields(): object
            {
                return $this->fields;
            }
        };
        $forms = $this->createMock(FormsService::class);
        $forms->method('getFormById')->willReturn($this->createMock(Form::class));
        $controller = $this->getMockBuilder(ElementsController::class)->disableOriginalConstructor()->onlyMethods(['getFormsService', 'asJson'])->getMock();
        $controller->request = $request;
        $controller->method('getFormsService')->willReturn($forms);
        $controller->method('asJson')->willReturnCallback(static fn ($data) => new Response(['charset' => 'UTF-8', 'data' => $data]));

        return [$controller, $elements, $db];
    }
}
