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
        if ('queue' === $kind) {
            return ($context['queueAvailable'] ?? true) && ($this->can)('utility:queue-manager') ? [$this->link('View Queue Manager', 'utilities/queue-manager')] : [];
        }
        if ('integrations' === $kind) {
            $id = (int) ($context['integration'] ?? 0);
            $handle = $context['integrationHandle'] ?? '';
            if ($this->canEditForm($formId)) {
                $path = 'freeform/forms/'.$formId.'/integrations';
                if ($id > 0 && \is_string($handle) && preg_match('/^[a-zA-Z0-9_-]+$/D', $handle)) {
                    $path .= '/'.$id.'/'.rawurlencode($handle);
                }
                $links[] = $this->link('Edit form', $path);
            }
            $type = $context['integrationType'] ?? '';
            $class = $context['integrationClass'] ?? '';
            if ($id > 0 && preg_match('/^[a-z-]+$/D', $type) && preg_match('/^[a-zA-Z0-9]+$/D', $class) && ($this->can)(Freeform::PERMISSION_INTEGRATIONS_ACCESS) && ($this->can)(Freeform::PERMISSION_INTEGRATIONS_MANAGE)) {
                $links[] = $this->link('Edit integration', 'freeform/integrations/'.$type.'/'.$class.'/'.$id);
            }

            return $links;
        }
        $submissionId = (int) ($context['submission'] ?? 0);
        if ('uploads' === $kind && $submissionId > 0 && ($context['submissionAvailable'] ?? true) && ($this->can)(Freeform::PERMISSION_SUBMISSIONS_ACCESS)
            && $this->canForForm(Freeform::PERMISSION_SUBMISSIONS_MANAGE, $formId)) {
            $path = 'freeform/'.(!empty($context['isSpam']) ? 'spam' : 'submissions').'/'.$submissionId;
            if (!empty($context['siteHandle'])) {
                $path .= '?site='.rawurlencode($context['siteHandle']);
            }
            $links[] = $this->link('View submission', $path);
        } elseif ($this->canEditForm($formId)) {
            $links[] = $this->link('notifications' === $kind ? 'Edit form notifications' : 'Edit form', 'freeform/forms/'.$formId.('notifications' === $kind ? '/notifications' : ''));
        }

        if ('uploads' === $kind && !empty($context['integrityCheck']) && ($this->can)(Freeform::PERMISSION_SETTINGS_ACCESS)) {
            if ('console' === $context['integrityCheck']) {
                $links[] = $this->link('Database Integrity & Repair Guide', 'https://docs.solspace.com/craft/freeform/v5/configuration/console-commands/#check-database-integrity');
            } else {
                $related = 'related' === $context['integrityCheck'];
                $links[] = $this->link($related ? 'Related Data Integrity' : 'Orphaned Submissions', 'freeform/settings/diagnostics#freeform-'.($related ? 'related' : 'orphan').'-scan');
            }
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
