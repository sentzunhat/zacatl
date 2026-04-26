# MongoDB Schema Design Guidelines

Streamlined, efficient, and maintainable MongoDB schema design patterns and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Key Principles](#key-principles)
3. [Favor Embedding](#favor-embedding)
4. [Minimalism and Simplicity](#minimalism-and-simplicity)
5. [Property Naming](#property-naming)
6. [Document Size and Cardinality](#document-size-and-cardinality)
7. [Lifecycle Consistency](#lifecycle-consistency)
8. [Flexibility in Application](#flexibility-in-application)
9. [Conclusion](#conclusion)

---

## Overview

These guidelines are intended to help developers create streamlined, efficient, and maintainable MongoDB schemas. The focus is on embedding, minimalism, and a preference for single-word or two-word properties.

---

## Key Principles

### Favor Embedding

**Rule:** When possible, embed related data within a single document to improve performance by reducing the need for additional queries or joins.

**Rationale:** Embedded documents ensure that related data is retrieved together, which can enhance read performance, especially in scenarios with one-to-few or one-to-many relationships.

**Example:**

```javascript
// ✓ Good: Embed address within user document
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

---

### Minimalism and Simplicity

**Rule:** Design schemas with simplicity in mind. Keep the structure minimal, using nested objects when appropriate to reflect natural data hierarchies.

**Rationale:** A minimalistic approach reduces complexity, making the data model easier to understand, maintain, and scale.

**Example:**

```javascript
// ✓ Good: Simple, minimal structure
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
    content: { value: "...", type: "string" },
    author: { value: "Alice", type: "string" }
  }
}
```

---

### Property Naming

**Rule:** Aim to use single-word property names whenever possible. If a single word doesn't suffice, limit property names to a maximum of two words.

**Rationale:** Short, concise property names reduce the risk of errors and make the schema easier to read and maintain. Consistency across the schema improves clarity and reduces cognitive load.

**Example:**

```javascript
// ✓ Good: Single or two-word property names
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com",
  role: "admin",
  birthDate: "1990-05-15",
  joinDate: ISODate("..."),
  phone: "+1-555-0123"
}

// ⚠ Acceptable: Two-word properties when necessary
{
  _id: ObjectId("..."),
  firstName: "Alice",
  lastName: "Smith",
  emailAddress: "alice@example.com",
  birthDate: "1990-05-15"
}

// ✗ Avoid: Overly long property names
{
  _id: ObjectId("..."),
  userFirstName: "Alice",
  userLastName: "Smith",
  userEmailAddress: "alice@example.com",
  userBirthDate: "1990-05-15"
}
```

---

### Document Size and Cardinality

**Rule:** Ensure that the document size remains within MongoDB's 16MB limit. Avoid embedding data that could result in unbounded growth (e.g., high-cardinality relationships).

**Rationale:** Overly large documents can degrade performance and complicate operations like replication and backup. Consider using references instead of embedding when dealing with potentially large datasets.

**Example:**

```javascript
// ✓ Good: Use references for high-cardinality data
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
  content: "...",
  userId: ObjectId("..."), // Reference instead of embedding
  createdAt: ISODate("...")
}

// ✗ Avoid: Embedding unbounded data (e.g., all posts in user document)
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com",
  posts: [
    { _id: ObjectId("..."), title: "Post 1", content: "..." },
    { _id: ObjectId("..."), title: "Post 2", content: "..." },
    // ... potentially thousands or millions of posts
  ]
}
```

---

### Lifecycle Consistency

**Rule:** Ensure that embedded data shares a similar lifecycle with its parent document. If the embedded data needs to be accessed or updated independently, consider using references instead.

**Rationale:** Aligning the lifecycle of embedded documents with their parent ensures consistent and predictable behavior, making the schema more robust.

**Example:**

```javascript
// ✓ Good: Lifecycle-aligned embedded data
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
  email: "alice@example.com",
  apiKeys: [
    { _id: ObjectId("..."), key: "sk_...", createdAt: ISODate("...") },
    { _id: ObjectId("..."), key: "sk_...", createdAt: ISODate("...") }
  ]
  // API keys may need to be rotated, revoked, or accessed independently
}

// ✓ Better: Reference when lifecycle is independent
// User document
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com"
}

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

## Flexibility in Application

These guidelines are meant to be **flexible** to accommodate different application requirements. While embedding and minimalism are recommended, exceptions can be made based on specific data access patterns and application needs.

The recommendation to use single or two-word property names is flexible; however, **keeping it concise is critical** to maintaining clarity and consistency across the schema.

---

## Conclusion

Following these guidelines will help ensure that your MongoDB schemas are optimized for:

- **Performance** — reduced queries, efficient lookups, and minimal document size overhead
- **Maintainability** — clear naming, simple structure, and consistent patterns
- **Scalability** — aligned lifecycles, bounded growth, and predictable access patterns

Remember that these are best practices and should be adapted to fit the specific needs of your application. Always profile query patterns and document growth before finalizing schema design.
