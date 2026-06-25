<?php

namespace Solspace\Freeform\Tests\Services\Integrations;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
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

    private function createModel(int $id, bool $enabled, array $metadata): IntegrationModel
    {
        $model = new IntegrationModel();
        $model->id = $id;
        $model->enabled = $enabled;
        $model->metadata = $metadata;

        return $model;
    }
}
