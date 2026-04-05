# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Claudsy Memory, please report it to us as follows:

**Do not report security vulnerabilities through public GitHub issues.**

Instead, please email security@claudsy.com with details of the vulnerability.

We will acknowledge your report within 48 hours and provide a more detailed response within 7 days indicating our next steps.

## Security Considerations

This system handles memory data for AI agents. While it does not process sensitive personal information, please ensure:

- Ollama server is secured and not exposed publicly
- Data directories are properly protected
- No sensitive information is stored in memory facts
- Enable data encryption for sensitive deployments using CLAUDESY_ENCRYPTION_KEY
- Input validation is enforced through Pydantic models
- SSL certificate verification is enabled for Ollama connections

## Responsible Disclosure

We kindly ask that you:

- Give us reasonable time to fix the issue before public disclosure
- Avoid accessing or modifying user data
- Respect the privacy of other users

Thank you for helping keep Claudsy Memory secure.
