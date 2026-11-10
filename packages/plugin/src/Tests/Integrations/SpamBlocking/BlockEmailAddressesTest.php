<?php

namespace Solspace\Freeform\Tests\Integrations\SpamBlocking;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Integrations\SpamBlocking\Emails\BlockEmailAddresses;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\DataObjects\SpamReason;

#[CoversClass(BlockEmailAddresses::class)]
class BlockEmailAddressesTest extends TestCase
{
    #[TestWith(['*@*.ru', 'person@example.ru', true])]
    #[TestWith(['*@*.ru', 'Person@Mail.EXAMPLE.RU', true])]
    #[TestWith(['*.ru', 'person@example.ru', true])]
    #[TestWith(['*@*.ru', 'person@example.ru.com', false])]
    #[TestWith(['*@*.ru', 'person@example.russian', false])]
    #[TestWith(['*@*.ru', 'person.ru@example.com', false])]
    #[TestWith(['*@*.su', 'person@example.su', true])]
    #[TestWith(['*@*.xyz', 'person@example.xyz', true])]
    #[TestWith(['*@*.top', 'person@example.top', true])]
    #[TestWith(['*@mailinator.com', 'test@mailinator.com', true])]
    #[TestWith(['*@mailinator.com', 'test@mailinator.com.au', false])]
    #[TestWith(['*@dropmail.me', 'test@dropmail.me', true])]
    #[TestWith(['*@*.dropmail.me', 'test@a.b.dropmail.me', true])]
    #[TestWith(['*@10mail.org', 'test@10mail.org', true])]
    #[TestWith(['person@example.com', 'person@example.com', true])]
    #[TestWith(['person@example.com', 'other-person@example.com', false])]
    #[TestWith(['person@example.com', 'person@example.com.au', false])]
    #[TestWith(['sales*@example.com', 'sales-team@example.com', true])]
    #[TestWith(['*@example.com', 'person@sub.example.com', false])]
    public function testPatternsMatchWholeAddressesInBothLists(string $pattern, string $address, bool $blocked): void
    {
        foreach (['defaultEmails', 'emails'] as $list) {
            $integration = $this->getMockBuilder(BlockEmailAddresses::class)
                ->disableOriginalConstructor()
                ->onlyMethods(['isCheckMxRecord', 'isErrorsBelowFields'])
                ->getMock()
            ;
            $integration->method('isCheckMxRecord')->willReturn(false);
            $integration->method('isErrorsBelowFields')->willReturn(false);
            (new \ReflectionProperty(BlockEmailAddresses::class, $list))->setValue($integration, [$pattern]);

            $field = $this->createMock(EmailField::class);
            $field->method('getValue')->willReturn($address);
            $field->method('getHandle')->willReturn('email');
            $layout = $this->createMock(FormLayout::class);
            $layout->method('getFields')->with(EmailField::class)->willReturn(new FieldCollection([$field]));
            $form = $this->createMock(Form::class);
            $form->method('getLayout')->willReturn($layout);
            $form->expects($blocked ? self::once() : self::never())
                ->method('markAsSpam')->with(SpamReason::TYPE_BLOCKED_EMAIL_ADDRESS, self::anything())
            ;
            $form->expects(self::never())->method('addError');

            $integration->validate($form, false);
        }
    }
}
