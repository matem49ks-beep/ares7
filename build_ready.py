from pathlib import Path
import re
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>\n'+(ROOT/m[1]).read_text(encoding='utf-8')+'\n</style>',html)
html=re.sub(r'<script src="([^"]+)" defer></script>',lambda m:'<script>\n'+(ROOT/m[1]).read_text(encoding='utf-8').replace('</script','<\\/script')+'\n</script>',html)
(ROOT/'ARES7_READY.html').write_text(html,encoding='utf-8')
print('ARES7_READY.html is ready')
