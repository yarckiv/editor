//toolbar
function show_toolbar(toolbar, sidebar, editor) {

    // Workaround for Internet Explorer ignoring certain CSS directives
    if (mxClient.IS_QUIRKS) {
        document.body.style.overflow = 'hidden';
        new mxDivResizer(toolbar);
        new mxDivResizer(sidebar);
    }

    // Creates a new DIV that is used as a toolbar and adds toolbar buttons.
    var spacer = document.createElement('div');
    spacer.style.display = 'inline';
    spacer.style.padding = '8px';
    addToolbarButton(editor, toolbar, 'new_shape', 'New shape', 'https://jgraph.github.io/mxgraph/javascript/examples/images/plus.png');
    addToolbarButton(editor, toolbar, 'delete', 'Delete', 'https://jgraph.github.io/mxgraph/javascript/examples/images/delete2.png');
    addToolbarButton(editor, toolbar, 'save', 'Save', 'https://jgraph.github.io/mxgraph/javascript/examples/editors/images/save.gif');
    toolbar.appendChild(spacer.cloneNode(true));

    addToolbarButton(editor, toolbar, 'undo', '', 'https://jgraph.github.io/mxgraph/javascript/examples/images/undo.png');
    addToolbarButton(editor, toolbar, 'redo', '', 'https://jgraph.github.io/mxgraph/javascript/examples/images/redo.png');

    toolbar.appendChild(spacer.cloneNode(true));

    // addSidebarIcon(graph, sidebar, 	table, 'https://jgraph.github.io/mxgraph/javascript/examples/images/icons48/table.png');
}

function addToolbarButton(editor, toolbar, action, label, image, isTransparent) {
    var button = document.createElement('button');
    button.style.fontSize = '10';
    if (image != null) {
        var img = document.createElement('img');
        img.setAttribute('src', image);
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.verticalAlign = 'middle';
        img.style.marginRight = '2px';
        button.appendChild(img);
    }
    if (isTransparent) {
        button.style.background = 'transparent';
        button.style.color = '#FFFFFF';
        button.style.border = 'none';
    }
    mxEvent.addListener(button, 'click', function (evt) {
        if (action === 'new_shape') {
            new_shape(editor);
        }
        else if (action === 'save') {
            save_new(editor);
        }
        else {
            editor.execute(action);
        }
    });
    mxUtils.write(button, label);
    toolbar.appendChild(button);
};

//overwrite for show file sidebar
function new_shape(editor) {
    var side = document.getElementById('sidebarContainer');
    side.style.display = 'block';
    show_sidebar(side, editor);
};

function save_new(editor) {
    var new_t = Object();
    new_t['function'] = document.getElementById('title').innerText;
    var info = editor.graph.getModel().cells;
    var input = [];
    var output = [];
    var body = [];
    for (var r in info) {
        if (info[r].id.startsWith('input')) {
            input.push(info[r]);
        }
        else if (info[r].id.startsWith('body')) {
            body.push(info[r])
        }
        else if (info[r].id.startsWith('output')) {
            output.push(info[r])
        }
    }
    new_t['input'] = [];
    for (var i in input) {
        let label = $(input[i].value.getAttribute('label'));
        if (label.length > 0) {
            new_t['input'].push({
                'var': label.attr('id'),
                'description': label[2].innerHTML
            });
        }
    }

    new_t['body'] = [];
    for (var b in body) {
        let id = Number(body[b].id.split(' ')[1]);
        let func = $(body[b].value.getAttribute('label'));
        let params = [];
        if (body[b].children) {
            for (var ch_b in body[b].children) {
                let child = body[b].children[ch_b];
                if (child.type === 'var_in') {
                    for (var e in child.edges) {
                        if ('input'.includes(child.edges[e].target.block_name)) {
                            params = {'item_id': {'type': child.type}};
                            params.item_id.value = $(child.edges[e].target.value.getAttribute('label')).attr('id');
                        }
                    }
                }
                if (child.type === 'const') {
                    for (var e in child.edges) {
                        if ('const'.includes(child.edges[e].target.block_name)) {
                            params = {'item_id': {'type': child.type}};
                            params.item_id.value = $(child.edges[e].target.value.getAttribute('label')).attr('id');
                        }
                    }
                }
                if (child.type === 'in') {
                    for (var e in child.edges) {
                        if ('const'.includes(child.edges[e].target.block_name)) {
                            params = {'IN': {'type': 'const'}};
                            params.IN.value = $(child.edges[e].target.value.getAttribute('label')).attr('id');
                        }
                    }
                }
                if (child.type === 'args') {
                    var args = [];
                    for (var e in child.edges) {
                        if ('block_out'.includes(child.edges[e].target.type)) {
                            args.push({
                                'type': 'block_out',
                                'value': Number(child.edges[e].target.parent.id.split(' ')[1])
                            });
                        }
                    }
                }
                params['args'] = args;
            }
        }
        new_t.body.push({
            'id': id,
            'function': func.attr('id'),
            'params': params,
        });
    }

    new_t['output'] = [];
    for (var o in output) {
        let label = $(output[o].value.getAttribute('label'));
        if (label.length > 0) {
            var val;
            for (var e in output[o].edges) {
                val = Number(output[o].edges[e].target.parent.id.split(' ')[1]);
            }
            new_t['output'].push({
                'var': label.attr('id'),
                'value': val,
                'description': label[2].innerHTML
            });
        }
    }

    if (new_t) {
        $.ajax('/result', {
            method: "POST",
            contentType: 'application/json',
            data: JSON.stringify(new_t),
            dataType: "json",
            success: function (resp) {
                console.log('resp', resp)
                location.href='/result'
            },
            error: function () {
                alert('Try later')
            }
        })
    }
}
