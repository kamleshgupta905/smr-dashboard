<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class URLRules implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (preg_match('/PID=$/', $value)) {
            return;
        }
        
        if (preg_match('/PID=.*$/', $value)) {
            $fail('The :attribute must end with "PID=" only.');
        } else {
            $fail('The :attribute must end with "PID=".');
        }
    }
}
