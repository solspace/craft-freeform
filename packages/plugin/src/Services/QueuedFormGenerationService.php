<?php

namespace Solspace\Freeform\Services;

use craft\elements\User;
use craft\helpers\Queue;
use craft\services\UserPermissions;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\OpenAI\Versions\OpenAIV1;
use Solspace\Freeform\Jobs\GenerateFormJob;
use Solspace\Freeform\Library\AI\FormGenerationException;
use Solspace\Freeform\Library\AI\FormGenerationStore;
use Solspace\Freeform\Library\AI\ReferenceFile;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use yii\base\Event;

class QueuedFormGenerationService
{
    public function start(int $userId, string $requestId, string $prompt, ?string $name, string $integrationUid, array $files): array
    {
        // Validate configuration before accepting a background request.
        $integration = Freeform::getInstance()->formGeneration->validateRequest($prompt, $integrationUid, $files);
        $background = $integration instanceof OpenAIV1 && $integration->supportsBackgroundGeneration();
        $request = ['background' => $background, 'prompt' => $prompt, 'name' => $name, 'integrationUid' => $integrationUid, 'files' => [], 'siteIds' => array_map('intval', SitesHelper::getEditableSiteIds() ?? [])];
        foreach ($files as $file) {
            $request['files'][] = ['name' => $file->name, 'mimeType' => $file->mimeType, 'data' => $file->getBase64()];
        }

        try {
            $store = $this->store();
            $store->start($userId, $requestId, $request, static function (string $id) use ($background) {
                if ($background) {
                    return;
                }
                $jobId = Queue::push(new GenerateFormJob(['generationId' => $id]), ttr: 240);
                if (null === $jobId) {
                    throw new \RuntimeException('Could not enqueue generation.');
                }
            });
        } catch (\Throwable) {
            throw new FormGenerationException(Freeform::t('Could not queue form generation. Check the Queue Manager before starting another request.'));
        }

        if ($background) {
            $this->progress($userId, $requestId);
        }

        return $store->status($userId, $requestId);
    }

    public function status(int $userId, string $requestId): array
    {
        return $this->store()->status($userId, $requestId);
    }

    public function prune(): void
    {
        try {
            $this->store()->prune();
        } catch (\Throwable) {
            \Craft::warning('Could not prune expired AI generation files.', __METHOD__);
        }
    }

    public function progress(int $userId, string $requestId): array
    {
        $this->store()->advance($userId, $requestId, $this->generate());

        return $this->status($userId, $requestId);
    }

    public function execute(string $id): void
    {
        $this->store()->execute($id, $this->generate());
    }

    protected function permissionsForUser(User $user): array
    {
        // A persistent worker may otherwise retain revoked permissions from an earlier job.
        return $user->admin ? [] : (new UserPermissions())->getPermissionsByUserId((int) $user->id);
    }

    protected function store(): FormGenerationStore
    {
        return new FormGenerationStore(
            \Craft::$app->getPath()->getStoragePath().'/runtime/freeform-ai-generation',
            \Craft::$app->getConfig()->getGeneral()->securityKey,
            \Craft::$app->getSecurity(),
        );
    }

    private function generate(): \Closure
    {
        return function (array $request, callable $onResponseReady): int {
            $user = \Craft::$app->getUsers()->getUserById($request['userId']);
            $permissions = $user ? $this->permissionsForUser($user) : [];
            $can = static fn (string $permission) => $user && ($user->admin || \in_array(strtolower($permission), $permissions, true));
            if (!$user || !$user->active || $user->suspended || $user->locked
                || !$can(Freeform::PERMISSION_FORMS_CREATE)
                || !$can(Freeform::PERMISSION_INTEGRATIONS_ACCESS)
                || Freeform::getInstance()->edition()->isBelow(Freeform::EDITION_LITE)
            ) {
                throw new FormGenerationException(Freeform::t('Form generation is no longer permitted for this user.'));
            }
            $component = \Craft::$app->getUser();
            $previous = $component->getIdentity();
            $component->setIdentity($user);

            try {
                // Avoid cached editable-site IDs from a previous user/job, and never
                // expand the site scope accepted when this request was queued.
                $sites = array_filter(\Craft::$app->getSites()->getAllSites(true), static fn ($site) => \in_array((int) $site->id, $request['siteIds'], true) && (!\Craft::$app->getIsMultiSite() || $can('editSite:'.$site->uid)));
                $siteIds = array_map(static fn ($site) => (int) $site->id, array_values($sites));
                if (!$siteIds) {
                    throw new FormGenerationException(Freeform::t('Form generation is no longer permitted for this user.'));
                }

                return PermissionHelper::asAuthenticatedUser(static function () use ($request, $siteIds, $onResponseReady): int {
                    $files = array_map(static fn (array $file) => ReferenceFile::restore($file), $request['files']);

                    try {
                        $form = Freeform::getInstance()->formGeneration->generate($request['prompt'], $request['name'], $request['integrationUid'], referenceFiles: $files, siteIds: $siteIds, background: !empty($request['background']) ? ['responseId' => $request['responseId'] ?? null, 'onResponseReady' => $onResponseReady] : null);
                    } catch (FormGenerationException $exception) {
                        throw $exception;
                    } catch (\InvalidArgumentException $exception) {
                        throw new FormGenerationException($exception->getMessage());
                    }
                    $event = new PersistFormEvent((object) ['form' => (object) []], $form->getId());
                    $event->setForm($form);

                    try {
                        Event::trigger(FormsController::class, FormsController::EVENT_AFTER_SAVE_FORM, $event);
                    } catch (\Throwable) {
                        // The form was saved; a third-party after-save hook must not invite a duplicate retry.
                        \Craft::warning('An AI-generated form was saved, but an after-save handler failed.', __METHOD__);
                    }

                    return $form->getId();
                }, $permissions);
            } finally {
                $component->setIdentity($previous);
            }
        };
    }
}
