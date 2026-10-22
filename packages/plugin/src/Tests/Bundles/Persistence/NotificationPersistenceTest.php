<?php

namespace Solspace\Freeform\Tests\Bundles\Persistence;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Persistence\NotificationPersistence;
use Solspace\Freeform\Bundles\Persistence\Rules\NotificationRulesPersistence;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Records\Form\FormFieldRecord;

#[CoversClass(NotificationPersistence::class)]
#[CoversClass(NotificationRulesPersistence::class)]
class NotificationPersistenceTest extends TestCase
{
    #[DataProvider('invalidRules')]
    public function testInvalidConditionsBlockNotificationPersistence(array $rules): void
    {
        $event = $this->event($rules);
        $this->bundle()->handleNotificationSave($event);

        self::assertSame(400, $event->getStatus());
        self::assertSame([
            'notification' => ['rule' => ['Configure at least one condition for this notification.']],
        ], $event->getErrorsFor('notifications'));
    }

    public static function invalidRules(): array
    {
        $rule = ['uid' => 'rule', 'notification' => 'notification'];

        return [
            'empty conditions' => [[$rule + ['conditions' => []]]],
            'missing conditions' => [[$rule]],
            'blank field' => [[$rule + ['conditions' => [(object) ['field' => '']]]]],
            'missing field' => [[$rule + ['conditions' => [(object) []]]]],
            'deleted field' => [[$rule + ['conditions' => [(object) ['field' => 'deleted']]]]],
            'missing rule' => [[]],
            'wrong rule uid' => [[['uid' => 'other', 'notification' => 'notification', 'conditions' => [(object) ['field' => 'location']]]]],
            'wrong notification' => [[['uid' => 'rule', 'notification' => 'other', 'conditions' => [(object) ['field' => 'location']]]]],
        ];
    }

    public function testConditionWithExistingFieldIsAccepted(): void
    {
        $event = $this->event([[
            'uid' => 'rule',
            'notification' => 'notification',
            'conditions' => [(object) ['field' => 'location']],
        ]]);
        $this->validateRules($event);

        self::assertFalse($event->hasErrors());
    }

    public function testUnloadedRulesAreNotValidated(): void
    {
        $event = $this->event(null);
        $event->expects(self::never())->method('getFieldRecord');
        $this->validateRules($event);

        self::assertFalse($event->hasErrors());
    }

    public function testOtherNotificationTypesDoNotRequireConditions(): void
    {
        $event = $this->event([]);
        $event->getPayload()->notifications[0]->className = Admin::class;
        $this->validateRules($event);

        self::assertFalse($event->hasErrors());
    }

    public function testErrorsAreReportedForEveryInvalidNotification(): void
    {
        $event = $this->event([]);
        $other = clone $event->getPayload()->notifications[0];
        $other->uid = 'other';
        $event->getPayload()->notifications[] = $other;
        $this->bundle()->handleNotificationSave($event);

        self::assertSame(['notification', 'other'], array_keys($event->getErrorsFor('notifications')));
    }

    public function testValidNotificationDoesNotHideErrorsForAnotherNotification(): void
    {
        $event = $this->event([[
            'uid' => 'rule',
            'notification' => 'notification',
            'conditions' => [(object) ['field' => 'location']],
        ]]);
        $other = clone $event->getPayload()->notifications[0];
        $other->uid = 'other';
        $event->getPayload()->notifications[] = $other;
        $this->bundle()->handleNotificationSave($event);

        self::assertSame(['other'], array_keys($event->getErrorsFor('notifications')));
    }

    public function testRulePersistenceStopsAfterNotificationValidationFails(): void
    {
        $event = $this->event([]);
        $this->bundle()->handleNotificationSave($event);
        $bundle = (new \ReflectionClass(NotificationRulesPersistence::class))->newInstanceWithoutConstructor();
        $bundle->handleRuleSave($event);

        self::assertTrue($event->hasErrors());
    }

    private function event(?array $rules): PersistFormEvent
    {
        $payload = (object) [
            'notifications' => [(object) [
                'uid' => 'notification',
                'className' => Conditional::class,
                'rule' => 'rule',
            ]],
            'rules' => (object) ['notifications' => null === $rules ? null : array_map(static fn ($rule) => (object) $rule, $rules)],
        ];
        $event = $this->getMockBuilder(PersistFormEvent::class)
            ->setConstructorArgs([$payload, 7])
            ->onlyMethods(['getFieldRecord', 'getForm'])
            ->getMock()
        ;
        $event->expects(self::never())->method('getForm');
        $field = $this->createMock(FormFieldRecord::class);
        $event->method('getFieldRecord')->willReturnCallback(static fn ($uid) => 'location' === $uid ? $field : null);

        return $event;
    }

    private function bundle(): NotificationPersistence
    {
        return (new \ReflectionClass(NotificationPersistence::class))->newInstanceWithoutConstructor();
    }

    private function validateRules(PersistFormEvent $event): void
    {
        (new \ReflectionMethod(NotificationPersistence::class, 'validateRules'))->invoke($this->bundle(), $event);
    }
}
