<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verification Code</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:#0f172a;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:bold;">
                Two-Factor Verification
              </td>
            </tr>
            <tr>
              <td style="padding:24px;color:#0f172a;">
                <p style="margin:0 0 12px 0;font-size:16px;">Hi,</p>
                <p style="margin:0 0 16px 0;font-size:14px;color:#334155;">
                  Use the following verification code to complete your sign-in. This code is valid for
                  {{ $expiresMinutes }} minutes.
                </p>
                <div style="text-align:center;margin:20px 0;">
                  <span style="display:inline-block;padding:14px 22px;border:1px dashed #94a3b8;border-radius:8px;font-size:22px;letter-spacing:4px;font-weight:bold;color:#0f172a;">
                    {{ $code }}
                  </span>
                </div>
                <p style="margin:16px 0 0 0;font-size:12px;color:#64748b;">
                  If you did not request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:16px 24px;color:#64748b;font-size:12px;">
                This is an automated message. Please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
