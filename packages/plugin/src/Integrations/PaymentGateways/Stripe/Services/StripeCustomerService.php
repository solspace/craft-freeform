<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services;

use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Stripe\Customer;

class StripeCustomerService
{
    public function getOrCreateCustomer(
        Stripe $integration,
        ?string $id,
        array $properties = [],
    ): Customer {
        $stripe = $integration->getStripeClient();
        $email = $properties['email'] ?? null;

        if (!empty($email) && !$id) {
            $existingCustomer = $stripe
                ->customers
                ->search([
                    'query' => "email: '{$email}'",
                    'limit' => 1,
                ])
                ->first()
            ;

            if ($existingCustomer) {
                $stripe
                    ->customers
                    ->update(
                        $existingCustomer->id,
                        $properties,
                    )
                ;

                return $existingCustomer;
            }
        }

        if ($id) {
            $stripe
                ->customers
                ->update(
                    $id,
                    $properties,
                )
            ;

            return $stripe->customers->retrieve($id);
        }

        return $stripe->customers->create($properties);
    }
}
