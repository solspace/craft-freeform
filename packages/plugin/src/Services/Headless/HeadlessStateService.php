<?php

namespace Solspace\Freeform\Services\Headless;

use Solspace\Freeform\Form\Form;

/**
 * Carries headless multi-page navigation state between otherwise stateless requests.
 *
 * The token is encrypted and bound to a form UID, so clients cannot choose an
 * arbitrary page or page history.
 */
class HeadlessStateService
{
    private const TOKEN_VERSION = 1;
    private const TOKEN_TTL = 1800;

    public function restore(Form $form, ?string $token): bool
    {
        if (!$form->isMultiPage()) {
            return true;
        }

        if (!$token) {
            return false;
        }

        try {
            $payload = \Craft::$app->security->decryptByKey(
                base64_decode($token, true),
                $this->getEncryptionKey($form),
            );
            $state = json_decode($payload, true, flags: \JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            return false;
        }

        if (!\is_array($state)
            || self::TOKEN_VERSION !== ($state['version'] ?? null)
            || $form->getUid() !== ($state['formUid'] ?? null)
            || !\is_int($state['issuedAt'] ?? null)
            || time() > $state['issuedAt'] + self::TOKEN_TTL
        ) {
            return false;
        }

        $pageCount = \count($form->getPages());
        $pageIndex = $state['pageIndex'] ?? null;
        $history = $state['pageHistory'] ?? [];
        if (!\is_int($pageIndex) || $pageIndex < 0 || $pageIndex >= $pageCount || !\is_array($history)) {
            return false;
        }

        $validatedHistory = [];
        foreach ($history as $index) {
            if (!\is_int($index) || $index < 0 || $index >= $pageCount) {
                return false;
            }

            $validatedHistory[] = $index;
        }

        $form->getProperties()
            ->set(Form::PROPERTY_PAGE_INDEX, $pageIndex)
            ->set(Form::PROPERTY_PAGE_HISTORY, $validatedHistory)
        ;

        return true;
    }

    public function issue(Form $form): ?string
    {
        if (!$form->isMultiPage() || $form->isFinished()) {
            return null;
        }

        $state = [
            'version' => self::TOKEN_VERSION,
            'formUid' => $form->getUid(),
            'issuedAt' => time(),
            'pageIndex' => $form->getCurrentPageIndex(),
            'pageHistory' => $form->getProperties()->get(Form::PROPERTY_PAGE_HISTORY, []),
        ];

        return base64_encode(\Craft::$app->security->encryptByKey(
            json_encode($state, \JSON_THROW_ON_ERROR),
            $this->getEncryptionKey($form),
        ));
    }

    private function getEncryptionKey(Form $form): string
    {
        return \Craft::$app->getConfig()->getGeneral()->securityKey.$form->getUid();
    }
}
