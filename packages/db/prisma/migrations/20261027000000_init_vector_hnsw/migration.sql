CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX IF NOT EXISTS chunk_embedding_hnsw_idx ON "Chunk" USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS chunk_search_vector_gin_idx ON "Chunk" USING gin ("searchVector");

CREATE OR REPLACE FUNCTION chunk_search_vector_update() RETURNS trigger AS $$
BEGIN
  new."searchVector" := to_tsvector('english', coalesce(new.content, ''));
  RETURN new;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chunk_search_vector_trigger ON "Chunk";
CREATE TRIGGER chunk_search_vector_trigger
BEFORE INSERT OR UPDATE OF content ON "Chunk"
FOR EACH ROW EXECUTE FUNCTION chunk_search_vector_update();
