<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

interface OAuth2RefreshTokenInterface extends OAuth2ConnectorInterface
{
    public const EVENT_AFTER_REFRESH = 'after-refresh';

    public function getRefreshToken(): string;

    public function setRefreshToken(string $refreshToken): self;

    public function getIssuedAt(): int;

    public function setIssuedAt(int $issuedAt): self;

    public function getExpiresIn(): int;

    public function setExpiresIn(int $expiresIn): self;
}
