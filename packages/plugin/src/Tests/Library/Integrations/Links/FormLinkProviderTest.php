<?php

namespace Solspace\Freeform\Tests\Library\Integrations\Links;

use Carbon\Carbon;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Links\FormLinkInterface;
use Solspace\Freeform\Library\Integrations\Links\FormLinkProvider;
use Solspace\Freeform\Services\FormsService;

#[CoversClass(FormLinkProvider::class)]
class FormLinkProviderTest extends TestCase
{
    #[DataProvider('references')]
    public function testOnlyCanonicalFormReferencesAreAccepted(mixed $reference, ?int $id): void
    {
        self::assertSame($id, (new FormLinkProvider())->getId($reference));
    }

    public static function references(): array
    {
        return [
            ['freeform:12', 12], ['freeform:1', 1], ['', null], [null, null],
            [12, null], [['freeform:12'], null], ['12', null], ['freeform:0', null],
            ['freeform:-12', null], ['freeform:01', null], ["freeform:12\n", null],
            ['freeform:12<script>', null], ['freeform:999999999999999999999', null],
        ];
    }

    public function testFormLookupUsesTheRequestedSite(): void
    {
        $form = $this->createMock(Form::class);
        $form->method('getDateArchived')->willReturn(null);
        $forms = $this->createMock(FormsService::class);
        $forms->expects(self::once())->method('getFormById')->with(12, 'french')->willReturn($form);

        self::assertSame($form, $this->provider($forms)->getForm('freeform:12', ['12'], 'french'));
    }

    public function testDisallowedOrMalformedReferencesDoNotLoadForms(): void
    {
        $forms = $this->createMock(FormsService::class);
        $forms->expects(self::never())->method('getFormById');
        $provider = $this->provider($forms);

        self::assertNull($provider->getForm('freeform:12', [13], 'english'));
        self::assertNull($provider->getForm('freeform:12', [], 'english'));
        self::assertNull($provider->getForm('https://example.com', '*', 'english'));
    }

    public function testDeletedAndArchivedFormsResolveToNull(): void
    {
        $archived = $this->createMock(Form::class);
        $archived->method('getDateArchived')->willReturn(new Carbon());
        $forms = $this->createMock(FormsService::class);
        $forms->method('getFormById')->willReturnMap([[12, 'english', null, null], [13, 'english', null, $archived]]);
        $provider = $this->provider($forms);

        self::assertNull($provider->getForm('freeform:12', '*', 'english'));
        self::assertNull($provider->getForm('freeform:13', '*', 'english'));
    }

    public function testTemplateHelperAcceptsAdapterReferencesAndIgnoresOtherValues(): void
    {
        $form = $this->createMock(Form::class);
        $link = $this->createMock(FormLinkInterface::class);
        $link->method('getForm')->willReturn($form);
        $provider = new FormLinkProvider();

        self::assertSame($form, $provider->fromLink($link));
        self::assertNull($provider->fromLink(null));
        self::assertNull($provider->fromLink('freeform:12'));
        self::assertNull($provider->fromLink((object) ['value' => 'freeform:12']));
    }

    private function provider(FormsService $forms): FormLinkProvider
    {
        return new class($forms) extends FormLinkProvider {
            public function __construct(private FormsService $service) {}

            protected function forms(): FormsService
            {
                return $this->service;
            }
        };
    }
}
