# Pinecone Vector Database - Implementation Guide for Template Search

## Overview
Pinecone is a fully managed vector database designed for building accurate and performant AI applications at scale. It provides seamless integration with embedding models and supports semantic, lexical, and hybrid search capabilities.

## Key Features for Template Search
- **Integrated Embedding**: Automatic vector generation from text
- **Hybrid Search**: Combines semantic and lexical search for better results
- **Metadata Filtering**: Filter templates by categories, tags, or custom attributes
- **Reranking**: Improve search relevance with ML-based reranking models
- **Namespaces**: Organize templates by category or tenant for faster queries

## 1. Vector Database Setup

### Installation
```python
pip install pinecone
```

### Initialize Client
```python
from pinecone import Pinecone

pc = Pinecone(api_key="YOUR_API_KEY")
```

### Create Index for Templates
```python
# Create index with integrated embedding for template search
index_name = "template-search"
if not pc.has_index(index_name):
    pc.create_index_for_model(
        name=index_name,
        cloud="aws",
        region="us-east-1",
        embed={
            "model": "llama-text-embed-v2",  # 2048 max tokens, $0.16/M tokens
            "field_map": {"text": "template_content"}
        }
    )
```

### Alternative: Multilingual Templates
```python
# For multilingual template support
pc.create_index_for_model(
    name="multilingual-templates",
    cloud="aws",
    region="us-east-1",
    embed={
        "model": "multilingual-e5-large",  # 507 max tokens, $0.08/M tokens
        "field_map": {"text": "template_content"}
    }
)
```

## 2. Embedding Strategies for Templates

### Integrated Embedding (Recommended)
- Automatically converts template text to vectors
- Supports up to 2048 tokens with llama-text-embed-v2
- No need to manage external embedding models

### Supported Embedding Models
1. **llama-text-embed-v2** (NVIDIA)
   - Max tokens: 2048
   - Price: $0.16/million tokens
   - Best for: High-quality semantic search

2. **multilingual-e5-large** (Microsoft)
   - Max tokens: 507
   - Price: $0.08/million tokens
   - Best for: Multilingual templates

3. **pinecone-sparse-english-v0** (Pinecone)
   - Max tokens: 512
   - Price: $0.08/million tokens
   - Best for: Keyword-based search

## 3. Semantic Search Implementation

### Upsert Templates
```python
index = pc.Index(index_name)

# Prepare template data
templates = [
    {
        "_id": "template_001",
        "template_content": "Professional email template for project updates...",
        "category": "email",
        "tags": ["business", "project-management"],
        "language": "en",
        "rating": 4.5
    },
    {
        "_id": "template_002",
        "template_content": "Marketing campaign social media post template...",
        "category": "social-media",
        "tags": ["marketing", "instagram"],
        "language": "en",
        "rating": 4.8
    }
]

# Upsert to namespace for organization
index.upsert_records("templates", templates)
```

### Search Templates
```python
# Semantic search
query = "need a template for weekly project status update"
results = index.search(
    namespace="templates",
    query={
        "top_k": 10,
        "inputs": {
            "text": query
        }
    }
)

# With reranking for better relevance
reranked_results = index.search(
    namespace="templates",
    query={
        "top_k": 20,  # Retrieve more for reranking
        "inputs": {
            "text": query
        }
    },
    rerank={
        "model": "bge-reranker-v2-m3",
        "top_n": 10,  # Return top 10 after reranking
        "rank_fields": ["template_content"]
    }
)
```

## 4. Metadata Filtering

### Supported Data Types
- Numbers (ratings, prices, word counts)
- Strings (categories, tags, languages)
- Booleans (is_premium, is_featured)

### Filter Operators
- **Equality**: `$eq`, `$ne`
- **Comparison**: `$gt`, `$gte`, `$lt`, `$lte`
- **Set Operations**: `$in`, `$nin`
- **Existence**: `$exists`
- **Logical**: `$and`, `$or`

### Filter Examples
```python
# Filter by category
filter = {"category": {"$eq": "email"}}

# Filter by rating
filter = {"rating": {"$gte": 4.0}}

# Complex filter
filter = {
    "$and": [
        {"category": {"$in": ["email", "business"]}},
        {"rating": {"$gte": 4.5}},
        {"language": {"$eq": "en"}}
    ]
}

# Search with filters
filtered_results = index.search(
    namespace="templates",
    query={
        "top_k": 10,
        "inputs": {"text": query},
        "filter": filter
    }
)
```

## 5. Hybrid Search for Templates

