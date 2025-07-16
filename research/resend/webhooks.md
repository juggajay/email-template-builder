# Resend Webhooks Documentation

## Webhook Overview
- **Purpose**: Push real-time email sending notifications
- **Delivery Method**: HTTPS with JSON payload
- **Key Use Cases**:
  1. Automatically manage mailing lists
  2. Create event-based alerts
  3. Store send events for custom reporting

## Webhook Configuration Steps
1. Create a local endpoint to receive POST requests
2. Register development webhook endpoint
3. Test endpoint functionality
4. Deploy to production
5. Register production webhook endpoint

## Webhook Handling Best Practices
- Respond with `HTTP 200 OK` to confirm successful event delivery
- Implement a route that can process incoming JSON payloads
- Ensure endpoint is publicly accessible via HTTPS

## Example Implementation (Next.js)
```typescript
export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const payload = req.body;
    console.log(payload);
    res.status(200);
  }
};
```

## Additional Resources
- Resend provides a [webhook code example repository](https://github.com/resend/resend-examples/tree/main/with-webhooks) for reference

## Common Webhook Events (inferred)
- `email.sent` - Email successfully sent
- `email.delivered` - Email delivered to recipient
- `email.bounced` - Email bounced
- `email.complained` - Spam complaint received
- `email.opened` - Email opened (if tracking enabled)
- `email.clicked` - Email link clicked (if tracking enabled)