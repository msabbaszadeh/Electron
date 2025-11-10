from typing import List, Optional, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
import threading
import os

# Lazy imports to avoid heavy startup if not used
_model_lock = threading.Lock()
_embedder = None
_reranker = None
_current_embed_model: Optional[str] = None
_current_rerank_model: Optional[str] = None

DEFAULT_EMBED_MODEL = "BAAI/bge-m3"
DEFAULT_RERANK_MODEL = "BAAI/bge-reranker-v2-m3"

app = FastAPI(title="Embedding Service", version="0.1.0")


def _ensure_embedder(model_name: Optional[str] = None, cache_dir: Optional[str] = None):
    global _embedder, _current_embed_model
    name = model_name or DEFAULT_EMBED_MODEL
    if _embedder is not None and _current_embed_model == name:
        return _embedder
    with _model_lock:
        if cache_dir:
            os.environ["HF_HOME"] = cache_dir
            os.environ["TRANSFORMERS_CACHE"] = cache_dir
            os.environ["HUGGINGFACE_HUB_CACHE"] = cache_dir
        if _embedder is None or _current_embed_model != name:
            from FlagEmbedding import BGEM3FlagModel  # type: ignore
            _embedder = BGEM3FlagModel(name, use_fp16=True)
            _current_embed_model = name
    return _embedder


def _ensure_reranker(model_name: Optional[str] = None, cache_dir: Optional[str] = None):
    global _reranker, _current_rerank_model
    name = model_name or DEFAULT_RERANK_MODEL
    if _reranker is not None and _current_rerank_model == name:
        return _reranker
    with _model_lock:
        if cache_dir:
            os.environ["HF_HOME"] = cache_dir
            os.environ["TRANSFORMERS_CACHE"] = cache_dir
            os.environ["HUGGINGFACE_HUB_CACHE"] = cache_dir
        if _reranker is None or _current_rerank_model != name:
            from FlagEmbedding import Reranker  # type: ignore
            _reranker = Reranker(name, use_fp16=True)
            _current_rerank_model = name
    return _reranker


class EmbedInput(BaseModel):
    text: str
    model_name: Optional[str] = None
    cache_dir: Optional[str] = None

class EmbedOutput(BaseModel):
    dense: List[float]
    sparse: Dict[str, List[Any]]  # { "indices": [int], "values": [float] }

class EmbedBatchInput(BaseModel):
    texts: List[str]
    model_name: Optional[str] = None
    cache_dir: Optional[str] = None

class EmbedBatchOutput(BaseModel):
    dense: List[List[float]]
    sparse: List[Dict[str, List[Any]]]  # list of {indices, values}

class RerankInput(BaseModel):
    query: str
    documents: List[str]
    model_name: Optional[str] = None
    top_k: Optional[int] = None
    cache_dir: Optional[str] = None

class RerankItem(BaseModel):
    index: int
    score: float

class RerankOutput(BaseModel):
    results: List[RerankItem]


@app.get("/health")
def health():
    return {"status": "ok", "embed_model": _current_embed_model, "rerank_model": _current_rerank_model}


@app.post("/embed", response_model=EmbedOutput)
def embed(inp: EmbedInput):
    model = _ensure_embedder(inp.model_name, cache_dir=inp.cache_dir)
    # BGEM3 encode for queries (short texts) is generally preferred
    res = model.encode_queries([inp.text], return_dense=True, return_sparse=True)
    # Try multiple possible keys depending on library version
    dense_vec = None
    sparse_repr = None

    # Dense extraction
    for k in ("dense", "dense_vecs", "dense_embeddings"):
        if k in res:
            v = res[k]
            if isinstance(v, list):
                dense_vec = v[0].tolist() if hasattr(v[0], "tolist") else list(v[0])
            else:
                dense_vec = v.tolist() if hasattr(v, "tolist") else list(v)
            break

    # Sparse extraction
    for k in ("sparse", "sparse_vecs", "sparse_embeddings"):
        if k in res:
            sparse_repr = res[k]
            break

    if dense_vec is None:
        # Fallback: model.encode (not queries)
        res2 = model.encode([inp.text], return_dense=True, return_sparse=True)
        if "dense" in res2:
            v = res2["dense"]
            dense_vec = v[0].tolist() if hasattr(v[0], "tolist") else list(v[0])
        elif "dense_vecs" in res2:
            v = res2["dense_vecs"]
            dense_vec = v[0].tolist() if hasattr(v[0], "tolist") else list(v[0])

        sparse_repr = res2.get("sparse") or res2.get("sparse_vecs")

    # Normalize sparse to indices/values
    indices: List[int] = []
    values: List[float] = []
    if sparse_repr is not None:
        s0 = sparse_repr[0] if isinstance(sparse_repr, list) else sparse_repr
        if isinstance(s0, dict):
            # Dict of token_id -> weight
            try:
                indices = [int(k) for k in s0.keys()]
                values = [float(v) for v in s0.values()]
            except Exception:
                # Maybe nested structure with indices/values
                if "indices" in s0 and "values" in s0:
                    indices = list(map(int, s0["indices"]))
                    values = list(map(float, s0["values"]))
        elif hasattr(s0, "indices") and hasattr(s0, "values"):
            indices = list(map(int, s0.indices))
            values = list(map(float, s0.values))

    return {"dense": dense_vec or [], "sparse": {"indices": indices, "values": values}}


@app.post("/embed_batch", response_model=EmbedBatchOutput)
def embed_batch(inp: EmbedBatchInput):
    model = _ensure_embedder(inp.model_name, cache_dir=inp.cache_dir)
    res = model.encode_queries(inp.texts, return_dense=True, return_sparse=True)

    dense_out: List[List[float]] = []
    sparse_out: List[Dict[str, List[Any]]] = []

    # Dense
    if "dense" in res:
        for v in res["dense"]:
            dense_out.append(v.tolist() if hasattr(v, "tolist") else list(v))
    elif "dense_vecs" in res:
        for v in res["dense_vecs"]:
            dense_out.append(v.tolist() if hasattr(v, "tolist") else list(v))

    # Sparse
    if "sparse" in res:
        for s in res["sparse"]:
            if isinstance(s, dict):
                try:
                    idx = [int(k) for k in s.keys()]
                    val = [float(v) for v in s.values()]
                    sparse_out.append({"indices": idx, "values": val})
                except Exception:
                    sparse_out.append({
                        "indices": list(map(int, s.get("indices", []))),
                        "values": list(map(float, s.get("values", []))),
                    })
            else:
                # Unknown sparse structure
                sparse_out.append({"indices": [], "values": []})
    elif "sparse_vecs" in res:
        for s in res["sparse_vecs"]:
            if isinstance(s, dict):
                idx = [int(k) for k in s.keys()]
                val = [float(v) for v in s.values()]
                sparse_out.append({"indices": idx, "values": val})
            else:
                sparse_out.append({"indices": [], "values": []})

    return {"dense": dense_out, "sparse": sparse_out}


@app.post("/rerank", response_model=RerankOutput)
def rerank(inp: RerankInput):
    reranker = _ensure_reranker(inp.model_name, cache_dir=inp.cache_dir)
    pairs = [(inp.query, doc) for doc in inp.documents]
    scores = reranker.compute_score(pairs)
    results = [RerankItem(index=i, score=float(scores[i])) for i in range(len(scores))]
    results.sort(key=lambda x: x.score, reverse=True)
    if inp.top_k is not None:
        results = results[: inp.top_k]
    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)