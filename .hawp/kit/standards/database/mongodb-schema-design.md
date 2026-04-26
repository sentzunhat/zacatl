# MongoDB Schema Design Guidelines

Streamlined, efficient, and maintainable MongoDB schema design patterns and best practices.

**Status:** Standard level - Recommended

---

## Key Principles

### Favor Embedding

Embed related data within a single document to improve performance by reducing the need for additional queries.

```javascript
// ✅ Good: Embed address within user document
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com",
  address: {
    street: "123 Main St",
    city: "Portland",
    state: "OR",
    zip: "97201"
  }
}

// ✗ Avoid: Reference when embedding is appropriate
// User document with addressId reference requires additional lookup
```

**Rationale:** Embedded documents ensure that related data is retrieved together, enhancing read performance in one-to-few or one-to-many relationships.

---

### Minimalism and Simplicity

Keep schemas simple and minimal. Use nested objects to reflect natural data hierarchies.

```javascript
// ✅ Good: Simple, minimal structure
{
  _id: ObjectId("..."),
  title: "My Post",
  content: "...",
  author: "Alice",
  tags: ["typescript", "nodejs"],
  createdAt: ISODate("...")
}

// ✗ Avoid: Unnecessary nesting or fields
{
  _id: ObjectId("..."),
  metadata: {
    title: { value: "My Post", type: "string" },
    content: { value: "...", type: "string" }
  }
}
```

---

### Property Naming

Aim for single-word property names. If necessary, limit to two words maximum.

```javascript
// ✅ Good: Single or two-word property names
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com",
  role: "admin",
  birthDate: "1990-05-15",
  joinDate: ISODate("...")
}

// ✗ Avoid: Overly long property names
{
  _id: ObjectId("..."),
  userFirstName: "Alice",
  userLastName: "Smith",
  userEmailAddress: "alice@example.com"
}
```

---

### Document Size and Cardinality

Ensure documents stay within MongoDB's 16MB limit. Avoid embedding data that could grow unboundedly.

```javascript
// ✅ Good: Use references for high-cardinality data
// User document
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com"
}

// Post collection with reference to user
{
  _id: ObjectId("..."),
  title: "My Post",
  userId: ObjectId("..."),
  createdAt: ISODate("...")
}

// ✗ Avoid: Embedding unbounded data (e.g., all posts in user)
{
  _id: ObjectId("..."),
  name: "Alice",
  posts: [
    { _id: ObjectId("..."), title: "Post 1", content: "..." },
    { _id: ObjectId("..."), title: "Post 2", content: "..." }
    // ... potentially thousands of posts
  ]
}
```

---

### Lifecycle Consistency

Ensure that embedded data shares a similar lifecycle with its parent document. If embedded data needs independent access, consider using references instead.

```javascript
// ✅ Good: Lifecycle-aligned embedded data
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com",
  profile: {
    bio: "Software engineer",
    avatar: "https://...",
    theme: "dark"
  }
  // Profile is updated/deleted with the user
}

// ✗ Avoid: Independent lifecycle data embedded
{
  _id: ObjectId("..."),
  name: "Alice",
  apiKeys: [
    { _id: ObjectId("..."), key: "sk_...", createdAt: ISODate("...") },
    { _id: ObjectId("..."), key: "sk_...", createdAt: ISODate("...") }
  ]
  // API keys may need to be rotated or revoked independently
}

// ✓ Better: Reference when lifecycle is independent
// API Key collection
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  key: "sk_...",
  createdAt: ISODate("..."),
  revokedAt: null
}
```

---

## Summary

Following these guidelines will help ensure that your MongoDB schemas are optimized for:

- **Performance** — reduced queries, efficient lookups, minimal document size overhead
- **Maintainability** — clear naming, simple structure, consistent patterns
- **Scalability** — aligned lifecycles, bounded growth, predictable access patterns

Remember that these are best practices and should be adapted to fit your application's specific needs. Always profile query patterns and document growth before finalizing schema design.

**Standard level:** Recommended
