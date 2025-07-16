# Resend Email Sending Documentation

## Send Email Endpoint
- **Method**: POST
- **Route**: `/emails`

## Required Parameters
1. `from`: Sender email address (supports "Name <email@domain.com>" format)
2. `to`: Recipient email address(es) - max 50 recipients
3. `subject`: Email subject line
4. Email content (choose one):
   - `html`: HTML email body
   - `text`: Plain text email body
   - `react`: React component (Node.js SDK only)

## Optional Parameters
- `bcc`: Blind carbon copy recipients
- `cc`: Carbon copy recipients
- `reply_to`: Reply-to email address
- `scheduled_at`: Schedule email send time
- `headers`: Custom email headers
- `attachments`: File attachments (max 40MB)
- `tags`: Custom metadata tags for organization

## Node.js Example
```javascript
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');

await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'hello world',
  html: '<p>it works!</p>',
});
```

## Python Example
```python
import os
import resend

resend.api_key = os.environ["RESEND_API_KEY"]

params: resend.Emails.SendParams = {
    "from": "Acme <onboarding@resend.dev>",
    "to": ["delivered@resend.dev"],
    "subject": "hello world",
    "html": "<strong>it works!</strong>",
}

email = resend.Emails.send(params)
print(email)
```

## Successful Response
```json
{
  "id": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"
}
```

## Additional Features
- Supports multiple recipient formats
- Idempotency key prevention
- Multilingual SDK support