function main(container, toolbar, sidebar) {
    if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else {
        document.getElementById('title').innerText = t.function;
        // mxConnectionHandler.prototype.connectImage = new mxImage('/static/img/connector.gif', 16, 16);


        var editor = new mxEditor();
        editor.setGraphContainer(container);
        var graph = editor.graph;
        show_toolbar(toolbar, sidebar, editor);
        graph.dropEnabled = true;
        // Enables new connections in the graph
        graph.setConnectable(true);
        graph.setMultigraph(false);

        //scrolling
        mxGraph.prototype.scrollCellToVisible = function (cell, center) {
        };


        // Stops editing on enter or escape keypress
        var keyHandler = new mxKeyHandler(graph);
        var rubberband = new mxRubberband(graph);


        //If you want the graph to be read-only
        // graph.setEnabled(false);

        //disable move edge
        graph.setAllowDanglingEdges(false);
        graph.setDisconnectOnMove(false);

        // get mouse click event
        // graph.addListener(mxEvent.CLICK, function (sender, evt) {
        // });


        //custom hover for blocks
        function updateStyle(state, hover) {
            if (hover) {
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


        var keyHandler = new mxKeyHandler(graph);
        keyHandler.bindKey(46, function (evt) {
            editor.execute('delete');
        });

        // Enables rubberband selection
        new mxRubberband(graph);

        //change label value
        var graphCellLabelChanged = graph.cellLabelChanged;
        graph.cellLabelChanged = function (cell, newValue, autoSize) {
            // Cloned for correct undo/redo
            var elt = cell.value.cloneNode(true);
            let newname = block_name(newValue, cell.block_name);
            elt.setAttribute('label', newname);
            newValue = elt;
            graphCellLabelChanged.apply(this, arguments);
            cell.geometry.height = cell.geometry.width;
        };

        //autoresize vertex
        graph.setAutoSizeCells(true);
        graph.setCellsResizable(false);


        graph.convertValueToString = function (cell) {
            if (mxUtils.isNode(cell.value)) {
                return cell.getAttribute('label', '')
            }
        };
        graph.htmlLabels = true;

        //disable doubleclick
        graph.dblClick = function (evt, cell) {
        };

        //change vertex selection color
        mxVertexHandler.prototype.getSelectionColor = function () {
            return '#b92c28';
        };
        mxVertexHandler.prototype.getSelectionStrokeWidth = function () {
            return '4';
        };

        //style for input
        var style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
        style[mxConstants.STYLE_FILLCOLOR] = "white";
        style[mxConstants.STYLE_FONTCOLOR] = 'darkblue';
        style[mxConstants.STYLE_FONTSIZE] = '14';
        style[mxConstants.STYLE_STROKECOLOR] = 'black';
        style[mxConstants.STYLE_FILLCOLOR] = '#EEEEEE';
        style[mxConstants.STYLE_MOVABLE] = '1';
        graph.getStylesheet().putCellStyle('input', style);

        //style for body
        var style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
        style[mxConstants.STYLE_SPACING_TOP] = '10';
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
        style[mxConstants.EDGE_SELECTION_STROKEWIDTH] = '1';
        style[mxConstants.STYLE_STROKECOLOR] = 'blue';
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
        style[mxConstants.STYLE_FONTSIZE] = '14';
        style[mxConstants.STYLE_FONTCOLOR] = 'red';
        style[mxConstants.STYLE_FILLCOLOR] = 'white';
        graph.getStylesheet().putCellStyle('constanta', style);


        // ----------------- control for new connections ---------------------- //
        graph.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
            var edge = evt.getProperty('cell');
            if (edge.source.block_name === 'input' || edge.target.block_name === 'input') {
                edge.style = 'body_input';
            }
            else if (edge.source.block_name === 'output' || edge.target.block_name === 'output') {
                edge.style = 'body_output'
            }
            else {
                edge.style = 'constanta_input';
            }
        });

        var connectionHandlerConnect = mxConnectionHandler.prototype.connect;
        mxConnectionHandler.prototype.connect = function (source, target, evt, dropTarget, style) {
            if ('input, const'.includes(source.block_name) || target.block_name === 'output') {
                source = [target, target = source][0];
            }
            if (target.block_name === 'input') {
                if (source.block_name === 'const' || source.block_name === 'output' || source.block_name === 'input' ||
                    (source.type && source.type.includes('out'))) {
                    return false;
                }
                if (source.type === 'in_const') {
                    source.type = 'in_var_in';
                    graph.getModel().remove(source.edges[0]);
                }
                else if (source.block_name !== 'body') {
                    source.type = 'var_in';
                    if (source.edges) {
                        graph.getModel().remove(source.edges[0]);
                    }
                }
            }
            if (source.block_name === 'body') {
                if ('input, const'.includes(target.block_name)) {
                    let type = target.block_name === 'input' ? 'var_in' : 'const';
                    for (var c = 0; c < Object.keys(source.children).length; c++) {
                        if (!source.children[c].edges && 'var_in'.includes(source.children[c].type)) {
                            source = source.children[c];
                            source.type = type;
                            break;
                        }
                        else if (source.children[c].type === 'args') {
                            source = source.children[c];
                            break;
                        }
                        else {
                            if (source.children[0].edges) {
                                graph.getModel().remove(source.children[0].edges[0]);
                            }
                            source = source.children[0];
                            source.type = type;
                            break;
                        }
                    }
                }
            }
            if (target.block_name === 'body') {
                console.log('source 0', source)
                if (source.type.includes('in') || source.type.includes('const')) {
                    return false;
                }
                //todo connect with in or args
                if (source.type.includes('out')) {
                    console.log('source 1', source)
                    let ch = target.children;
                    for (var c = 0; c < Object.keys(ch).length; c++) {
                        if (!ch[c].edges && ch[c].type.includes('in')) {
                            target = ch[c];
                            break;
                        }
                        else if (ch[c].type === 'args') {
                            console.log('ch', ch)
                            target = ch[c];
                            break;
                        }
                        else {
                            let t = [];
                            target.children.map(f => {
                                if (f.type.includes('in') || f.type.includes('const')) t.push(f)
                            });
                            if (t[0].edges) {
                                graph.getModel().remove(t[0].edges[0]);
                            }
                            target = t[0];
                            target.type = 'block_out';
                            break;
                        }
                    }
                }
            }

            if (source.type) {
                if (source.parent.id === target.id) {
                    return false;
                }
                if (target.type) {
                    let t = [];
                    if (source.edges) {
                        source.edges.map(f => {
                            if (+f.source.id === +target.id) t.push(+f.source.id)
                        });
                    }
                    if (source.type.includes('out') && target.type.includes('out') || t.length > 0 ||
                        source.parent.id === target.parent.id) {
                        return false;
                    }
                    if ('in_const, args, var_in'.includes(target.type)) {
                        if ('in, var_in, const'.includes(source.type)) {
                            return false;
                        }
                        if (target.type.includes('in')) {
                            target.type = 'in_block_out';
                            graph.getModel().remove(target.edges[0]);
                            source = [target, target = source][0];
                        }
                    }
                }
                if (target.block_name === 'const') {
                    if (source.type.includes('out')) {
                        return false;
                    }
                    else if (source.type.includes('in')) {
                        source.type = 'const';
                        graph.getModel().remove(source.edges[0]);
                    }
                }
            }
            if (source.block_name === 'output') {
                if (target.block_name === 'const' || target.block_name === 'output' || !target.type.includes('out')) {
                    return false;
                }
                if (target.block_name === 'body') {
                    for (var c = 0; c < Object.keys(target.children).length; c++) {
                        if (target.children[c].type.includes('out')) {
                            target = target.children[c];
                            break;
                        }
                    }
                }
            }
            return connectionHandlerConnect.apply(this, arguments);
        }
        ;

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
                g_el_in[i] = graph.insertVertex(parent, id, name, x, (i === 0 ? y : y + i * 400), 120, 80, 'input');
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
                        g_el_body[b] = graph.insertVertex(parent, id, name, b_x[0], b_y[0], 150, 150, 'body;');
                        g_el_body[b].block_name = 'body';
                        let inp = graph.insertVertex(g_el_body[b], null, block_name(Object.keys(t.body[b].params)[0]), -150, 100, 50, 30, 'defaultHotspot=1;editable=0;movable=0;fontSize=13');
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
                        let inp = graph.insertVertex(g_el_body[b], null, block_name(Object.keys(t.body[b].params)), -150, 100, 50, 30, 'editable=0;movable=0;fontSize=13');
                        inp['type'] = 'const';
                        if (t.body[b].params.item_id.value) {
                            let constanta = graph.insertVertex(parent, null, block_name(t.body[b].params.item_id.value), b_x[0] - 150, b_y[0], 100, 100, 'constanta');
                            constanta.block_name = 'const';
                            addOverlays(graph, constanta);
                            graph.insertEdge(parent, null, '', inp, constanta, 'constanta_input');
                            b_y[0] += 200;
                        }
                    }
                    else if (t.body[b].params.item_id.type === 'block_out') {
                        body_content[0].push(t.body[b].id);
                        g_el_body[b] = graph.insertVertex(parent, id, name, b_x[0], b_y[0], 150, 150, 'body;');
                        g_el_body[b].block_name = 'body';
                        let inp = graph.insertVertex(g_el_body[b], null, block_name(Object.keys(t.body[b].params)[0]), -150, 100, 50, 30, 'defaultHotspot=1;editable=0;movable=0;fontSize=13');
                        inp['type'] = 'block_out';
                        for (var i in g_el_in) {
                            var l = $(g_el_in[i].getAttribute('label'));
                            if (t.body[b].params.item_id.value === l.attr('id')) {
                                graph.insertEdge(parent, null, '', inp, g_el_in[i], 'body_input');
                            }
                        }
                        b_y[0] += 200;
                    }

                }
                else {
                    var u = -1;
                    if (isKeyExist(t.body[b].params, 'args')) {
                        var args_values = [];
                        var inp_value = [];
                        for (var n = 0; n < t.body[b].params.args.length; n++) {
                            if (t.body[b].params.args[n].type === 'var_in') {
                                for (let i in g_el_in) {
                                    if (t.body[b].params.args[n].value === $(g_el_in[i].getAttribute('label')).attr('id')) {
                                        inp_value.push(g_el_in[i].id)
                                    }
                                }
                            }
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
                    let inp = graph.insertVertex(g_el_body[b], null, block_name('args'), -150, 150, 50, 30, 'editable=0;movable=0;fontSize=13');
                    inp['type'] = 'args';
                    if (inp_value) {
                        for (let i in inp_value) {
                            for (let g_in in g_el_in) {
                                if (inp_value[i] === g_el_in[g_in].id) {
                                    graph.insertEdge(parent, null, '', inp, g_el_in[g_in], 'body_input');
                                }
                            }
                        }
                    }
                    for (var bod in args_values) {
                        for (var bod_id in g_el_body) {
                            if (args_values[bod] === +g_el_body[bod_id].id.split(' ')[1]) {
                                let out = graph.insertVertex(g_el_body[bod_id], null, block_name('out'), 100, 100, 50, 30, 'editable=0;movable=0;fontSize=13');
                                out['type'] = 'block_out';
                                graph.insertEdge(parent, null, '', inp, out, 'constanta_input');
                            }
                        }
                    }
                    if (isKeyExist(t.body[b].params, 'IN')) {
                        if (t.body[b].params.IN.type === 'const') {
                            let inp = graph.insertVertex(g_el_body[b], null, block_name(Object.keys(t.body[b].params)[0]), -150, 100, 50, 30, 'editable=0;');
                            inp['type'] = 'in_const';
                            let constanta = graph.insertVertex(parent, null, block_name(t.body[b].params.IN.value), b_x[u] - 100, b_y[u], 80, 80, 'constanta');
                            constanta.block_name = 'const';
                            addOverlays(graph, constanta);
                            graph.insertEdge(parent, null, '', inp, constanta, 'constanta_input');
                        }
                        else if (t.body[b].params.IN.type === 'var_in') {
                            let inp = graph.insertVertex(g_el_body[b], null, block_name(Object.keys(t.body[b].params)[0]), -150, 100, 50, 30, 'editable=0;');
                            inp['type'] = 'in_var_in';
                            for (var i in g_el_in) {
                                var l = $(g_el_in[i].getAttribute('label'));
                                if (t.body[b].params.IN.value === l.attr('id')) {
                                    graph.insertEdge(parent, null, '', inp, g_el_in[i], 'body_input');
                                }
                            }
                        }
                        else if (t.body[b].params.IN.type === 'block_out') {
                            let inp = graph.insertVertex(g_el_body[b], null, block_name(Object.keys(t.body[b].params)[0]), -150, 100, 50, 30, 'editable=0;');
                            inp['type'] = 'in_block_out';
                            for (var i in g_el_body) {
                                if (t.body[b].params.IN.value === +g_el_body[i].id.split(' ')[1]) {
                                    let out = graph.insertVertex(g_el_body[i], null, block_name('out'), 100, 100, 50, 30, 'editable=0;movable=0;fontSize=13');
                                    out['type'] = 'block_out';
                                    graph.insertEdge(parent, null, '', inp, out, 'constanta_input');
                                }
                            }
                        }
                    }
                    b_y[u] += 200;
                }
            }
            for (var o = 0; o < t.output.length; o++) {
                var id = 'output ' + o;
                var name = block_name(t.output[o], 'output');
                g_el_out[o] = graph.insertVertex(parent, id, name, 1300, (o === 0 ? y : y + o * 400), 120, 80, "shape=ellipse;shadow=1;fontSize=14");
                g_el_out[o].block_name = 'output';
                var out = t.output[o].value instanceof Array ? t.output[o].value[0] : t.output[o].value;
                for (var elem in g_el_body) {
                    if (out === Number(g_el_body[elem].id.split(' ').pop())) {
                        let out = graph.insertVertex(g_el_body[elem], null, block_name('out'), 100, 150, 50, 30, 'editable=0;movable=0;fontSize=13');
                        out['type'] = 'out';
                        var e1 = graph.insertEdge(parent, null, '', g_el_out[o], out, 'body_output');
                    }
                }
            }
        }
        finally {
            graph.getModel().endUpdate();
            for (let i = 0; i < g_el_in.length; i++) {
                addOverlays(graph, g_el_in[i]);
            }
            for (let o = 0; o < g_el_out.length; o++) {
                addOverlays(graph, g_el_out[o]);
            }
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
    else if (type === 'const') {
        return "<span id='" + label + "'>" + label + "</span>";
    }
    else if (!type) {
        name = "<span id='" + label + "'>" + label + "</span>";
    }
    block.setAttribute('label', name);
    return block;
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

function addOverlays(graph, cell) {
    var overlay = new mxCellOverlay(new mxImage('/static/img/edit.png', 24, 24), 'Edit');
    overlay.cursor = 'hand';
    overlay.align = mxConstants.ALIGN_CENTER;
    overlay.verticalAlign = mxConstants.ALIGN_TOP;
    overlay.addListener(mxEvent.CLICK, function (sender, evt) {
        showEdit(graph, cell);
    });
    graph.addCellOverlay(cell, overlay);
}

function showEdit(graph, cell) {
    // Creates a form
    var form = new mxForm('Edit');
    let label = $(cell.getAttribute('label'));
    if (cell.block_name === 'input' || cell.block_name === 'output') {
        var nameField = form.addText('Name', label.attr('id'));
        var descField = form.addText('Description', label[2].innerHTML);
    }
    else {
        var nameField = form.addText('Value', label.attr('id'));
    }

    var wnd = null;
    // Defines the function to be executed when the
    // OK button is pressed in the dialog
    var okFunction = function () {
        let newValue = ('input, output'.includes(cell.block_name)) ? nameField.value + ' ' + descField.value : nameField.value;
        graph.cellLabelChanged(cell, newValue);
        // var clone = cell.value.clone();
        //
        // clone.name = nameField.value;
        // clone.desc = descField.value;
        // graph.model.setValue(cell, clone);

        wnd.destroy();
    };

    // Defines the function to be executed when the
    // Cancel button is pressed in the dialog
    var cancelFunction = function () {
        wnd.destroy();
    };
    form.addButtons(okFunction, cancelFunction);
    wnd = showModalWindow('Edit', form.table, 200, 150);
}

function showModalWindow(title, content, width, height) {
    var background = document.createElement('div');
    background.style.position = 'absolute';
    background.style.left = '0px';
    background.style.top = '0px';
    background.style.right = '0px';
    background.style.bottom = '0px';
    background.style.background = 'black';
    mxUtils.setOpacity(background, 50);
    document.body.appendChild(background);

    if (mxClient.IS_QUIRKS) {
        new mxDivResizer(background);
    }

    var x = Math.max(0, document.body.scrollWidth / 2 - width / 2);
    var y = Math.max(10, (document.body.scrollHeight ||
        document.documentElement.scrollHeight) / 2 - height * 2 / 3);
    var wnd = new mxWindow(title, content, x, y, width, height, false, true);
    wnd.setClosable(true);

    // Fades the background out after after the window has been closed
    wnd.addListener(mxEvent.DESTROY, function (evt) {
        mxEffects.fadeOut(background, 50, true,
            10, 30, true);
    });
    wnd.setVisible(true);

    return wnd;
}
