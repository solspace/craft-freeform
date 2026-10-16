<?php

namespace Solspace\Freeform\Tests\Bundles\Transformers\Builder\Form;

use Carbon\Carbon;
use craft\elements\User;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\Form\Form;
use yii\i18n\Formatter;

#[CoversClass(FormTransformer::class)]
class FormTransformerTest extends TestCase
{
    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    #[TestWith([1, false, true])]
    #[TestWith([2, true, true])]
    #[TestWith([2, false, false])]
    public function testOwnershipResolvesEachGetterOnceAndPreservesLinkPermissions(int $ownerId, bool $canEditUsers, bool $hasLink): void
    {
        $currentUser = $this->createMock(User::class);
        $currentUser->id = 1;
        $currentUser->expects($ownerId === 1 ? $this->never() : $this->exactly(2))
            ->method('can')->with('editUsers')->willReturn($canEditUsers)
        ;
        $owner = $this->createMock(User::class);
        $owner->id = $ownerId;
        $owner->method('getId')->willReturn($ownerId);
        $owner->method('getName')->willReturn('Form Owner');
        $owner->method('__get')->willReturnCallback(static fn (string $name) => match ($name) {
            'name' => $owner->getName(),
            'cpEditUrl' => $owner->getCpEditUrl(),
        });
        $owner->expects($hasLink ? $this->exactly(2) : $this->never())
            ->method('getCpEditUrl')->willReturn('https://example.test/admin/users/'.$ownerId)
        ;
        $this->configureApp($currentUser);

        $form = $this->createForm();
        $form->expects($this->once())->method('getCreatedBy')->willReturn($owner);
        $form->expects($this->once())->method('getUpdatedBy')->willReturn($owner);
        $ownership = $this->getOwnership($form);

        foreach (['created', 'updated'] as $key) {
            $this->assertSame('formatted date', $ownership[$key]['datetime']);
            $this->assertSame([
                'id' => $ownerId,
                'url' => $hasLink ? 'https://example.test/admin/users/'.$ownerId : null,
                'name' => 'Form Owner',
            ], $ownership[$key]['user']);
        }
    }

    public function testMissingOwnersPreserveDatesWithoutUserDetails(): void
    {
        $this->configureApp($this->createStub(User::class));
        $form = $this->createForm();
        $form->expects($this->once())->method('getCreatedBy')->willReturn(null);
        $form->expects($this->once())->method('getUpdatedBy')->willReturn(null);

        $this->assertSame([
            'created' => ['datetime' => 'formatted date'],
            'updated' => ['datetime' => 'formatted date'],
        ], $this->getOwnership($form));
    }

    private function configureApp(User $user): void
    {
        $formatter = $this->createMock(Formatter::class);
        $formatter->timeZone = 'UTC';
        $formatter->method('asDatetime')->willReturn('formatted date');
        \Craft::$app = new class($user, $formatter) {
            public function __construct(private User $user, private Formatter $formatter) {}

            public function getUser(): self
            {
                return $this;
            }

            public function getIdentity(): User
            {
                return $this->user;
            }

            public function getFormatter(): Formatter
            {
                return $this->formatter;
            }
        };
    }

    private function createForm(): Form
    {
        $form = $this->createMock(Form::class);
        $form->method('getDateCreated')->willReturn(new Carbon('2026-10-01', 'UTC'));
        $form->method('getDateUpdated')->willReturn(new Carbon('2026-10-02', 'UTC'));

        return $form;
    }

    private function getOwnership(Form $form): array
    {
        $reflection = new \ReflectionClass(FormTransformer::class);
        $transformer = $reflection->newInstanceWithoutConstructor();

        return $reflection->getMethod('getOwnership')->invoke($transformer, $form);
    }
}
