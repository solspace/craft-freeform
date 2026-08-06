<?php

namespace Solspace\Freeform\Tests\Integrations\Webhooks\Generic;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Integrations\Webhooks\Generic\Generic;
use Solspace\Freeform\Library\Collections\FieldCollection;

#[CoversClass(Generic::class)]
class GenericTest extends TestCase
{
    public function testSubmissionFieldsAreUsedWhenAvailable(): void
    {
        $layoutField = $this->createField('layout value');
        $submissionField = $this->createField('submission value');

        $layout = $this->createConfiguredMock(FormLayout::class, [
            'getFields' => new FieldCollection([$layoutField]),
        ]);
        $submission = $this->createConfiguredMock(Submission::class, [
            'getFieldCollection' => new FieldCollection([$submissionField]),
        ]);
        $form = $this->createConfiguredMock(Form::class, [
            'getLayout' => $layout,
            'getSubmission' => $submission,
        ]);

        $fields = $this->getFields($form);

        self::assertSame([$submissionField], iterator_to_array($fields));
    }

    public function testLayoutFieldsAreUsedWithoutSubmission(): void
    {
        $layoutField = $this->createField('layout value');

        $layout = $this->createConfiguredMock(FormLayout::class, [
            'getFields' => new FieldCollection([$layoutField]),
        ]);
        $form = $this->createConfiguredMock(Form::class, [
            'getLayout' => $layout,
            'getSubmission' => null,
        ]);

        $fields = $this->getFields($form);

        self::assertSame([$layoutField], iterator_to_array($fields));
    }

    private function createField(string $value): FieldInterface
    {
        return $this->createConfiguredMock(FieldInterface::class, [
            'getValue' => $value,
        ]);
    }

    private function getFields(Form $form): FieldCollection
    {
        $reflection = new \ReflectionClass(Generic::class);
        $integration = $reflection->newInstanceWithoutConstructor();
        $method = $reflection->getMethod('getFields');

        return $method->invoke($integration, $form);
    }
}
