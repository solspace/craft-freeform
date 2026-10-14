<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use Carbon\Carbon;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Freeform;

class FormSchedule
{
    public const PENDING = 'pending';
    public const EXPIRED = 'expired';

    public static function getStatus(BehaviorSettings $settings, ?\DateTimeInterface $now = null): ?string
    {
        if (false === $settings->scheduleEnabled || (null === $settings->scheduleEnabled && !$settings->stopSubmissionsAfter)) {
            return null;
        }

        $now ??= Carbon::now();
        if ($settings->startSubmissionsAt && $now < $settings->startSubmissionsAt) {
            return self::PENDING;
        }

        $end = $settings->stopSubmissionsAfter;
        if ($end && null === $settings->scheduleEnabled) {
            $end = clone $end;
            $end->setTime(23, 59, 59);
        }

        return $end && $now > $end ? self::EXPIRED : null;
    }

    public static function validateSettings(object $settings): array
    {
        if (empty($settings->scheduleEnabled)) {
            return [];
        }

        $dates = [];
        $errors = [];
        foreach (['startSubmissionsAt', 'stopSubmissionsAfter'] as $key) {
            $value = $settings->{$key} ?? null;
            if (null === $value || '' === $value) {
                continue;
            }

            try {
                $dates[$key] = $value instanceof \DateTimeInterface ? Carbon::instance($value) : new Carbon($value);
            } catch (\Throwable) {
                $errors[$key] = [Freeform::t('Enter a valid date and time.')];
            }
        }

        if (isset($dates['startSubmissionsAt'], $dates['stopSubmissionsAfter']) && $dates['stopSubmissionsAfter'] <= $dates['startSubmissionsAt']) {
            $errors['stopSubmissionsAfter'] = [Freeform::t('The schedule end date must be after the start date.')];
        }

        return $errors;
    }
}
