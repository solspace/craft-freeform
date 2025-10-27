<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

trait OAuth2PasswordTrait
{
    #[Required]
    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_ENV_SUGGEST)]
    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        instructions: 'The username to use for authentication',
    )]
    protected string $username = '';

    #[Required]
    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_ENV_SUGGEST)]
    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        instructions: 'The password to use for authentication',
    )]
    protected string $password = '';

    public function getUsername(): string
    {
        return $this->getProcessedValue($this->username);
    }

    public function getPassword(): string
    {
        return $this->getProcessedValue($this->password);
    }
}
