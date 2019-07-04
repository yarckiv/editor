//sidebar
function show_sidebar(side, editor) {
    var tbContainer = document.createElement('div');
    tbContainer.style.position = 'absolute';
    tbContainer.style.overflow = 'hidden';
    tbContainer.style.width = '20px';
    tbContainer.style.padding = '2px';
    tbContainer.style.left = '10px';
    tbContainer.style.top = '10px';
    tbContainer.style.width = '24px';
    tbContainer.style.bottom = '0px';

    side.appendChild(tbContainer);

    // Creates new sidebar without event processing
    var sidebar = new mxToolbar(tbContainer);
    sidebar.enabled = false

    var addVertex = function (icon, w, h, style) {
        var vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);
        vertex.setVertex(true);

        var img = addSidebarItem(editor, sidebar, vertex, icon);
        img.enabled = true;

        editor.graph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
            var tmp = editor.graph.isSelectionEmpty();
            mxUtils.setOpacity(img, (tmp) ? 100 : 20);
            img.enabled = tmp;
        });
    };

    addVertex('/static/img/rectangle.gif', 100, 40, '');
    // addVertex('editors/images/rounded.gif', 100, 40, 'shape=rounded');
    // addVertex('editors/images/ellipse.gif', 40, 40, 'shape=ellipse');
    // addVertex('editors/images/rhombus.gif', 40, 40, 'shape=rhombus');
    // addVertex('editors/images/triangle.gif', 40, 40, 'shape=triangle');
    // addVertex('editors/images/cylinder.gif', 40, 40, 'shape=cylinder');
    // addVertex('editors/images/actor.gif', 30, 40, 'shape=actor');
}

function addSidebarItem(editor, sidebar, prototype, image) {
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    var funct = function (editor, evt, cell, x, y) {
        editor.stopEditing(false);
        var vertex = editor.getModel().cloneCell(prototype);
        vertex.geometry.x = x;
        vertex.geometry.y = y;

        editor.addCell(vertex);
        editor.setSelectionCell(vertex);
    };

    // Creates the image which is used as the drag icon (preview)
    var img = sidebar.addMode(null, image, function (evt, cell) {
        var pt = this.graph.getPointForEvent(evt);
        funct(editor.graph, evt, cell, pt.x, pt.y);
    });

    // Disables dragging if element is disabled. This is a workaround
    // for wrong event order in IE. Following is a dummy listener that
    // is invoked as the last listener in IE.
    mxEvent.addListener(img, 'mousedown', function (evt) {
        // do nothing
    });

    // This listener is always called first before any other listener
    // in all browsers.
    mxEvent.addListener(img, 'mousedown', function (evt) {
        if (img.enabled == false) {
            mxEvent.consume(evt);
        }
    });

    mxUtils.makeDraggable(img, editor.graph, funct);
    return img;
}
