<?php

namespace Solspace\Freeform\Tests\Services\Integrations;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Integrations\AI\ReferenceAiIntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Services\Integrations\IntegrationsService;

#[CoversClass(IntegrationsService::class)]
class IntegrationsServiceTest extends TestCase
{
    private IntegrationsService $service;

    protected function setUp(): void
    {
        $this->service = (new \ReflectionClass(IntegrationsService::class))->newInstanceWithoutConstructor();
    }

    public function testFormOverridesDoesNotLeakIntoOtherForms(): void
    {
        $shared = $this->createModel(2, true, ['version' => 'v3']);

        $disabledForForm = [
            2 => (object) [
                'id' => 10,
                'uid' => 'a',
                'enabled' => false,
                'metadata' => '{}',
            ],
        ];

        $result = $this->service->applyFormOverrides([$shared], $disabledForForm);

        self::assertNotSame($shared, $result[0]);
        self::assertFalse($result[0]->enabled);
        self::assertTrue($shared->enabled);
        self::assertSame(['version' => 'v3'], $shared->metadata);
        self::assertNull($shared->instanceId);
        self::assertNull($shared->instanceUid);
    }

    public function testFormOverridesIsIndependentAcrossAllFormCalls(): void
    {
        $shared = $this->createModel(2, true, []);

        $disabledForForm = [
            2 => (object) [
                'id' => 10,
                'uid' => 'a',
                'enabled' => false,
                'metadata' => '{}',
            ],
        ];

        $enabledForForm = [
            2 => (object) [
                'id' => 11,
                'uid' => 'b',
                'enabled' => true,
                'metadata' => '{}',
            ],
        ];

        $disabledResult = $this->service->applyFormOverrides([$shared], $disabledForForm);
        $enabledResult = $this->service->applyFormOverrides([$shared], $enabledForForm);

        self::assertFalse($disabledResult[0]->enabled);
        self::assertTrue($enabledResult[0]->enabled);
    }

    public function testAiOptionsOnlyIncludeEnabledAiIntegrations(): void
    {
        $enabled = $this->createMock(ReferenceAiIntegrationInterface::class);
        $enabled->method('isEnabled')->willReturn(true);
        $enabled->method('getModel')->willReturn('form-generation-model');
        $enabled->method('getReferenceMimeTypes')->willReturn(['application/pdf']);
        $disabled = $this->createMock(ReferenceAiIntegrationInterface::class);
        $disabled->method('isEnabled')->willReturn(false);
        $disabled->expects(self::never())->method('getModel');
        $models = [];
        foreach ([$enabled, $disabled] as $index => $integration) {
            $model = $this->createMock(IntegrationModel::class);
            $model->class = $integration::class;
            $model->id = $index + 1;
            $model->uid = 'integration-'.$index;
            $model->name = 'AI '.$index;
            $model->handle = 'ai'.$index;
            $model->method('getIntegrationObject')->willReturn($integration);
            $models[] = $model;
        }
        $other = $this->createMock(IntegrationModel::class);
        $other->class = \stdClass::class;
        $other->expects(self::never())->method('getIntegrationObject');
        $models[] = $other;
        $service = $this->getMockBuilder(IntegrationsService::class)->disableOriginalConstructor()->onlyMethods(['getAllIntegrations'])->getMock();
        $service->method('getAllIntegrations')->willReturn($models);
        self::assertSame([[
            'id' => 1, 'uid' => 'integration-0', 'name' => 'AI 0', 'handle' => 'ai0',
            'model' => 'form-generation-model', 'referenceMimeTypes' => ['application/pdf'],
        ]], $service->getEnabledAiIntegrationOptions());
    }

    private function createModel(int $id, bool $enabled, array $metadata): IntegrationModel
    {
        $model = new IntegrationModel();
        $model->id = $id;
        $model->enabled = $enabled;
        $model->metadata = $metadata;

        return $model;
    }
}
