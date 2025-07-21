-- Fix for editor not loading templates

-- 1. First, let's check what templates we have
SELECT id, name, category, html_content IS NOT NULL as has_html, json_design IS NOT NULL as has_json
FROM email_templates 
WHERE is_public = true;

-- 2. Update templates to ensure they have proper JSON design
-- Since the templates only have HTML, we'll create a basic JSON design structure
UPDATE email_templates 
SET json_design = jsonb_build_object(
  'body', jsonb_build_object(
    'rows', jsonb_build_array(
      jsonb_build_object(
        'cells', jsonb_build_array(1),
        'columns', jsonb_build_array(
          jsonb_build_object(
            'contents', jsonb_build_array(
              jsonb_build_object(
                'type', 'html',
                'values', jsonb_build_object(
                  'html', html_content
                )
              )
            )
          )
        )
      )
    )
  )
)
WHERE json_design IS NULL 
AND html_content IS NOT NULL
AND is_public = true;

-- 3. Verify the update
SELECT id, name, json_design IS NOT NULL as has_json_now
FROM email_templates 
WHERE is_public = true;

-- 4. If you're still having issues, run this to see the actual template data
-- SELECT id, name, json_design FROM email_templates WHERE is_public = true LIMIT 1;