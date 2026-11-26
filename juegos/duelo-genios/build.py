#!/usr/bin/env python3
"""Une los módulos de src/ en un solo index.html jugable (index.html)."""
import os
here = os.path.dirname(os.path.abspath(__file__))
src = lambda n: open(os.path.join(here, 'src', n), encoding='utf-8').read()
code = ''.join(src(n) for n in ['characters.js', 'sim.js', 'render.js', 'input.js', 'app.js'])
html = src('shell.html').replace('/*__CODE__*/\n', code, 1)

open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(html)
print('index.html', len(html), 'bytes')
