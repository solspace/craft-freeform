<?php

namespace Solspace\Freeform\Tests\Elements;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(Submission::class)]
class SubmissionHydrationTest extends TestCase
{
    use UsesCraft6Container;

    public function testConstructorLoadsStoredValuesFromItsOwnFormOnly(): void
    {
        $field = $this->createMock(FieldInterface::class);
        $field->method('getId')->willReturn(12);
        $field->method('getHandle')->willReturn('firstName');
        $field->expects(self::once())->method('setValue')->with('Jordan');
        $submission = $this->submission(new FieldCollection([$field]), [
            'formId' => 6, 'siteId' => 1,
            'form_6__first_name_12' => 'Jordan',
            'form_7__first_name_12' => 'Someone else',
        ]);

        self::assertSame(6, $submission->formId);
    }

    public function testConstructorDecodesStoredMultiValuesAndPreservesClearedValues(): void
    {
        $multi = $this->createMockForIntersectionOfInterfaces([FieldInterface::class, MultiValueInterface::class]);
        $multi->method('getId')->willReturn(13);
        $multi->method('getHandle')->willReturn('interests');
        $multi->expects(self::once())->method('setValue')->with(['news', 'events']);
        $cleared = $this->createMock(FieldInterface::class);
        $cleared->method('getId')->willReturn(14);
        $cleared->method('getHandle')->willReturn('message');
        $cleared->expects(self::once())->method('setValue')->with(null);

        $this->submission(new FieldCollection([$multi, $cleared]), [
            'formId' => 6, 'siteId' => 1,
            'form_6__interests_13' => '["news","events"]',
            'form_6__message_14' => null,
        ]);
    }

    private function submission(FieldCollection $fields, array $config): Submission
    {
        return new class($fields, $config) extends Submission {
            public function __construct(private FieldCollection $fields, array $config)
            {
                parent::__construct($config);
            }

            public function getFieldCollection(): FieldCollection
            {
                return $this->fields;
            }
        };
    }
}
