<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class LogAdminActivity
{
    private const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'token',
        'access_token',
        'refresh_token',
        'secret',
        'otp',
        'code',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $method = strtoupper($request->method());
        if (!in_array($method, self::MUTATING_METHODS, true)) {
            return $next($request);
        }

        $response = $next($request);

        $user = $request->user();
        if (!$user || ($user->role ?? null) !== 'admin') {
            return $response;
        }

        $route = $request->route();
        $routeName = $route?->getName();
        $statusCode = (int) $response->getStatusCode();
        $event = $statusCode >= 400 ? 'failed' : 'success';
        $description = $routeName
            ? "admin_action:{$routeName}"
            : "admin_action:{$method} " . ($route?->uri() ?? $request->path());

        $properties = [
            'method' => $method,
            'path' => '/' . ltrim($request->path(), '/'),
            'route_name' => $routeName,
            'status_code' => $statusCode,
            'ip' => $request->ip(),
            'query' => $request->query(),
            'payload' => $this->sanitizePayload($request),
            'route_params' => $this->sanitizeRouteParameters($route?->parameters() ?? []),
        ];

        try {
            activity('admin')
                ->causedBy($user)
                ->withProperties($properties)
                ->event($event)
                ->log($description);
        } catch (Throwable) {
            // Do not block the main request if activity logging fails.
        }

        return $response;
    }

    private function sanitizePayload(Request $request): array
    {
        $payload = $request->except(self::SENSITIVE_KEYS);

        if (!empty($request->allFiles())) {
            $filesSummary = [];
            foreach ($request->allFiles() as $key => $files) {
                $filesSummary[$key] = is_array($files) ? count($files) : 1;
            }
            $payload['_files'] = $filesSummary;
        }

        return $this->normalizeValue($payload);
    }

    private function sanitizeRouteParameters(array $params): array
    {
        $result = [];
        foreach ($params as $key => $value) {
            if (is_scalar($value) || $value === null) {
                $result[$key] = $value;
                continue;
            }

            if (is_object($value) && method_exists($value, 'getKey')) {
                $result[$key] = class_basename($value) . '#' . $value->getKey();
                continue;
            }

            $result[$key] = is_object($value) ? class_basename($value) : '[complex]';
        }

        return $result;
    }

    private function normalizeValue(mixed $value, int $depth = 0): mixed
    {
        if ($depth > 3) {
            return '[truncated]';
        }

        if (is_string($value)) {
            return mb_strlen($value) > 300 ? mb_substr($value, 0, 300) . '...' : $value;
        }

        if (!is_array($value)) {
            return $value;
        }

        $normalized = [];
        $count = 0;
        foreach ($value as $key => $item) {
            if ($count >= 40) {
                $normalized['__truncated__'] = true;
                break;
            }
            $normalized[$key] = $this->normalizeValue($item, $depth + 1);
            $count++;
        }

        return $normalized;
    }
}
