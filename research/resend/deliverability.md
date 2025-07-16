# Resend Deliverability Best Practices

## Domain Configuration Best Practices
- Use subdomains (e.g., `updates.yourdomain.com`) to isolate sending reputation
- Verify domains by setting up SPF and DKIM DNS records

## Email Authentication Methods

### 1. SPF (Sender Policy Framework)
- Lists authorized IP addresses for sending emails
- Implemented via TXT record
- Helps prevent email spoofing

### 2. DKIM (DomainKeys Identified Mail)
- Provides a public key to verify email authenticity
- Implemented via TXT record
- Ensures emails are authorized by domain owner

### 3. DMARC (optional)
- Builds additional trust with mailbox providers

## Tracking Considerations
- Open and click tracking are disabled by default
- Open tracking uses a 1x1 pixel transparent GIF
- Click tracking modifies links to route through Resend's server

## Domain Status Stages
- `not_started`
- `pending`
- `verified`
- `failed`
- `temporary_failure`

## Key Recommendation
"We recommend using subdomains... to isolate your sending reputation."