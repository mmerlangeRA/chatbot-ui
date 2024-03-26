CREATE OR REPLACE FUNCTION get_collections(workspaceId UUID)
RETURNS SETOF collections AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM collections c
  LEFT JOIN collection_workspaces cw ON c.id = cw.collection_id
  WHERE c.sharing != 'private' OR cw.workspace_id = workspaceId;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_assistants(workspaceId UUID)
RETURNS SETOF assistants AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM assistants c
  LEFT JOIN assistant_workspaces cw ON c.id = cw.assistant_id
  WHERE c.sharing != 'private' OR cw.workspace_id = workspaceId;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE POLICY "Read-only access for other users"
    ON assistant_files
    FOR SELECT
    USING (user_id <> auth.uid());