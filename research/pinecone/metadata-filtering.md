# Pinecone Metadata Filtering

## Overview
Metadata filtering allows searching and filtering vector records based on additional metadata key-value pairs during vector search operations.

## Supported Filter Operators
- **Equality**: `$eq`, `$ne`
- **Comparison**: `$gt`, `$gte`, `$lt`, `$lte`
- **Set Membership**: `$in`, `$nin`
- **Existence**: `$exists`
- **Logical Combinations**: `$and`, `$or`

## Supported Data Types
- Numbers
- Strings
- Booleans

## Example Filter Syntax
```python
# Simple equality filter
filter = {"category": {"$eq": "digestive system"}}

# Comparison filter
filter = {"rating": {"$gte": 4.0}}

# Set membership filter
filter = {"tags": {"$in": ["template", "business"]}}

# Complex logical filter
filter = {
    "$and": [
        {"category": {"$eq": "email"}},
        {"rating": {"$gte": 4.5}}
    ]
}

# Existence filter
filter = {"premium": {"$exists": True}}
```

## Key Constraints
- Only `$and` and `$or` allowed at top query level
- Cannot directly filter list-type metadata values
- Metadata filtering happens during search/query operations

## Best Practices
- Use metadata for additional context and filtering
- Design metadata schema carefully for efficient querying
- Understand operator limitations before implementing complex filters
- Keep metadata values simple and well-structured