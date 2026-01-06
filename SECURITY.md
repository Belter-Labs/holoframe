# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Holoframe, please report it by:

**Email:** contact@belterlabs.com

**Please do NOT open a public issue for security vulnerabilities.**

We take security seriously and will respond within 48 hours to work with you on resolving the issue.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

Currently, we only support the latest version from the `main` branch.

## Security Considerations

### Widget Security
- Widget JavaScript is served from jsDelivr CDN (`cdn.jsdelivr.net`)
- OpenSea API requests go through Cloudflare Worker proxy
- **No API keys are exposed client-side**
- Rate limiting implemented via IP address (1-hour TTL)
- No persistent data collection or tracking

### What We Do
- ✅ Proxy all OpenSea API requests through Cloudflare Workers
- ✅ Rate limit requests by IP address
- ✅ Serve all assets over HTTPS
- ✅ No storage of user data

### What You Should Do
When embedding Holoframe widgets:
- Always load widgets over HTTPS
- Verify the jsDelivr URLs are correct before deploying
- Keep your OpenSea collection data up-to-date

## Known Limitations
- Rate limits: 100 NFT requests/hour per IP, 20 collection validations/hour per IP
- Temporary IP storage for rate limiting (auto-deleted after 1 hour)

## Questions?
For non-security questions, please [open an issue](https://github.com/Belter-Labs/holoframe/issues).
