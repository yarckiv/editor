var t = {
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
            "value": [5, "OUT0"], // якщо декілька виходів
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
                "args": [ //якщо є аргс то їх може бути багато
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
};

function main(container, toolbar, sidebar) {
    if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else {
        document.getElementById('title').innerText = t.function;
        mxConnectionHandler.prototype.connectImage = new mxImage('/static/img/connector.gif', 16, 16);


        var editor = new mxEditor();
        editor.setGraphContainer(container);
        var graph = editor.graph;
        show_toolbar(toolbar, sidebar, editor);
        graph.dropEnabled = true;
        // Enables new connections in the graph
        graph.setConnectable(true);
        graph.setMultigraph(false);

        // Stops editing on enter or escape keypress
        var keyHandler = new mxKeyHandler(graph);
        var rubberband = new mxRubberband(graph);


        //If you want the graph to be read-only
        // graph.setEnabled(false);

        //disable move edge
        graph.setAllowDanglingEdges(false);
        graph.setDisconnectOnMove(false);

        //custom hover for blocks
        function updateStyle(state, hover) {
            // console.log('state', state)
            if (hover) {
                state.style[mxConstants.STYLE_FILLCOLOR] = '#90ee90';
                if (state.cell.block_name === 'body') {
                    graph.setConnectable(false);
                }
                else {
                    graph.setConnectable(true);
                }
            }
            let strokeWidth = !state.style.strokeWidth ? '1' : state.style.strokeWidth;
            // Sets style for hover
            state.style[mxConstants.STYLE_ROUNDED] = (hover) ? '1' : '0';
            state.style[mxConstants.STYLE_STROKEWIDTH] = (hover) ? '4' : strokeWidth;
            state.style[mxConstants.STYLE_FONTSTYLE] = (hover) ? mxConstants.FONT_BOLD : '0';
        };


        // Changes fill color on mouseover
        graph.addMouseListener(
            {
                currentState: null,
                previousStyle: null,
                mouseDown: function (sender, me) {
                    if (this.currentState != null) {
                        this.dragLeave(me.getEvent(), this.currentState);
                        this.currentState = null;
                    }
                },
                mouseMove: function (sender, me) {
                    if (this.currentState != null && me.getState() == this.currentState) {
                        return;
                    }
                    var tmp = graph.view.getState(me.getCell());
                    // Ignores everything but vertices
                    // if (graph.isMouseDown || (tmp != null && !
                    //     graph.getModel().isVertex(tmp.cell))) {
                    //     tmp = null;
                    // }
                    if (tmp != this.currentState) {
                        if (this.currentState != null) {
                            this.dragLeave(me.getEvent(), this.currentState);
                        }
                        this.currentState = tmp;
                        if (this.currentState != null) {
                            this.dragEnter(me.getEvent(), this.currentState);
                        }
                    }
                },
                mouseUp: function (sender, me) {
                },
                dragEnter: function (evt, state) {
                    if (state != null) {
                        this.previousStyle = state.style;
                        state.style = mxUtils.clone(state.style);
                        updateStyle(state, true);
                        state.shape.apply(state);
                        state.shape.redraw();

                        if (state.text != null) {
                            state.text.apply(state);
                            state.text.redraw();
                        }
                    }
                },
                dragLeave: function (evt, state) {
                    if (state != null) {
                        state.style = this.previousStyle;
                        updateStyle(state, false);
                        state.shape.apply(state);
                        state.shape.redraw();

                        if (state.text != null) {
                            state.text.apply(state);
                            state.text.redraw();
                        }
                    }
                }
            });


        // Enables rubberband selection
        new mxRubberband(graph);

        //change label value
        var graphCellLabelChanged = graph.cellLabelChanged;
        graph.cellLabelChanged = function (cell, newValue, autoSize) {
            // Cloned for correct undo/redo
            var elt = cell.value.cloneNode(true);
            let newname = block_name(newValue, cell.style);
            elt.setAttribute('label', newname);
            newValue = elt;
            graphCellLabelChanged.apply(this, arguments);
            cell.geometry.height = cell.geometry.width;
        };

        //autoresize vertex
        graph.setAutoSizeCells(true);
        graph.setCellsResizable(true);


        graph.convertValueToString = function (cell) {
            if (mxUtils.isNode(cell.value)) {
                return cell.getAttribute('label', '')
            }
        };
        graph.htmlLabels = true;

        //forbidden move child for parent's border
        mxGraphHandler.prototype.removeCellsFromParent = false;

        //style for input
        var style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
        style[mxConstants.STYLE_FILLCOLOR] = "white";
        style[mxConstants.STYLE_FONTCOLOR] = 'darkblue';
        style[mxConstants.STYLE_STROKECOLOR] = 'black';
        style[mxConstants.STYLE_FILLCOLOR] = '#EEEEEE';
        style[mxConstants.STYLE_MOVABLE] = '1';
        graph.getStylesheet().putCellStyle('input', style);

        //style for body
        var style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
        style[mxConstants.STYLE_FILLCOLOR] = 'lightgrey';
        graph.getStylesheet().putCellStyle('body', style);

        //style for edge
        var style = new Object();
        style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
        style[mxConstants.STYLE_DASHED] = '0';
        style[mxConstants.STYLE_MOVABLE] = '1';
        style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_CLASSIC;
        style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_DIAMOND;
        style[mxConstants.STYLE_STROKEWIDTH] = '2';
        style[mxConstants.STYLE_STROKECOLOR] = 'black';
        graph.getStylesheet().putCellStyle('body_input', style);

        var style = new Object();
        style[mxConstants.STYLE_EDGE] = mxEdgeStyle.SideToSide;
        style[mxConstants.STYLE_DASHED] = '1';
        style[mxConstants.STYLE_MOVABLE] = '1';
        style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_CLASSIC;
        style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_DIAMOND;
        style[mxConstants.STYLE_STROKEWIDTH] = '1';
        style[mxConstants.STYLE_STROKECOLOR] = 'red';
        graph.getStylesheet().putCellStyle('constanta_input', style);

        var style = new Object();
        style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
        style[mxConstants.STYLE_DASHED] = '0';
        style[mxConstants.STYLE_MOVABLE] = '1';
        style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_CLASSIC;
        style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_DIAMOND;
        style[mxConstants.STYLE_STROKEWIDTH] = '2';
        style[mxConstants.STYLE_STROKECOLOR] = 'green';
        graph.getStylesheet().putCellStyle('body_output', style);


        //style for constants
        var style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
        style[mxConstants.STYLE_FONTCOLOR] = 'red';
        style[mxConstants.STYLE_FILLCOLOR] = 'white';
        graph.getStylesheet().putCellStyle('constanta', style);


        // ----------------- control for new connections ---------------------- //
        graph.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
            var edge = evt.getProperty('cell');
            if ('args, in'.includes(edge.source.type)) {
                edge.style = 'constanta_input';
            }
            if (evt.properties.cell.source.type === 'in') {
                console.log('source', evt)
            }
        });

        var connectionHandlerConnect = mxConnectionHandler.prototype.connect;
        mxConnectionHandler.prototype.connect = function (source, target, evt, dropTarget, style) {
            if ('input, const'.includes(source.block_name)) {
                alert('This block cannot source');
                return false;
            }
            else if (source.block_name === 'body') {
                alert('Please select one of the parts of the unit to start the connection.');
                return false;
            }
            else if (target.block_name === 'body') {
                alert('Please select one of the parts of the unit to finish the connection.');
                return false;
            }
            else if (target.type === 'args') {
                source = [target, target = source][0];
            }
            else if (target.block_name === 'const') {
                if (!'var_in, in'.includes(source.type)) {
                    alert('Constanta can to connect only with child block named item_id or IN.');
                    return false;
                }
                else if ('var_in, in'.includes(source.type)) {
                    console.log('source', source)
                    let edge = source.edges[0];
                    graph.getModel().remove(edge);
                }
            }
            return connectionHandlerConnect.apply(this, arguments);
        };

        graph.getModel().beginUpdate();

        var parent = graph.getDefaultParent();

        var x = 100;
        var y = 100;

        var g_el_in = [];
        var g_el_body = [];
        var g_el_out = [];


        try {
            //input
            for (var i = 0; i < t.input.length; i++) {
                var id = 'input ' + i;
                var name = block_name(t.input[i], 'input');
                g_el_in[i] = graph.insertVertex(parent, id, name, x, (i === 0 ? y : y + i * 400), 80, 80, 'input');
                g_el_in[i].block_name = 'input';
            }
            //body
            //value & state
            var body_content = [];
            body_content[0] = [];
            body_content[1] = [];
            body_content[2] = [];
            var b_x = [];
            b_x[0] = 400;
            b_x[1] = 700;
            b_x[2] = 1000;
            var b_y = [];
            b_y[0] = 100;
            b_y[1] = 100;
            b_y[2] = 100;
            for (var b = 0; b < t.body.length; b++) {
                var id = 'body ' + b;
                var name = block_name(t.body[b], 'body');
                var x = isKeyExist(t.body[b].params, 'item_id');
                if (x) {
                    if (t.body[b].params.item_id.type === 'var_in') {
                        body_content[0].push(t.body[b].id);
                        g_el_body[b] = graph.insertVertex(parent, id, name, b_x[0], b_y[0], 150, 150, 'body');
                        g_el_body[b].block_name = 'body';
                        let inp = graph.insertVertex(g_el_body[b], null, block_name(Object.keys(t.body[b].params)[0]), -150, 100, 50, 30, 'editable=0;');
                        inp['type'] = 'var_in';
                        for (var i in g_el_in) {
                            var l = $(g_el_in[i].getAttribute('label'));
                            if (t.body[b].params.item_id.value === l.attr('id')) {
                                graph.insertEdge(parent, null, '', inp, g_el_in[i], 'body_input');
                            }
                        }
                        b_y[0] += 200;
                    }
                    else if (t.body[b].params.item_id.type === 'const') {
                        body_content[0].push(t.body[b].id);
                        g_el_body[b] = graph.insertVertex(parent, id, name, b_x[0], b_y[0], 150, 150, 'body');
                        g_el_body[b].block_name = 'body';
                        let inp = graph.insertVertex(g_el_body[b], null, block_name(Object.keys(t.body[b].params)), -150, 100, 50, 30, 'editable=0;');
                        inp['type'] = 'const';
                        let constanta = graph.insertVertex(parent, null, block_name(t.body[b].params.item_id.value), b_x[0] - 150, b_y[0], 100, 100, 'constanta');
                        constanta.block_name = 'const';
                        graph.insertEdge(parent, null, '', inp, constanta, 'constanta_input');
                        b_y[0] += 200;
                    }

                }
                else {
                    var u = -1;
                    if (isKeyExist(t.body[b].params, 'args')) {
                        var args_values = [];
                        for (var n = 0; n < t.body[b].params.args.length; n++) {
                            for (var d = 0; d < body_content.length; d++) {
                                for (var z in body_content[d]) {
                                    if (t.body[b].params.args[n].value === body_content[d][z] ||
                                        t.body[b].params.args[n].value instanceof Array && t.body[b].params.args[n].value[0] === body_content[d][z]) {
                                        u = d + 1 > u ? d + 1 : u;
                                        args_values.push(body_content[d][z])
                                    }
                                }
                            }
                        }
                    }
                    u = u >= 0 ? u : 0;
                    body_content[u].push(t.body[b].id);
                    g_el_body[b] = graph.insertVertex(parent, id, name, b_x[u], b_y[u], 150, 150, 'body');
                    g_el_body[b].block_name = 'body';
                    let inp = graph.insertVertex(g_el_body[b], null, block_name('input'), -150, 150, 50, 30, 'editable=0;');
                    inp['type'] = 'args';
                    for (var bod in args_values) {
                        for (var bod_id in g_el_body) {
                            if (args_values[bod] === +g_el_body[bod_id].id.split(' ')[1]) {
                                let out = graph.insertVertex(g_el_body[bod_id], null, block_name('out'), 100, 100, 50, 30, 'editable=0;');
                                out['type'] = 'block_out';
                                graph.insertEdge(parent, null, '', inp, out, 'constanta_input');
                            }
                        }
                    }
                    if (isKeyExist(t.body[b].params, 'IN')) {
                        if (t.body[b].params.IN.type === 'const') {
                            let inp = graph.insertVertex(g_el_body[b], null, block_name(Object.keys(t.body[b].params)[0]), -150, 100, 50, 30, 'editable=0;');
                            inp['type'] = 'in';
                            let constanta = graph.insertVertex(parent, null, block_name(t.body[b].params.IN.value), b_x[u] - 100, b_y[u], 80, 80, 'constanta');
                            constanta.block_name = 'const';
                            graph.insertEdge(parent, null, '', inp, constanta, 'constanta_input');
                        }
                    }
                    b_y[u] += 200;
                }
            }
            for (var o = 0; o < t.output.length; o++) {
                var id = 'output ' + o;
                var name = block_name(t.output[o], 'output');
                g_el_out[o] = graph.insertVertex(parent, id, name, 1300, (o === 0 ? y : y + o * 400), 80, 80, "shape=ellipse;shadow=1;editable=0;");
                g_el_out[o].block_name = 'output';
                var out = t.output[o].value instanceof Array ? t.output[o].value[0] : t.output[o].value;
                for (var elem in g_el_body) {
                    if (out === Number(g_el_body[elem].id.split(' ').pop())) {
                        let out = graph.insertVertex(g_el_body[elem], null, block_name('out'), 100, 150, 50, 30, 'editable=0;');
                        out['type'] = 'out';
                        var e1 = graph.insertEdge(parent, null, '', g_el_out[o], out, 'body_output');
                    }
                }
            }
        }
        finally {
            graph.getModel().endUpdate();
            var layout = new mxGraphLayout(graph, true);
            layout.execute(graph.getDefaultParent());
        }
    }
}


