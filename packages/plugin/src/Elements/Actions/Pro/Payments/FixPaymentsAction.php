<?php

namespace Solspace\Freeform\Elements\Actions\Pro\Payments;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;

class FixPaymentsAction extends ElementAction
{
    /**
     * {@inheritdoc}
     */
    public function getTriggerLabel(): string
    {
        return Freeform::t('Fix Missing Payments');
    }

    /**
     * Performs the action on any elements that match the given criteria.
     *
     * @throws FreeformException
     */
    public function performAction(ElementQueryInterface $query): bool
    {
        /** @var Submission[] $submissions */
        $submissions = $query->all();

        if ($submissions) {
            $form = $submissions[0]->getForm();

            if (!$form) {
                throw new FreeformException(Freeform::t('Form with ID {id} not found', ['id' => $form->getId()]));
            }

            $paymentFields = $form->getLayout()->getPaymentFields();
            if (!$paymentFields) {
                throw new FreeformException(Freeform::t('Form does not contain payment fields'));
            }

            $paymentFieldHandle = $paymentFields[0]->getHandle();
            $paymentProperties = $form->getPaymentProperties();
            $integrationId = $paymentProperties->getIntegrationId();
            $integration = Freeform::getInstance()->paymentGateways->getIntegrationObjectById($integrationId);

            if (!$integration) {
                throw new FreeformException(Freeform::t('Payments are not set up for the form'));
            }
        } else {
            throw new FreeformException(Freeform::t('No submissions found'));
        }

        foreach ($submissions as $submission) {
            $token = $submission->{$paymentFieldHandle}->getValue();
            //will recover payment data in case it is missing from DB
            $integration->getPaymentDetails($submission->id, $token);
        }

        return true;
    }
}
