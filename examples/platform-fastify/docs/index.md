# Documentation Index

Organized documentation structure for Fastify platform examples.

## 📁 Structure

```
examples/platform-fastify/
├── docs/                               # Shared documentation
│   ├── production-patterns.md          # 6.7KB - Framework patterns
│   ├── quick-start.md                  # 6.0KB - Complete walkthrough
│   └── validation-checklist.md         # 10.4KB - Transformation record
├── with-sqlite-react/
│   └── README.md                       # Quick reference + database setup
├── with-mongodb-react/
│   └── README.md                       # Quick reference + database setup
└── with-postgres-react/
    └── README.md                       # Quick reference + database setup
```

**Total**: ~40KB (lean, organized, no duplication)

## 📖 Documentation Guide

### For Quick Start

1. **[README.md](../README.md)** - Choose your example
2. **[docs/quick-start.md](quick-start.md)** - Detailed setup

### For Learning Patterns

1. **[docs/production-patterns.md](production-patterns.md)** - Read this first
2. Example-specific setup in each README:
   - **[with-sqlite-react/README.md](../with-sqlite-react/README.md#database-setup)**
   - **[with-mongodb-react/README.md](../with-mongodb-react/README.md#database-setup)**
   - **[with-postgres-react/README.md](../with-postgres-react/README.md#database-setup)**

### For Reference

- **Example READMEs** - Quick API reference, ports, commands
- **[docs/validation-checklist.md](validation-checklist.md)** - Transformation history

## ✅ Organization Principles

✅ **No Duplication**: Shared patterns in platform-fastify/docs
✅ **Database-Specific**: Setup guides in example/docs folders
✅ **Lean READMEs**: < 2.5KB, quick reference only
✅ **Byte Efficient**: Clear, concise, actionable content
✅ **Accurate**: All file paths and code references verified

## 🎯 Content Strategy

| File Type              | Purpose                    | Size Target |
| ---------------------- | -------------------------- | ----------- |
| README.md              | Quick start, API reference | < 3KB       |
| README.md              | Setup + database details   | < 4KB       |
| production-patterns.md | Framework patterns         | < 8KB       |
| quick-start.md         | Complete walkthrough       | < 7KB       |

## 📝 Maintenance

When updating examples:

1. **Code changes**: Update corresponding example README
2. **New patterns**: Add to production-patterns.md
3. **Breaking changes**: Update all READMEs
4. **File moves**: Update all internal links

## 🔗 External Links

- **Framework Documentation**: [../../../README.md](../../../README.md)
