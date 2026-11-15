from pathlib import Path
from flask import Flask, send_from_directory, abort
app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
ASSETS = {p.relative_to(BASE_DIR).as_posix() for p in BASE_DIR.rglob('*') if p.suffix in {'.js', '.css', '.html'}}
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')
@app.route('/<path:name>')
def asset(name):
    if name not in ASSETS: abort(404)
    return send_from_directory(BASE_DIR, name)
if __name__ == '__main__':
    app.run(host='127.0.0.1', debug=False)
