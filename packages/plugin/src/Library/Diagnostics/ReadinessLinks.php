<?php

namespace Solspace\Freeform\Library\Diagnostics;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;

class ReadinessLinks
{
    private \Closure $can;
    private \Closure $url;

    public function __construct(?\Closure $can = null, ?\Closure $url = null, private bool $allowFileTemplateEdit = true)
    {
        $this->can = $can ?? PermissionHelper::checkPermission(...);
        $this->url = $url ?? UrlHelper::cpUrl(...);
    }

    public function getLinks(array $issue, string $kind): array
    {
        $links = [];
        $context = $issue['context'];
        $formId = (int) ($context['formId'] ?? 0);
        $submissionId = (int) ($context['submission'] ?? 0);
        if ('uploads' === $kind && $submissionId > 0 && ($this->can)(Freeform::PERMISSION_SUBMISSIONS_ACCESS)
            && ($this->canForForm(Freeform::PERMISSION_SUBMISSIONS_READ, $formId) || $this->canForForm(Freeform::PERMISSION_SUBMISSIONS_MANAGE, $formId))) {
            $links[] = $this->link('View submission', 'freeform/submissions/'.$submissionId);
        } elseif ($this->canEditForm($formId)) {
            $links[] = $this->link('notifications' === $kind ? 'Edit form notifications' : 'Edit form', 'freeform/forms/'.$formId.('notifications' === $kind ? '/notifications' : ''));
        }

        $template = $issue['template'] ?? null;
        if ('notifications' !== $kind || !$template) {
            return $links;
        }

        $templateFormId = (int) ($template['formId'] ?? 0);
        if ($templateFormId > 0) {
            if ($this->canEditForm($templateFormId)) {
                $link = $this->link('Edit form notifications', 'freeform/forms/'.$templateFormId.'/notifications');
                if (!\in_array($link, $links, true)) {
                    $links[] = $link;
                }
            }

            return $links;
        }
        if (!($this->can)(Freeform::PERMISSION_NOTIFICATIONS_ACCESS)) {
            return $links;
        }

        $identifier = (string) $template['id'];
        $database = ctype_digit($identifier);
        $path = 'freeform/notifications/'.($database ? 'database' : 'files');
        $editable = ($this->can)(Freeform::PERMISSION_NOTIFICATIONS_MANAGE) && ($database || $this->allowFileTemplateEdit);
        if (!empty($template['exists']) && $editable && !str_contains($identifier, '/') && !str_contains($identifier, '\\')) {
            $links[] = $this->link('Edit notification template', $path.'/'.rawurlencode($identifier));
        } else {
            $links[] = $this->link('View notification templates', $path);
        }

        return $links;
    }

    private function canEditForm(int $formId): bool
    {
        return $formId > 0 && ($this->can)(Freeform::PERMISSION_FORMS_ACCESS) && $this->canForForm(Freeform::PERMISSION_FORMS_MANAGE, $formId);
    }

    private function canForForm(string $permission, int $formId): bool
    {
        return ($this->can)($permission) || ($formId > 0 && ($this->can)(PermissionHelper::prepareNestedPermission($permission, $formId)));
    }

    private function link(string $label, string $path): array
    {
        return ['label' => Freeform::t($label), 'url' => ($this->url)($path)];
    }
}
