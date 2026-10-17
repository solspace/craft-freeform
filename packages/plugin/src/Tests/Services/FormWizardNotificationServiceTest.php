<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormWizardNotificationService;

#[CoversClass(FormWizardNotificationService::class)]
class FormWizardNotificationServiceTest extends TestCase
{
    public function testFormAndMixedModesCreatePrivateDatabaseTemplatesWithoutGlobalManagement(): void
    {
        $settings = $this->getMockBuilder(Settings::class)->disableOriginalConstructor()->onlyMethods([])->getMock();
        foreach (['form', 'all'] as $mode) {
            $settings->emailTemplateMethod = $mode;
            $settings->emailTemplateStorageType = 'files';
            $settings->allowBuilderTemplateCreation = true;
            $policy = FormWizardNotificationService::policy($settings, true, false);
            self::assertTrue($policy['canCreateNotificationTemplates']);
            self::assertSame('form', $policy['notificationTemplateScope']);
            self::assertSame('database', $policy['notificationTemplateStorage']);
        }
        self::assertFalse(FormWizardNotificationService::policy($settings, false, true)['canCreateNotificationTemplates']);
        $settings->allowBuilderTemplateCreation = false;
        self::assertFalse(FormWizardNotificationService::policy($settings, true, true)['canCreateNotificationTemplates']);
    }

    public function testGlobalTemplatesRequireManagementAndFollowConfiguredStorage(): void
    {
        $settings = $this->getMockBuilder(Settings::class)->disableOriginalConstructor()->onlyMethods(['getAbsoluteEmailTemplateDirectory'])->getMock();
        $settings->method('getAbsoluteEmailTemplateDirectory')->willReturn(sys_get_temp_dir());
        $settings->emailTemplateMethod = 'global';
        $settings->emailTemplateStorageType = 'database';
        $settings->allowBuilderTemplateCreation = true;
        self::assertFalse(FormWizardNotificationService::policy($settings, true, false)['canCreateNotificationTemplates']);
        self::assertTrue(FormWizardNotificationService::policy($settings, true, true)['canCreateNotificationTemplates']);
        $settings->emailTemplateStorageType = 'files_database';
        $settings->emailTemplateDefault = 'files';
        $settings->allowFileTemplateEdit = false;
        self::assertFalse(FormWizardNotificationService::policy($settings, true, true)['canCreateNotificationTemplates']);
        $settings->allowFileTemplateEdit = true;
        $policy = FormWizardNotificationService::policy($settings, true, true);
        self::assertTrue($policy['canCreateNotificationTemplates']);
        self::assertSame('global', $policy['notificationTemplateScope']);
        self::assertSame('files', $policy['notificationTemplateStorage']);
    }
}
