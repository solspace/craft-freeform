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

namespace Solspace\Freeform\Services;

use craft\db\Query;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Events\Integrations\FetchPaymentGatewayTypesEvent;
use Solspace\Freeform\Library\Database\PaymentGatewayHandlerInterface;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\AbstractPaymentGatewayIntegration;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\DataObjects\PlanObject;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Records\Pro\Payments\SubscriptionPlanRecord;

// TODO: move to payments module?

class PaymentGatewaysService extends AbstractIntegrationService implements PaymentGatewayHandlerInterface
{
    private static ?array $integrations = null;

    /**
     * @return AbstractPaymentGatewayIntegration
     */
    public function getAllPaymentGatewayServiceProviders(): array
    {
        if (null === self::$integrations) {
            $event = new FetchPaymentGatewayTypesEvent();

            $this->trigger(self::EVENT_FETCH_TYPES, $event);
            $types = $event->getTypes();
            usort($types, fn (Type $a, Type $b) => strcmp($a->name, $b->name));

            $integrations = [];
            foreach ($types as $type) {
                $integrations[$type->class] = $type;
            }

            self::$integrations = $integrations;
        }

        return self::$integrations;
    }

    /**
     * Updates the fields of a given CRM integration.
     *
     * @param PlanObject[] $plans
     */
    public function updatePlans(AbstractPaymentGatewayIntegration $integration, array $plans): bool
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
    public function getPlans(AbstractPaymentGatewayIntegration $integration): array
    {
        $integration->setForceUpdate($this->isForceUpdate());

        return $integration->fetchPlans();
    }

    /**
     * {@inheritdoc}integrations
     */
    protected function getIntegrationType(): string
    {
        return IntegrationRecord::TYPE_PAYMENT_GATEWAY;
    }

    /**
     * {@inheritDoc}
     */
    protected function afterSaveHandler(IntegrationModel $model)
    {
        try {
            if ($model->getIntegrationObject()->checkConnection()) {
                /** @var AbstractPaymentGatewayIntegration $paymentGateway */
                $paymentGateway = $model->getIntegrationObject();
                $paymentGateway->setForceUpdate(true);
                $paymentGateway->getPlans();
            }
        } catch (IntegrationException $e) {
            \Craft::$app->session->setError($e->getMessage());
        }
    }
}
