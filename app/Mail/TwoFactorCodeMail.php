<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TwoFactorCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $code;
    public int $expiresMinutes;

    public function __construct(string $code, int $expiresMinutes = 5)
    {
        $this->code = $code;
        $this->expiresMinutes = $expiresMinutes;
    }

    public function build()
    {
        return $this->subject('Your verification code')
            ->view('emails.two_factor_code');
    }
}
