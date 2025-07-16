# Pinecone Embedding Models

## Available Embedding Models

### 1. llama-text-embed-v2 (NVIDIA)
- **Task**: Embedding
- **Modality**: Text
- **Max Input Tokens**: 2048
- **Price**: $0.16 / million tokens
- **Best for**: High-quality semantic search with longer text inputs

### 2. multilingual-e5-large (Microsoft)
- **Task**: Embedding
- **Modality**: Text
- **Max Input Tokens**: 507
- **Price**: $0.08 / million tokens
- **Best for**: Multilingual content and cost-effective embedding

### 3. pinecone-sparse-english-v0 (Pinecone)
- **Task**: Embedding
- **Modality**: Text
- **Max Input Tokens**: 512
- **Price**: $0.08 / million tokens
- **Best for**: Keyword-based search and lexical matching

## Model Selection Guidelines

### For Template Search Systems:
- **High-quality content with longer descriptions**: Use `llama-text-embed-v2`
- **Multilingual templates**: Use `multilingual-e5-large`
- **Keyword/tag-based search**: Use `pinecone-sparse-english-v0`
- **Budget-conscious projects**: Use `multilingual-e5-large` or `pinecone-sparse-english-v0`

## Integration Examples

### Using llama-text-embed-v2
```python
pc.create_index_for_model(
    name="high-quality-templates",
    cloud="aws",
    region="us-east-1",
    embed={
        "model": "llama-text-embed-v2",
        "field_map": {"text": "template_content"}
    }
)
```

### Using multilingual-e5-large
```python
pc.create_index_for_model(
    name="multilingual-templates",
    cloud="aws",
    region="us-east-1",
    embed={
        "model": "multilingual-e5-large",
        "field_map": {"text": "template_content"}
    }
)
```

### Using sparse model for keywords
```python
pc.create_index_for_model(
    name="keyword-templates",
    cloud="aws",
    region="us-east-1",
    embed={
        "model": "pinecone-sparse-english-v0",
        "field_map": {"text": "template_content"}
    }
)
```

## Cost Considerations
- Choose based on input length requirements
- Consider token usage patterns
- Balance quality vs cost for your use case