//create block name and add constanta's attribute
function block_name(label, type = false) {
    var doc = mxUtils.createXmlDocument();
    var block = doc.createElement('block');
    var name;
    if (type === 'input' || type === 'output') {
        if (typeof label === 'object') {
            name = "<span style='font-style: oblique' id='" + label.var + "'>" + label.var + "</span><br>" +
                "<span style='color: darkgreen' desc='" + label.description + "'>" + label.description + "</span>";
        }
        else if (typeof label === 'string') {
            let l = label.split(' ');
            return "<span style='font-style: oblique' id='" + l[0] + "'>" + l[0] + "</span><br>" +
                "<span style='color: darkgreen' desc='" + (l[1] || '') + "'>" + (l[1] || '') + "</span>";
        }

    }
    else if (type === 'body') {
        if (typeof label === 'object') {
            name = "<span style='font-style: oblique; font-size: large' id='" + label.function + "'>" + label.function.toUpperCase() + "</span><br>";
        }
        else if (typeof label === 'string') {
            return "<span style='font-style: oblique; font-size: large' id='" + label + "'>" + label.toUpperCase() + "</span><br>";
        }
    }
    else if (type === 'constanta') {
        return "<span id='" + label + "'>" + label + "</span>";
    }
    else if (!type) {
        name = "<span id='" + label + "'>" + label + "</span>";
    }
    block.setAttribute('label', name);
    return block;
}

function getKeyByValue(object, value) {
    var path = '';
    for (var key in object) {
        if (object[key] === value) {
            path += key;
            return path
        }
        else if (object[key] instanceof Object) {
            path += key + ' ' + getKeyByValue(object[key], value);
            return path
        }
    }
    return false
}

function isKeyExist(object, key) {
    var d = false;
    for (var k in object) {
        if (k === key) {
            return true;
        }
        else if (object[k] instanceof Object) {
            d = isKeyExist(object[k], key);
        }
    }
    if (d) {
        return true;
    }
    return false;
}

