"""Run the evening or morning job on this PC: python pipeline/locale.py sera|mattina"""
import os
import runpy
import subprocess
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
STEPS = {'sera': 'evening.py', 'mattina': 'morning.py'}


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()


def main(step):
    log = (HERE / 'state' / 'locale.log').open('a', encoding='utf-8')
    sys.stdout = sys.stderr = log
    print(f'\n== {step} {datetime.now():%Y-%m-%d %H:%M}')
    branch = git('branch', '--show-current')
    if branch != 'pipeline':
        print(f'saltato: il repository è sul branch {branch}, non su pipeline')
        return
    for line in (HERE / '.env').read_text(encoding='utf-8').splitlines():
        key, _, value = line.partition('=')
        if key.strip() and not key.startswith('#'):
            os.environ[key.strip()] = value.strip()
    sys.path.insert(0, str(HERE))
    try:
        runpy.run_path(str(HERE / STEPS[step]), run_name='__main__')
    finally:
        git('add', 'pipeline/state', 'pipeline/drafts', 'content')
        if git('status', '--porcelain', '--', 'pipeline/state', 'pipeline/drafts', 'content'):
            git('commit', '-m', f'Giro {step} del {datetime.now():%d/%m}', '--', 'pipeline/state', 'pipeline/drafts', 'content')
            print('salvato con un commit')


if __name__ == '__main__':
    main(sys.argv[1])
