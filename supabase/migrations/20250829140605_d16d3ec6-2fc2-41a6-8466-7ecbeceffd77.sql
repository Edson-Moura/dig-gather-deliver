-- Remove duplicate lessons keeping only the most recent ones
DELETE FROM lesson_sentences 
WHERE lesson_id IN (
  SELECT l1.id 
  FROM lessons l1
  JOIN lessons l2 ON l1.title = l2.title AND l1.level = l2.level 
  WHERE l1.created_at < l2.created_at
);

DELETE FROM lessons 
WHERE id IN (
  SELECT l1.id 
  FROM lessons l1
  JOIN lessons l2 ON l1.title = l2.title AND l1.level = l2.level 
  WHERE l1.created_at < l2.created_at
);

-- Update order_index to ensure proper sequencing
UPDATE lessons 
SET order_index = ROW_NUMBER() OVER (PARTITION BY level ORDER BY created_at)
WHERE level = 'beginner';

UPDATE lessons 
SET order_index = ROW_NUMBER() OVER (PARTITION BY level ORDER BY created_at)
WHERE level = 'intermediate';

UPDATE lessons 
SET order_index = ROW_NUMBER() OVER (PARTITION BY level ORDER BY created_at)
WHERE level = 'advanced';