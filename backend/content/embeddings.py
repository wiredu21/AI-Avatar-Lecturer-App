import logging
import os
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional

from sentence_transformers import SentenceTransformer

from .models import ScrapedContent, ContentType

logger = logging.getLogger(__name__)

class ContentEmbeddingService:
    """Service for generating and retrieving embeddings for scraped university content"""
    
    def __init__(self):
        self.model_name = "paraphrase-MiniLM-L6-v2"  # Lightweight, fast model good for RAG
        self.embedding_dim = 384  # Dimension of the embeddings from this model
        self.embeddings_path = "content_embeddings.npz"
        self.metadata_path = "content_metadata.npz"
        self.model = None
        self.embeddings = None
        self.metadata = []
    
    def _load_model(self):
        """Load the embedding model if not already loaded"""
        if self.model is None:
            try:
                logger.info(f"Loading embedding model: {self.model_name}")
                self.model = SentenceTransformer(self.model_name)
                logger.info(f"Embedding model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading embedding model: {str(e)}")
                raise
    
    def _ensure_embeddings_exist(self):
        """Load the embeddings from file if they exist"""
        if self.embeddings is None:
            try:
                # Check if embeddings file exists
                if os.path.exists(self.embeddings_path) and os.path.exists(self.metadata_path):
                    logger.info("Loading existing embeddings and metadata")
                    self.embeddings = np.load(self.embeddings_path)['embeddings']
                    data = np.load(self.metadata_path, allow_pickle=True)
                    self.metadata = data['metadata'].tolist()
                else:
                    logger.info("No existing embeddings found, initializing empty arrays")
                    self.embeddings = np.zeros((0, self.embedding_dim), dtype=np.float32)
                    self.metadata = []
            except Exception as e:
                logger.error(f"Error loading embeddings: {str(e)}")
                self.embeddings = np.zeros((0, self.embedding_dim), dtype=np.float32)
                self.metadata = []
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a list of texts"""
        self._load_model()
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            raise
    
    def update_content_embeddings(self):
        """Update embeddings for all scraped content"""
        self._load_model()
        self._ensure_embeddings_exist()
        
        try:
            # Get all content from database
            content_items = ScrapedContent.objects.all()
            logger.info(f"Found {len(content_items)} content items to embed")
            
            # Clear existing embeddings if we're reindexing everything
            if len(content_items) > 0:
                self.embeddings = np.zeros((0, self.embedding_dim), dtype=np.float32)
                self.metadata = []
            
            # Process in batches to avoid memory issues
            batch_size = 50
            for i in range(0, len(content_items), batch_size):
                batch = content_items[i:i+batch_size]
                
                # Prepare text and metadata for each item
                texts = []
                batch_metadata = []
                
                for item in batch:
                    # Combine title, summary and content for embedding
                    text = f"{item.title}. {item.summary} {item.content[:1000]}"
                    texts.append(text)
                    
                    # Store metadata for retrieval
                    meta = {
                        'id': item.id,
                        'title': item.title,
                        'summary': item.summary,
                        'url': item.url,
                        'content_type': item.content_type,
                        'published_date': item.published_date.isoformat() if item.published_date else None,
                        'source_name': item.source.name if item.source else None,
                        'university_name': item.source.university.name if item.source and item.source.university else None
                    }
                    batch_metadata.append(meta)
                
                # Generate embeddings
                batch_embeddings = self.generate_embeddings(texts)
                
                # Add to embeddings array
                self.embeddings = np.vstack([self.embeddings, batch_embeddings]) if self.embeddings.shape[0] > 0 else batch_embeddings
                self.metadata.extend(batch_metadata)
                
                logger.info(f"Processed batch {i//batch_size + 1}, added {len(batch)} items")
            
            # Save embeddings and metadata
            np.savez(self.embeddings_path, embeddings=self.embeddings)
            np.savez(self.metadata_path, metadata=np.array(self.metadata, dtype=object))
            
            logger.info(f"Updated embeddings for {len(content_items)} content items")
            return len(content_items)
        except Exception as e:
            logger.error(f"Error updating content embeddings: {str(e)}")
            raise
    
    def retrieve_relevant_content(self, query: str, k: int = 3, content_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve relevant content for a query"""
        self._load_model()
        self._ensure_embeddings_exist()
        
        if self.embeddings.shape[0] == 0:
            logger.warning("No content embeddings available")
            return []
        
        try:
            # Generate query embedding
            query_embedding = self.generate_embeddings([query])[0]
            
            # Calculate cosine similarity
            normalized_query = query_embedding / np.linalg.norm(query_embedding)
            normalized_embeddings = self.embeddings / np.linalg.norm(self.embeddings, axis=1, keepdims=True)
            similarities = np.dot(normalized_embeddings, normalized_query)
            
            # Get top k indices
            top_indices = np.argsort(similarities)[::-1][:k*2]  # Get more for filtering
            
            # Filter and prepare results
            results = []
            for idx in top_indices:
                if idx >= len(self.metadata):
                    continue
                    
                item = self.metadata[idx]
                
                # Filter by content type if specified
                if content_type and item['content_type'] != content_type:
                    continue
                
                # Add similarity score
                item_copy = item.copy()
                item_copy['score'] = float(similarities[idx])
                results.append(item_copy)
                
                if len(results) >= k:
                    break
            
            return results
        
        except Exception as e:
            logger.error(f"Error retrieving content: {str(e)}")
            return []

# Create a singleton instance
content_embedding_service = ContentEmbeddingService() 