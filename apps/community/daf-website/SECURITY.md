# Security Policy

## 🔒 Security Overview

This application handles patient consultation data and personal information. Security is critical to protect patient privacy and comply with healthcare regulations.

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it immediately:

**Email:** security@sentra.ai
**Response Time:** Within 24 hours
**Confidentiality:** Do not disclose publicly until resolved

## 🛡️ Security Measures

### Data Protection

- Patient data encrypted in transit and at rest
- Database access restricted to authorized personnel
- Input validation and sanitization
- SQL injection prevention with Prisma ORM

### Authentication & Authorization

- API key authentication for admin endpoints
- Environment-based secret management
- No hardcoded credentials

### Network Security

- HTTPS required in production
- Rate limiting on API endpoints
- CORS configuration for allowed origins

### Code Security

- TypeScript for type safety
- Regular dependency updates
- ESLint for code quality
- Zod for input validation

## 📋 Security Checklist

### Development

- [ ] No secrets in source code
- [ ] Environment variables used
- [ ] Input validation implemented
- [ ] HTTPS in production

### Deployment

- [ ] Database backups configured
- [ ] Monitoring and logging enabled
- [ ] Security headers applied
- [ ] Regular security scans

### Compliance

- [ ] PDPA Indonesia compliance
- [ ] Patient data handling guidelines
- [ ] Data retention policies

## 📞 Contact

For security-related questions:

- **Security Team:** security@sentra.ai
- **Emergency:** +62-XXX-XXXX

---

**Last Updated:** 2026-03-26
**Architected and built by Claudesy.**
