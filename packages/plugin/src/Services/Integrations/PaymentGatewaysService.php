<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services\Integrations;

use craft\db\Query;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\DataObjects\PlanObject;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegration;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegrationInterface;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Records\Pro\Payments\SubscriptionPlanRecord;

// TODO: move to payments module?

class PaymentGatewaysService extends AbstractIntegrationService
{
    /**
     * Updates the fields of a given CRM integration.
     *
     * @param PlanObject[] $plans
     */
    public function updatePlans(PaymentGatewayIntegration $integration, array $plans): bool
    {
        $handles = [];
        foreach ($plans as $plan) {
            $handles[] = $plan->getId();
        }

        $id = $integration->getId();
        $existingPlans = (new Query())
            ->select(['resourceId'])
            ->from(SubscriptionPlanRecord::TABLE)
            ->where(['integrationId' => $id])
            ->column()
        ;

        $removableHandles = array_diff($existingPlans, $handles);
        $addableHandles = array_diff($handles, $existingPlans);
        $updatableHandles = array_intersect($handles, $existingPlans);

        foreach ($removableHandles as $handle) {
            // PERFORM DELETE
            \Craft::$app
                ->getDb()
                ->createCommand()
                ->delete(
                    SubscriptionPlanRecord::TABLE,
                    [
                        'integrationId' => $id,
                        'resourceId' => $handle,
                    ]
                )
                ->execute()
            ;
        }

        foreach ($plans as $plan) {
            // PERFORM INSERT
            if (\in_array($plan->getId(), $addableHandles, true)) {
                $record = new SubscriptionPlanRecord();
                $record->integrationId = $id;
                $record->resourceId = $plan->getId();
                $record->name = $plan->getName();
                $record->save();
            }

            // PERFORM UPDATE
            if (\in_array($plan->getId(), $updatableHandles, true)) {
                \Craft::$app
                    ->getDb()
                    ->createCommand()
                    ->update(
                        SubscriptionPlanRecord::TABLE,
                        [
                            'name' => $plan->getName(),
                        ],
                        [
                            'integrationId' => $id,
                            'resourceId' => $plan->getId(),
                        ]
                    )
                    ->execute()
                ;
            }
        }

        // Remove ForceUpdate flag
        \Craft::$app
            ->getDb()
            ->createCommand()
            ->update(
                IntegrationRecord::TABLE,
                ['forceUpdate' => 0],
                ['id' => $id]
            )
            ->execute()
        ;

        return true;
    }

    /**
     * Returns all ListObject of a particular Payment Gateway integration.
     *
     * @return SubscriptionPlanInterface[]
     */
    public function getPlans(PaymentGatewayIntegration $integration): array
    {
        $integration->setForceUpdate($this->isForceUpdate());

        return $integration->fetchPlans();
    }

    /**
     * {@inheritdoc}integrations
     */
    protected function getIntegrationType(): string
    {
        return IntegrationInterface::TYPE_PAYMENT_GATEWAY;
    }

    protected function getIntegrationInterface(): string
    {
        return PaymentGatewayIntegrationInterface::class;
    }
}
