import os
from flask import Flask, render_template, request
from flask.json import jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
app.config['SERVER_NAME'] = 'localhost:9999'
root_dir = os.path.abspath(os.path.dirname(__file__))


@app.route('/')
def index():
    return render_template('eva.html')


@app.route('/result', methods=["POST", "GET"])
def result():
    if request.method == 'POST':
        res = request.json
        with open('result.txt', 'w+') as f:
            f.write(str(res))
        if res:
            return jsonify({"success": 'ok'})
    if request.method == 'GET':
        with open('result.txt', 'r') as f:
            res = f.read()
        return render_template('result.html', res=res)


@app.route('/favicon.ico')
def favicon_ico():
    from flask import send_from_directory
    return send_from_directory(os.path.join(root_dir, 'static/img'),
                               'favicon.ico',
                               mimetype='image/vnd.microsoft.icon')


if __name__ == "__main__":
    app.run(debug=1, use_reloader=True)
