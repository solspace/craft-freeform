<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use Carbon\Carbon;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class SubmissionLimit
{
    public const PERIODS = ['total', 'day', 'week', 'month', 'year'];

    public static function isBuilderEnabled(Form $form): bool
    {
        return $form->getSettings()->getBehavior()->submissionLimitEnabled
            && Freeform::getInstance()->edition()->isAtLeast(Freeform::EDITION_LITE);
    }

    public static function resolve(Form $form): ?array
    {
        $properties = $form->getProperties();
        $behavior = $form->getSettings()->getBehavior();
        $overrideValue = $properties->get('submissionLimit');
        $override = \array_key_exists('submissionLimit', $properties->toArray()) || null !== $overrideValue;
        if (!$override && !self::isBuilderEnabled($form)) {
            return null;
        }

        $limit = $override ? $overrideValue : $behavior->submissionLimit;
        if (null === $limit) {
            return null;
        }

        // Existing numeric Twig limits retain their all-time semantics, including
        // zero (closed). An explicit null disables a builder limit.
        if (!\is_int($limit)) {
            $number = is_numeric($limit) || \is_bool($limit) ? ceil((float) $limit) : 0;
            $limit = $number >= \PHP_INT_MAX ? \PHP_INT_MAX : (int) $number;
        }
        $period = $properties->get('submissionLimitPeriod', $override ? 'total' : $behavior->submissionLimitPeriod);

        return ['limit' => $limit, 'period' => \in_array($period, self::PERIODS, true) ? $period : 'total'];
    }

    public static function getCount(Form $form, ?\DateTimeInterface $now = null): int
    {
        $config = self::resolve($form);
        [$start, $end] = self::getPeriodRange($config['period'] ?? 'total', $now);

        $service = Freeform::getInstance()->submissions;

        return $start ? $service->getSubmissionCountInRange([$form->getId()], null, false, $start, $end) : $service->getSubmissionCount([$form->getId()]);
    }

    public static function isReached(Form $form): bool
    {
        $config = self::resolve($form);

        return null !== $config && self::getCount($form) >= $config['limit'];
    }

    /** Calendar boundaries are local; the database count converts them to UTC. */
    public static function getPeriodRange(string $period, ?\DateTimeInterface $now = null, ?\DateTimeZone $timezone = null, ?int $weekStart = null): array
    {
        if ('total' === $period) {
            return [null, null];
        }

        $timezone ??= new \DateTimeZone(\Craft::$app->getTimeZone());
        $now ??= Carbon::now($timezone);
        $start = \DateTimeImmutable::createFromInterface($now)->setTimezone($timezone)->setTime(0, 0);

        switch ($period) {
            case 'week':
                $weekStart ??= \Craft::$app->getConfig()->getGeneral()->defaultWeekStartDay;
                $days = ((int) $start->format('w') - $weekStart + 7) % 7;
                $start = $start->modify("-{$days} days");
                $end = $start->modify('+1 week');

                break;

            case 'month':
                $start = $start->modify('first day of this month');
                $end = $start->modify('+1 month');

                break;

            case 'year':
                $start = $start->setDate((int) $start->format('Y'), 1, 1);
                $end = $start->modify('+1 year');

                break;

            default:
                $end = $start->modify('+1 day');
        }

        return [$start, $end];
    }

    public static function validateSettings(object $settings, bool $storeData = true): array
    {
        if (empty($settings->submissionLimitEnabled) || !Freeform::getInstance()->edition()->isAtLeast(Freeform::EDITION_LITE)) {
            return [];
        }

        $errors = [];
        if (false === filter_var($settings->submissionLimit ?? null, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) {
            $errors['submissionLimit'] = [Freeform::t('Enter a whole number greater than zero.')];
        }
        if (!\in_array($settings->submissionLimitPeriod ?? 'total', self::PERIODS, true)) {
            $errors['submissionLimitPeriod'] = [Freeform::t('Choose a valid submission limit period.')];
        }
        if (!$storeData) {
            $errors['submissionLimitEnabled'] = [Freeform::t('Submission limits require stored submissions.')];
        }

        return $errors;
    }
}
