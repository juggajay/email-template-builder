# Pinecone Hybrid Search

## Overview
Hybrid search combines semantic and lexical search to overcome individual search technique limitations, providing more comprehensive search results.

## Approaches

### 1. Separate Dense and Sparse Indexes (Recommended)
**Advantages:**
- More flexibility in search strategies
- Can perform sparse-only queries
- Supports multiple levels of reranking
- Better control over each search type

**Implementation:**
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

# Search both indexes
dense_results = dense_index.search(namespace="templates", query=...)
sparse_results = sparse_index.search(namespace="templates", query=...)

# Merge and deduplicate results
# Implement custom merging logic based on scores
```

### 2. Single Hybrid Index
**Advantages:**
- Simpler implementation
- Only requires one index
- Unified search interface

**Limitations:**
- Cannot do sparse-only queries
- No integrated embedding/reranking
- Less flexibility

## Implementation Steps

1. **Create Indexes**: Set up both dense and sparse indexes
2. **Generate Vectors**: Create both dense and sparse vectors for your data
3. **Upsert Data**: Use consistent identifiers across both indexes
4. **Search Strategy**: Query both indexes with the same parameters
5. **Merge Results**: Combine and deduplicate results
6. **Rerank**: Use reranking models to refine top results

## Example Use Case
Query: "Q3 2024 us economic data"
- **Semantic search** captures: reports about economic trends, financial analysis
- **Lexical search** captures: documents with exact terms "Q3", "2024", "economic"
- **Combined results** provide comprehensive coverage

## Best Practices

1. **Consistent Identifiers**: Use same IDs across dense and sparse indexes
2. **Score Normalization**: Normalize scores before merging
3. **Weighted Combination**: Apply different weights to semantic vs lexical results
4. **Reranking**: Use ML models to refine final ranking
5. **Caching**: Cache merged results for common queries

## Implementation Example

```python
class HybridTemplateSearch:
    def __init__(self, pc: Pinecone):
        self.dense_index = pc.Index("templates-dense")
        self.sparse_index = pc.Index("templates-sparse")
    
    def search(self, query: str, top_k: int = 10):
        # Search both indexes
        dense_results = self.dense_index.search(
            namespace="templates",
            query={"top_k": top_k, "inputs": {"text": query}}
        )
        
        sparse_results = self.sparse_index.search(
            namespace="templates",
            query={"top_k": top_k, "inputs": {"text": query}}
        )
        
        # Merge and deduplicate
        merged_results = self._merge_results(dense_results, sparse_results)
        
        # Rerank final results
        return self._rerank_results(merged_results, query, top_k)
    
    def _merge_results(self, dense_results, sparse_results):
        # Custom merging logic based on scores and relevance
        pass
    
    def _rerank_results(self, results, query, top_k):
        # Apply reranking model for final refinement
        pass
```