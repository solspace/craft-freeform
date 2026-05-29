<?php

namespace Solspace\Freeform\Bundles\ABTesting\Providers;

use Solspace\Freeform\Records\AbTests\AbTestAssignmentRecord;
use Solspace\Freeform\Records\AbTests\AbTestRecord;
use Solspace\Freeform\Records\AbTests\AbTestVariantRecord;

class ABTestVariantPersistence
{
    public function persistVariation(AbTestVariantRecord $record): bool
    {
        $test = $record->abTest;

        $this->persistCookie($test, $record);
        $this->persistUserAssignment($test, $record);

        return true;
    }

    public function getPersistedVariant(AbTestRecord $test): ?AbTestVariantRecord
    {
        $user = \Craft::$app->user->getIdentity();
        if ($user) {
            $assignment = AbTestAssignmentRecord::findOne([
                'userId' => $user->id,
                'abTestId' => $test->id,
            ]);

            if ($assignment) {
                return $assignment->abTestVariant;
            }
        }

        $name = $this->getCookieName($test);
        if (!isset($_COOKIE[$name])) {
            return null;
        }

        $variation = AbTestVariantRecord::findOne([
            'abTestId' => $test->id,
            'uid' => $_COOKIE[$name],
        ]);

        if (!$variation) {
            return null;
        }

        if ($user) {
            $this->persistUserAssignment($test, $variation);
        }

        return $variation;
    }

    private function persistCookie(AbTestRecord $test, AbTestVariantRecord $variant): void
    {
        $name = $this->getCookieName($test);
        $value = $variant->uid;

        $generalConfig = \Craft::$app->getConfig()->getGeneral();

        setcookie(
            $name,
            $value,
            [
                'expires' => (int) strtotime('+1 year'),
                'path' => '/',
                'domain' => $generalConfig->defaultCookieDomain,
                'secure' => true,
                'httponly' => true,
                'samesite' => $generalConfig->sameSiteCookieValue ?? 'Lax',
            ]
        );
    }

    private function persistUserAssignment(AbTestRecord $test, AbTestVariantRecord $variant): void
    {
        $user = \Craft::$app->getUser()->getIdentity();
        if (!$user) {
            return;
        }

        $record = AbTestAssignmentRecord::findOne([
            'userId' => $user->id,
            'abTestId' => $test->id,
        ]);

        if ($record) {
            return;
        }

        $record = new AbTestAssignmentRecord();
        $record->userId = $user->id;
        $record->abTestId = $test->id;
        $record->abVariantId = $variant->id;
        $record->save();
    }

    private function getCookieName(AbTestRecord $test): string
    {
        return 'freeform_ab_test_'.$test->uid;
    }
}
