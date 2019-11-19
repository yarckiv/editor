function main(container, toolbar, sidebar) {
    if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else {
        document.getElementById('title').innerText = chart.name.toUpperCase();

        var editor = new mxEditor();
        var graph = editor.graph;
        editor.setGraphContainer(container);
        show_toolbar(toolbar, sidebar, editor);
        graph.setAllowDanglingEdges(false);
        graph.setDisconnectOnMove(false);


        var threads = {};
        for (let t in chart['code-blocks']) {
            let thread = {};
            let thread_num = 'thread_' + chart['code-blocks'][t].thread;
            threads[thread_num] = chart['code-blocks'][t].blocks;
        }

        mxConstants.CURSOR_MOVABLE_EDGE = null;

        //style for blocks
        var style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
        style[mxConstants.STYLE_ROUNDED] = '1';
        style[mxConstants.STYLE_CURVED] = '1';
        style[mxConstants.STYLE_ARCSIZE] = '8';
        style[mxConstants.STYLE_SPACING_TOP] = '10';
        style[mxConstants.STYLE_FILLCOLOR] = 'white';
        style[mxConstants.STYLE_FONTCOLOR] = '#0B5484';
        style[mxConstants.STYLE_STROKEWIDTH] = '4';
        style[mxConstants.STYLE_FOLDABLE] = '0';
        style[mxConstants.STYLE_STROKECOLOR] = '#79C3F8';
        graph.getStylesheet().putCellStyle('block_exec', style);

        var style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
        style[mxConstants.STYLE_ROUNDED] = '1';
        style[mxConstants.STYLE_CURVED] = '1';
        style[mxConstants.STYLE_ARCSIZE] = '8';
        style[mxConstants.STYLE_SPACING_TOP] = '10';
        style[mxConstants.STYLE_FILLCOLOR] = 'white';
        style[mxConstants.STYLE_FONTCOLOR] = '#0B5484';
        style[mxConstants.STYLE_STROKEWIDTH] = '4';
        style[mxConstants.STYLE_FOLDABLE] = '0';
        style[mxConstants.STYLE_STROKECOLOR] = '#79C3F8';
        style[mxConstants.STYLE_SOURCE_PORT] = 'sourcePort';
        graph.getStylesheet().putCellStyle('block_cond', style);

        var style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
        style[mxConstants.STYLE_ROUNDED] = '1';
        style[mxConstants.STYLE_CURVED] = '1';
        style[mxConstants.STYLE_ARCSIZE] = '8';
        style[mxConstants.STYLE_SPACING_TOP] = '10';
        style[mxConstants.STYLE_FILLCOLOR] = '#79C3F8';
        style[mxConstants.STYLE_FONTCOLOR] = '#0B5484';
        style[mxConstants.STYLE_STROKEWIDTH] = '4';
        style[mxConstants.STYLE_FOLDABLE] = '0';
        style[mxConstants.STYLE_STROKECOLOR] = '#79C3F8';
        graph.getStylesheet().putCellStyle('thread', style);

        //style for edges
        var style = new Object();
        style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
        style[mxConstants.STYLE_DASHED] = '0';
        style[mxConstants.STYLE_MOVABLE] = '1';
        style[mxConstants.STYLE_STARTARROW] = '0';
        style[mxConstants.STYLE_ENDARROW] = '0';
        style[mxConstants.STYLE_STROKEWIDTH] = '2';
        style[mxConstants.EDGE_SELECTION_STROKEWIDTH] = '1';
        style[mxConstants.STYLE_STROKECOLOR] = '#0094DB';
        style[mxConstants.STYLE_VERTICAL_ALIGN] = 'ALIGN_TOP';
        graph.getStylesheet().putCellStyle('connect', style);


        mxEdgeStyle.ThreadConnect = function (state, source, target, points, result) {
            if (source != null && target != null) {
                var pt = new mxPoint(source.getCenterX(), target.getCenterY());

                if (mxUtils.contains(source, pt.x, pt.y)) {
                    pt.y = source.y + source.height;
                }

                result.push(pt);
            }
        };
        mxStyleRegistry.putValue('ThreadConnect', mxEdgeStyle.ThreadConnect);

        var style = new Object();
        style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ThreadConnect;
        style[mxConstants.STYLE_DASHED] = '1';
        style[mxConstants.STYLE_MOVABLE] = '0';
        style[mxConstants.STYLE_STARTARROW] = '0';
        style[mxConstants.STYLE_ENDARROW] = '0';
        style[mxConstants.STYLE_STROKEWIDTH] = '2';
        style[mxConstants.EDGE_SELECTION_STROKEWIDTH] = '1';
        style[mxConstants.STYLE_STROKECOLOR] = 'green';
        style[mxConstants.STYLE_VERTICAL_ALIGN] = 'ALIGN_BOTTOM';
        graph.getStylesheet().putCellStyle('thread_connect', style);


        var keyHandler = new mxKeyHandler(graph);
        keyHandler.bindKey(46, function (evt) {
            editor.execute('delete');
        });

        keyHandler.bindControlKey(90, function (evt) {
            editor.execute('undo');
        });

        keyHandler.bindControlKey(89, function (evt) {
            editor.execute('redo');
        });

        keyHandler.bindControlKey(83, function (evt) {
            save_new(editor);
        });


        //beginning drawing
        graph.getModel().beginUpdate();
        var parent = graph.getDefaultParent();
        var t_block = [];
        var start_x = 100;
        var start_y = 100;

        try {
            if (threads.thread_0) {
                for (let bl in threads.thread_0) {
                    let block = threads.thread_0[bl];
                    let block_style;
                    if (block.type === 'exec' || block.type === 'set' || !block.type) {
                        block_style = 'block_exec'
                    }
                    else if (block.type === 'cond') {
                        block_style = 'block_cond'
                    }
                    else if (block.type === 'thread_start' || block.type === 'thread_wait') {
                        block_style = 'thread'
                    }
                    var block_x = bl === 0 ? start_x : start_x + bl * 150;
                    t_block[block.id] = graph.insertVertex(parent, '_' + block.id, block.func, block_x, start_y, 90, 70, block_style);
                }
            }
            //edge draw
            var th_con = [];
            for (let m = 0; m < threads.thread_0.length; m++) {
                if (threads.thread_0[m].next) {
                    let source_cell = [];
                    t_block.map(c => {
                        if (Number(c.id.split('_')[1]) === threads.thread_0[m].id) source_cell.push(c)
                    });
                    let e = graph.insertEdge(parent, null, '', source_cell[0], t_block[threads.thread_0[m].next], 'connect');
                }
                if (threads.thread_0[m].type === 'thread_start') {
                    for (let thr in threads.thread_0[m].thread) {
                        let need = 'thread_' + threads.thread_0[m].thread[thr];
                        if (Object.keys(threads).includes(need)) {
                            var style = graph.stylesheet.getCellStyle("thread_connect");
                            for (let th_b in threads[need]) {
                                let th_b_x = t_block[threads.thread_0[m].id].geometry.x + 150;
                                let th_b_y = t_block[threads.thread_0[m].id].geometry.y + 150;
                                th_con[th_b] = graph.insertVertex(parent, '_' + threads[need][th_b].id, threads[need][th_b].func, th_b_x, th_b_y, 90, 70, 'block_exec');
                                graph.insertEdge(parent, null, 'start', t_block[threads.thread_0[m].id], th_con[th_b], 'thread_connect;')
                                let wait = [];
                                threads.thread_0.map(w => {
                                    if (w.type === 'thread_wait' && w.thread.includes(threads.thread_0[m].thread[thr])) wait.push(w.id)
                                });
                                graph.insertEdge(parent, null, 'wait', t_block[wait[0]], th_con[th_b], 'thread_connect')
                            }
                        }
                    }
                }
                if (threads.thread_0[m].var === 'out') {
                    let out = graph.insertVertex(parent, '_' + chart['final-blocks'][0].id, chart['final-blocks'][0].func, block_x +150, start_y, 90, 70, 'block_exec');
                    t_block[threads.thread_0[m].id].setValue('OUT');
                    let out_connect = graph.insertEdge(parent, null, 'out connect', t_block[threads.thread_0[m].id], out, 'connect');
                    console.log('out', out_connect)
                }
            }
        }
        finally {
            graph.getModel().endUpdate();
            show_sidebar(sidebar, editor);
        }

        console.log('t_block', t_block)

        //finishing drawing
    }
}
