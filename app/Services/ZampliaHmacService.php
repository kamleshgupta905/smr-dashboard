<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ZampliaHmacService
{
    protected ?string $secret;

    public function __construct(?string $secret = null)
    {
        $this->secret = $secret ?? config('zamplia.hmac_secret', '');
    }

    /**
     * Check if HMAC protection is active
     */
    public function isConfigured(): bool
    {
        return !empty($this->secret);
    }

    /**
     * Generate an HMAC-SHA256 signature for the given parameter payload
     */
    public function generateSignature(array $parameters, ?string $secret = null): string
    {
        $key = $secret ?: $this->secret;
        if (empty($key)) {
            return '';
        }

        // Remove any existing signature from array before hashing
        unset($parameters['hash'], $parameters['hmac'], $parameters['signature']);

        // Sort parameters alphabetically by key for deterministic hashing
        ksort($parameters);

        $payload = http_build_query($parameters);
        return hash_hmac('sha256', $payload, $key);
    }

    /**
     * Verify that incoming parameters match the provided HMAC signature
     */
    public function verifySignature(array $parameters, string $signature, ?string $secret = null): bool
    {
        $expected = $this->generateSignature($parameters, $secret);
        if (empty($expected)) {
            // If secret is not configured, pass-through with warning
            return true;
        }

        return hash_equals($expected, $signature);
    }

    /**
     * Attach an HMAC hash to a given URL
     */
    public function signUrl(string $url, ?string $secret = null): string
    {
        $key = $secret ?: $this->secret;
        if (empty($key)) {
            return $url;
        }

        $parts = parse_url($url);
        $queryParams = [];
        if (!empty($parts['query'])) {
            parse_str($parts['query'], $queryParams);
        }

        $signature = $this->generateSignature($queryParams, $key);
        $queryParams['hash'] = $signature;

        $queryString = http_build_query($queryParams);
        $baseUrl = ($parts['scheme'] ?? 'https') . '://' . ($parts['host'] ?? '') . ($parts['path'] ?? '');

        return $baseUrl . '?' . $queryString;
    }

    /**
     * Validate an incoming redirect or callback URL's hash
     */
    public function verifyUrl(string $url, ?string $secret = null): bool
    {
        $parts = parse_url($url);
        if (empty($parts['query'])) {
            return false;
        }

        parse_str($parts['query'], $queryParams);
        $givenSignature = $queryParams['hash'] ?? $queryParams['hmac'] ?? $queryParams['signature'] ?? null;

        if (!$givenSignature) {
            return false;
        }

        return $this->verifySignature($queryParams, $givenSignature, $secret);
    }
}
