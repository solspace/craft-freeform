<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

trait OAuth2RefreshTokenTrait
{
    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $refreshToken = '';

    #[Flag(IntegrationInterface::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected int $issuedAt = 0;

    #[Flag(IntegrationInterface::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected int $expiresIn = 0;

    public function getRefreshToken(): string
    {
        return $this->refreshToken;
    }

    public function setRefreshToken(string $refreshToken): self
    {
        $this->refreshToken = $refreshToken;

        return $this;
    }

    public function getIssuedAt(): int
    {
        return $this->issuedAt;
    }

    public function setIssuedAt(int $issuedAt): self
    {
        $this->issuedAt = $issuedAt;

        return $this;
    }

    public function getExpiresIn(): int
    {
        return $this->expiresIn;
    }

    public function setExpiresIn(int $expiresIn): self
    {
        $this->expiresIn = $expiresIn;

        return $this;
    }
}