### Approach 1: Separate Indexes (Recommended)
```python
# Create dense index for semantic search
dense_index = pc.create_index_for_model(
    name="templates-dense",
    cloud="aws",
    region="us-east-1",
    embed={
        "model": "llama-text-embed-v2",
        "field_map": {"text": "template_content"}
    }
)

# Create sparse index for keyword search
sparse_index = pc.create_index_for_model(
    name="templates-sparse",
    cloud="aws",
    region="us-east-1",
    embed={
        "model": "pinecone-sparse-english-v0",
        "field_map": {"text": "template_content"}
    }
)

# Search both and merge results
dense_results = dense_index.search(...)
sparse_results = sparse_index.search(...)
# Merge and deduplicate results
```

### Approach 2: Single Hybrid Index
```python
# Create a single index supporting both dense and sparse vectors
# (Limited functionality compared to separate indexes)
```

## 6. Performance Optimization

### Namespace Strategy
```python
# Organize templates by category for faster queries
namespaces = {
    "email-templates": ["welcome", "newsletter", "notification"],
    "marketing-templates": ["social", "campaign", "ads"],
    "business-templates": ["report", "proposal", "invoice"]
}

# Query specific namespace
results = index.search(namespace="email-templates", query=...)
```

### Batch Operations
```python
# Batch upsert for better throughput
batch_size = 100
for i in range(0, len(templates), batch_size):
    batch = templates[i:i + batch_size]
    index.upsert_records(namespace, batch)
```

### Query Optimization
- Use appropriate `top_k` values (10-50 for most use cases)
- Apply metadata filters to reduce search space
- Use reranking for quality over quantity
- Cache frequently searched queries

## 7. Pricing and Limits

### Cost Considerations
- **Embedding Costs**: $0.08-$0.16 per million tokens
- **Storage Costs**: Based on number of vectors and dimensions
- **Query Costs**: Based on number of queries and read units

### Limits
- **Free Tier**: Limited to us-east-1 region
- **Vector Dimensions**: Must match embedding model output
- **Metadata Size**: Limited per vector
- **Namespace Count**: Depends on plan

### Cost Management Strategies
1. Use appropriate embedding models (balance quality vs cost)
2. Implement caching for common queries
3. Use namespaces to reduce search scope
4. Monitor usage through Pinecone dashboard
5. Set up billing alerts

## 8. Production Best Practices

### Index Configuration
```python
# Production-ready index setup
pc.create_index(
    name="production-templates",
    vector_type="dense",
    dimension=1536,  # Match your embedding model
    metric="cosine",  # or "euclidean", "dotproduct"
    spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    ),
    deletion_protection="enabled"
)
```

### Error Handling
```python
from pinecone.exceptions import PineconeException

try:
    results = index.search(...)
except PineconeException as e:
    # Handle Pinecone-specific errors
    logger.error(f"Pinecone error: {e}")
```

### Monitoring
- Track query latency
- Monitor index utilization
- Set up alerts for errors
- Review usage patterns

## 9. Template Search Implementation Example

```python
class TemplateSearchEngine:
    def __init__(self, api_key: str):
        self.pc = Pinecone(api_key=api_key)
        self.index_name = "template-search"
        self._ensure_index_exists()
        self.index = self.pc.Index(self.index_name)
    
    def _ensure_index_exists(self):
        if not self.pc.has_index(self.index_name):
            self.pc.create_index_for_model(
                name=self.index_name,
                cloud="aws",
                region="us-east-1",
                embed={
                    "model": "llama-text-embed-v2",
                    "field_map": {"text": "content"}
                }
            )
    
    def add_template(self, template_id: str, content: str, metadata: dict):
        """Add a new template to the search index"""
        record = {
            "_id": template_id,
            "content": content,
            **metadata
        }
        self.index.upsert_records("templates", [record])
    
    def search(self, query: str, filters: dict = None, top_k: int = 10):
        """Search for templates"""
        search_params = {
            "top_k": top_k * 2,  # Get more for reranking
            "inputs": {"text": query}
        }
        
        if filters:
            search_params["filter"] = filters
        
        results = self.index.search(
            namespace="templates",
            query=search_params,
            rerank={
                "model": "bge-reranker-v2-m3",
                "top_n": top_k,
                "rank_fields": ["content"]
            }
        )
        
        return results
    
    def delete_template(self, template_id: str):
        """Remove a template from the index"""
        self.index.delete(ids=[template_id], namespace="templates")
```

## 10. Next Steps

1. **Set up Pinecone account** and obtain API key
2. **Choose embedding model** based on requirements
3. **Design metadata schema** for templates
4. **Implement search interface** with filters
5. **Add analytics** to track popular searches
6. **Optimize performance** based on usage patterns
7. **Set up monitoring** and alerts

## Resources
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Python SDK Reference](https://docs.pinecone.io/reference/python-sdk)
- [Embedding Models](https://docs.pinecone.io/models/overview)
- [Best Practices Guide](https://docs.pinecone.io/guides/performance/optimize-performance)