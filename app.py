import os
from flask import Flask, render_template, request
from flask.json import jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
# app.config['SERVER_NAME'] = 'localhost:9999'
app.config['SERVER_NAME'] = '10.90.2.183:9999'
root_dir = os.path.abspath(os.path.dirname(__file__))


@app.route('/diagram', methods=['POST', 'GET'])
def index():
    i = {
        "function": "check_env",
        "input": [
            {
                "var": "VAR1",
                "description": "var1 input"
            },
            {
                "var": "VAR2",
                "description": "var2 input"
            }
        ],
        "output": [
            {
                "var": "OUT",
                "value": [5, "OUT0"],
                "description": "standard out"
            },
            {
                "var": "TEMP1VAL",
                "value": 0,
                "description": "value of temp1"
            }
        ],
        "body": [
            {
                "id": 0,
                "function": "value",
                "params": {
                    "item_id": {
                        "type": "var_in",
                        "value": "VAR1"
                    }
                }
            },
            {
                "id": 1,
                "function": "value",
                "params": {
                    "item_id": {
                        "type": "const",
                        "value": "sensor:env/temp2"
                    }
                }
            },
            {
                "id": 2,
                "function": "state",
                "params": {
                    "item_id": {
                        "type": "const",
                        "value": "sensor:env/hum"
                    }
                }
            },
            {
                "id": 3,
                "function": "GT",
                "params": {
                    "IN": {
                        "type": "const",
                        "value": 25.5
                    },
                    "args": [
                        {
                            "type": "block_out",
                            "value": 0
                        },
                        {
                            "type": "block_out",
                            "value": 1
                        }
                    ]
                }
            },
            {
                "id": 4,
                "function": "LT",
                "params": {
                    "IN": {
                        "type": "const",
                        "value": 30
                    },
                    "args": [
                        {
                            "type": "block_out",
                            "value": [2, "value"]
                        }
                    ]
                }
            },
            {
                "id": 5,
                "function": "AND",
                "params": {
                    "args": [
                        {
                            "type": "block_out",
                            "value": 3
                        },
                        {
                            "type": "block_out",
                            "value": 4
                        }
                    ]
                }
            }
        ]
    }
    if len(request.form.get('info')) > 0:
        i = request.form.get('info')
    return render_template('eva.html', i=i)


@app.route('/')
def start():
    return render_template('start.html')


@app.route('/result', methods=["POST", "GET"])
def result():
    if request.method == 'POST':
        res = request.get_json()
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
