# Development (Internal)

Internal development documentation for framework contributors and maintainers.

---

## 🔧 Core Development Documents

- **[Implementation Roadmap](./roadmap.md)** - Feature roadmap and implementation plan
- **[Architecture Decision Records (ADRs)](./adr-platform-server-refactoring.md)** - Design decisions and rationale
- **[Code Quality & Source Cleanliness](./code-quality.md)** - Best practices for maintaining clean, scalable code

---

## 🎯 Specifications & Planning

### Feature Specifications

- **[CLI Module Spec](./cli-module-spec.md)** - CLI support implementation specification
- **[Desktop Module Spec](./desktop-module-spec.md)** - Desktop app support specification

### Integration & Guidelines

- **[Agent Integration Spec](./agent-integration-spec.md)** - AI agent implementation guidelines
- **[Adapter Pattern](./adapter-pattern.md)** - Framework adapter pattern documentation
- **[Implementation Analysis](./implementation-analysis.md)** - Implementation strategy and analysis
- **[UJTi Integration Analysis](./ujti-integration-analysis.md)** - Integration points with UJTi project

---

## 📋 Development Roadmap

### Phase 1: Foundation (**ACTIVE**)

- ✅ Bun runtime compatibility
- ✅ Structured logging
- ✅ Configuration system
- ✅ Error handling enhancements
- ✅ Runtime detection

### Phase 2-3: Multi-Context (**DEFERRED**)

- ⏸️ CLI module (develop in Ujti first)
- ⏸️ Desktop module (develop in Ujti first)

### Phase 4-5: Package & Testing

- 📋 Package configuration
- 📋 Documentation finalization
- 📋 Comprehensive testing

See [Implementation Roadmap](./roadmap.md) for full details.

---

## 🛠️ Contributing

To contribute to Zacatl:

1. Review [Implementation Roadmap](./roadmap.md)
2. Check relevant ADRs in [Architecture Decision Records](./adr-platform-server-refactoring.md)
3. Follow [documentation standards](../standards/documentation.md)
4. Add tests for new features
5. Ensure all tests pass: `npm run test`

---

## 🔗 Related Links

- **[Standards](../standards/)** - Documentation and code standards
- **[Architecture](../architecture/)** - Framework architecture and design decisions
- **[GitHub Issues](https://github.com/sentzunhat/zacatl/issues)** - Bug reports and features

---

**Last Updated:** February 5, 2026
