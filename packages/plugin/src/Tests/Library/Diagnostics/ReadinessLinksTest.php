<?php

namespace Solspace\Freeform\Tests\Library\Diagnostics;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Diagnostics\ReadinessLinks;

#[CoversClass(ReadinessLinks::class)]
class ReadinessLinksTest extends TestCase
{
    public function testUploadFindingsLinkToSubmissionOrForm(): void
    {
        $links = $this->links();
        $issue = ['context' => ['formId' => 7, 'submission' => 42]];
        $this->assertSame(['freeform/submissions/42'], array_column($links->getLinks($issue, 'uploads'), 'url'));
        unset($issue['context']['submission']);
        $this->assertSame(['freeform/forms/7'], array_column($links->getLinks($issue, 'uploads'), 'url'));
    }

    public function testGlobalTemplatesAndFormNotificationsHaveDifferentEditors(): void
    {
        $issue = ['context' => ['formId' => 7], 'template' => ['id' => '12', 'formId' => 0, 'exists' => true]];
        $this->assertSame(['freeform/forms/7/notifications', 'freeform/notifications/database/12'], array_column($this->links()->getLinks($issue, 'notifications'), 'url'));
        $issue['template']['formId'] = 7;
        $this->assertSame(['freeform/forms/7/notifications'], array_column($this->links()->getLinks($issue, 'notifications'), 'url'));
        $issue['template']['formId'] = 8;
        $this->assertSame(['freeform/forms/7/notifications', 'freeform/forms/8/notifications'], array_column($this->links()->getLinks($issue, 'notifications'), 'url'));
    }

    public function testSubmissionLinksUseTheCorrectSpamRouteAndSite(): void
    {
        $issue = ['context' => ['formId' => 7, 'submission' => 42, 'isSpam' => true, 'siteHandle' => 'german']];
        $this->assertSame(['freeform/spam/42?site=german'], array_column($this->links()->getLinks($issue, 'uploads'), 'url'));
        $issue['context']['isSpam'] = false;
        $this->assertSame(['freeform/submissions/42?site=german'], array_column($this->links()->getLinks($issue, 'uploads'), 'url'));
    }

    public function testUnavailableSubmissionsHaveIntegrityLinksInsteadOfDeadEditorLinks(): void
    {
        $issue = ['context' => ['formId' => 7, 'submission' => 42, 'submissionAvailable' => false, 'integrityCheck' => 'related']];
        $this->assertSame(['freeform/forms/7', 'freeform/settings/diagnostics#freeform-related-scan'], array_column($this->links()->getLinks($issue, 'uploads'), 'url'));
        $issue['context']['integrityCheck'] = 'orphan';
        $this->assertSame(['freeform/forms/7', 'freeform/settings/diagnostics#freeform-orphan-scan'], array_column($this->links()->getLinks($issue, 'uploads'), 'url'));
        $issue['context']['integrityCheck'] = 'console';
        $this->assertSame(['freeform/forms/7', 'https://docs.solspace.com/craft/freeform/v5/configuration/console-commands/#check-database-integrity'], array_column($this->links()->getLinks($issue, 'uploads'), 'url'));
        $this->assertSame([], $this->links([])->getLinks($issue, 'uploads'));
    }

    public function testFileNamesAreEncodedAndMissingTemplatesLinkToTheIndex(): void
    {
        $issue = ['context' => [], 'template' => ['id' => 'Team #1.twig', 'exists' => true]];
        $this->assertSame(['freeform/notifications/files/Team%20%231.twig'], array_column($this->links()->getLinks($issue, 'notifications'), 'url'));
        $issue['template']['exists'] = false;
        $this->assertSame(['freeform/notifications/files'], array_column($this->links()->getLinks($issue, 'notifications'), 'url'));
        $issue['template']['exists'] = true;
        $this->assertSame(['freeform/notifications/files'], array_column($this->links(allowFileTemplateEdit: false)->getLinks($issue, 'notifications'), 'url'));
    }

    public function testLinksRespectAccessAndIndividualFormPermissions(): void
    {
        $issue = ['context' => ['formId' => 7, 'submission' => 42]];
        $permissions = [Freeform::PERMISSION_SUBMISSIONS_ACCESS, Freeform::PERMISSION_SUBMISSIONS_MANAGE.':7'];
        $this->assertSame(['freeform/submissions/42'], array_column($this->links($permissions)->getLinks($issue, 'uploads'), 'url'));
        $this->assertSame([], $this->links([Freeform::PERMISSION_SUBMISSIONS_ACCESS, Freeform::PERMISSION_SUBMISSIONS_READ.':7'])->getLinks($issue, 'uploads'));
        $issue['context']['formId'] = 8;
        $this->assertSame([], $this->links($permissions)->getLinks($issue, 'uploads'));
        $issue = ['context' => ['formId' => 7], 'template' => ['id' => '12', 'formId' => 0, 'exists' => true]];
        $this->assertSame([], $this->links([])->getLinks($issue, 'notifications'));
        $this->assertSame(['freeform/notifications/database'], array_column($this->links([Freeform::PERMISSION_NOTIFICATIONS_ACCESS])->getLinks($issue, 'notifications'), 'url'));
    }

    public function testIntegrationAndQueueLinksRespectPermissions(): void
    {
        $issue = ['context' => ['formId' => 7, 'integration' => 3, 'integrationType' => 'other']];
        $this->assertSame(['freeform/forms/7/integrations', 'freeform/settings/other/3'], array_column($this->links()->getLinks($issue, 'integrations'), 'url'));
        $this->assertSame([], $this->links([])->getLinks($issue, 'integrations'));
        $this->assertSame(['freeform/forms/7/integrations'], array_column($this->links([Freeform::PERMISSION_FORMS_ACCESS, Freeform::PERMISSION_FORMS_MANAGE.':7'])->getLinks($issue, 'integrations'), 'url'));
        $issue['context']['integrationType'] = '../unsafe';
        $this->assertCount(1, $this->links()->getLinks($issue, 'integrations'));
        $this->assertSame(['utilities/queue-manager'], array_column($this->links(['utility:queue-manager'])->getLinks(['context' => []], 'queue'), 'url'));
        $this->assertSame([], $this->links([])->getLinks(['context' => []], 'queue'));
    }

    private function links(?array $permissions = null, bool $allowFileTemplateEdit = true): ReadinessLinks
    {
        return new ReadinessLinks(
            static fn ($permission) => null === $permissions || \in_array($permission, $permissions, true),
            static fn ($path) => $path,
            $allowFileTemplateEdit,
        );
    }
}
