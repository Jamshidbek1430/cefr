import sys

with open('/var/www/cefr/crm_back/apps/courses/serializers.py', 'r') as f:
    lines = f.readlines()

new_lines = []
in_get_file_url = False
skip_until_return_none = False

for i, line in enumerate(lines):
    if 'def get_file_url(self, obj):' in line:
        in_get_file_url = True
        new_lines.append(line)
        new_lines.append('        if obj.file_url:\n')
        new_lines.append('            return obj.file_url\n')
        new_lines.append('        if obj.file and obj.file.name:\n')
        new_lines.append('            relative_url = obj.file.url\n')
        new_lines.append('            if relative_url.startswith("http"):\n')
        new_lines.append('                return relative_url\n')
        new_lines.append('            # Always return public URL for frontend\n')
        new_lines.append('            return f"https://arturturkce.online{relative_url}"\n')
        new_lines.append('        return None\n')
        skip_until_return_none = True
        continue
    
    if skip_until_return_none:
        if 'return None' in line and in_get_file_url:
            skip_until_return_none = False
            in_get_file_url = False
        continue
    
    new_lines.append(line)

with open('/var/www/cefr/crm_back/apps/courses/serializers.py', 'w') as f:
    f.writelines(new_lines)

print("✓ Serializer fixed")
