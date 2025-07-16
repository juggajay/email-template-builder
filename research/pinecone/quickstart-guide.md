# Pinecone Quickstart Guide

## Installation
```python
pip install pinecone
```

## Initialize Client
```python
from pinecone import Pinecone

pc = Pinecone(api_key="{{YOUR_API_KEY}}")
```

## Create Dense Index
```python
index_name = "quickstart-py"
if not pc.has_index(index_name):
    pc.create_index_for_model(
        name=index_name,
        cloud="aws",
        region="us-east-1",
        embed={
            "model":"llama-text-embed-v2",
            "field_map":{"text": "chunk_text"}
        }
    )
```

## Upsert Records
```python
records = [
    { "_id": "rec1", "chunk_text": "The Eiffel Tower was completed in 1889 and stands in Paris, France.", "category": "history" },
    # ... additional records
]

dense_index = pc.Index(index_name)
dense_index.upsert_records("example-namespace", records)
```

## Semantic Search
```python
query = "Famous historical structures and monuments"
results = dense_index.search(
    namespace="example-namespace",
    query={
        "top_k": 10,
        "inputs": {
            'text': query
        }
    }
)
```

## Rerank Results
```python
reranked_results = dense_index.search(
    namespace="example-namespace",
    query={
        "top_k": 10,
        "inputs": {
            'text': query
        }
    },
    rerank={
        "model": "bge-reranker-v2-m3",
        "top_n": 10,
        "rank_fields": ["chunk_text"]
    }   
)
```

## Clean Up
```python
pc.delete_index(index_name)
```

## Key Features
- Integrated embedding models
- Semantic search
- Result reranking
- Metadata filtering
- Namespace-based organization