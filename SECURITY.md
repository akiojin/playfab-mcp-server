# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of our project seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### Reporting Process

1. **DO NOT** create a public GitHub issue for the vulnerability.
2. Report security issues via GitHub's private vulnerability reporting:
   - Go to the **Security** tab of this repository
   - Click on **Report a vulnerability**
   - Provide detailed information about the vulnerability
3. Provide as much information as possible about the vulnerability:
   - Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
   - Full paths of source file(s) related to the manifestation of the issue
   - The location of the affected source code (tag/branch/commit or direct URL)
   - Any special configuration required to reproduce the issue
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit it

### What to Expect

- You will receive a response from us within 48 hours acknowledging receipt of your report.
- We will work with you to understand and validate your report.
- We will keep you informed of our progress.
- We will credit you for your discovery when we announce the vulnerability (unless you prefer to remain anonymous).

## Security Best Practices

When using this PlayFab MCP Server, please follow these security best practices:

### API Keys and Secrets

1. **Never commit credentials**: Always use environment variables for API keys and secrets.
2. **Use `.env` files locally**: Keep them in `.gitignore`.
3. **Rotate keys regularly**: Change your PlayFab Developer Secret Key periodically.
4. **Use least privilege**: Only grant the minimum required permissions.

### Server Security

1. **Keep dependencies updated**: Regularly run `npm audit` and update packages.
2. **Use HTTPS**: Always use encrypted connections in production.
3. **Validate inputs**: Never trust user input without validation.
4. **Rate limiting**: Implement rate limiting to prevent abuse.

### PlayFab Specific

1. **Server-side only**: This MCP server should only run on trusted servers, never on client devices.
2. **Title-specific keys**: Use different keys for different PlayFab titles.
3. **Monitor usage**: Regularly check PlayFab usage logs for anomalies.
4. **IP whitelisting**: Consider restricting API access by IP when possible.

## Known Security Considerations

### Environment Variables

The server requires sensitive PlayFab credentials via environment variables:
- `PLAYFAB_TITLE_ID`: Your PlayFab Title ID
- `PLAYFAB_DEV_SECRET_KEY`: Your PlayFab Developer Secret Key

**Risk**: If these are exposed, an attacker could access your PlayFab title's data.

**Mitigation**: 
- Store credentials securely (e.g., using secret management services)
- Never log or output these values
- Use read-only file permissions for `.env` files

### Rate Limiting

PlayFab APIs have rate limits that could be exploited for denial of service:
- Player Entity APIs: 60-100 requests per minute
- Title Entity APIs: Higher limits but still finite

**Risk**: Malicious users could exhaust your API quota.

**Mitigation**: 
- Implement request throttling
- Monitor API usage
- Use caching where appropriate

## Compliance

This project aims to comply with:
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- PlayFab's Terms of Service and Data Processing Agreement

Please ensure your usage also complies with these regulations.

## Updates and Patches

- Security patches are released as soon as possible after discovery
- Critical vulnerabilities trigger immediate patch releases
- Non-critical security updates are included in regular releases

## Contact

For security concerns:
- **Primary**: Use GitHub's private vulnerability reporting feature (see "Reporting a Vulnerability" section above)
- **Alternative**: Create an issue with the `security` label (for non-sensitive security discussions only)

For general bugs and feature requests, please use the GitHub issue tracker.

## Security Maintainers

This project's security is maintained by:
- Project maintainers via GitHub repository settings
- Community contributors who report vulnerabilities responsibly

If you need to verify the authenticity of security communications, please check that they come from repository maintainers with write access.