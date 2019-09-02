tam.Board = fabric.util.createClass(fabric.Observable, {
    initialize: function(opts) {
        this.tiles = null;
        this.ranges = [];
        this.activeTile = null;

        // ui
        this.canvas = opts.canvas;
        this.prevSelection = null;
        this.selection = null;
        this.ui = null;
        this.buildUI();
        this.buildBoard();
    },

    /////////////////////////////////////
    // user interactions
    userMoves: function(dir) {
        if (this.selection == null) {
            this.selection = {r: 1, c: 1};
            this.activeTile = this.tiles['r1c1'];
            this.render();
            return;
        }

        var [r,c] = [this.selection.r, this.selection.c];
        this.prevSelection = {r: r, c: c};

        var dirMap = {
            left:  (r, c) => ([r, c-1]),
            right: (r, c) => ([r, c+1]),
            up:    (r, c) => ([r-1, c]),
            down:  (r, c) => ([r+1, c]),
        };

        [r,c] = dirMap[dir](r, c);
        if (r == 0) { r = 1; this.alert() }
        if (r == 10) { r = 9; this.alert() }
        if (c == 0) { c = 1; this.alert() }
        if (c == 10) { c = 9; this.alert() }

        this.selection = {r: r, c: c}
        this.activeTile = this.tiles['r'+r+'c'+c];
        this.render();
    },

    userJumps: function(whereto) {
        this.selection = this.selection || {r: 1, c: 1};

        var [r,c] = [this.selection.r, this.selection.c];
        this.prevSelection = {r: r, c: c};

        var wheretoMap = {
            left:   (r, c) => ([r, 1]),
            right:  (r, c) => ([r, 9]),
            top:    (r, c) => ([1, c]),
            bottom: (r, c) => ([9, c]),
        };

        [r,c] = wheretoMap[whereto](r, c);
        this.selection = {r: r, c: c};
        this.activeTile = this.tiles['r'+r+'c'+c];
        this.render();
    },

    userTypesValue: function(Num) {
        if (!this.activeTile) { return; }
        this.activeTile.userSetsValue(Num);
    },

    userTypesNote: function(Num) {
        if (!this.activeTile) { return; }
        this.activeTile.userTogglesNote(Num);
    },

    userCleares: function() {
        if (!this.activeTile) { return; }
        this.activeTile.userClears();
    },

    userTogglesFix: function () {
        if (!this.activeTile) { return; }
        this.activeTile.userTogglesFix();
    },

    userRequestsHighlight: function() {
        this.activeTile.highlightRanges();
    },

    buildUI: function() {
        var canvas = this.canvas;

        var pane = new fabric.Rect({
            top: 0,
            left: 0,
            width : 810 + 8*1 + 2*3 + 2*5,
            height : 810 + 8*1 + 2*3 + 2*5,
            fill : '#573'
        });
        canvas.add(pane);
        tam.pane = pane; // ideg

        this.ui = {
            pane: pane
        }

    },

    buildBoard: function() {
        // tiles
        this.tiles = {};
        for (let r=1; r<=9; r++) {
            for (let c=1; c<=9; c++) {
                tile = new tam.Tile({
                    board: this.canvas,
                    r: r,
                    c: c
                });
                this.tiles['r'+r+'c'+c] = tile;
            }
        }
        
        // ranges
        for (let r = 1; r <= 9; r++) {  // rows
            let range = new tam.Range();
            range.setType("row");
            for (let c = 1; c <= 9; c++) { range.addTile(this.tiles['r'+r+'c'+c]); }
            this.ranges.push(range);
        }

        for (let c = 1; c <= 9; c++) {  // columns
            let range = new tam.Range();
            range.setType("column");
            for (let r = 1; r <= 9; r++) { range.addTile(this.tiles['r'+r+'c'+c]); }
            this.ranges.push(range);
        }

        for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 3; bc++) {
                let range = new tam.Range();
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        range.addTile(this.tiles['r'+ (br*3+r+1) +'c'+ (bc*3+c+1)]);
                    }
                }
                this.ranges.push(range);
            }
        }

    },

    render: function() {
        var r,c;

        if (this.prevSelection) {
            [r,c] = [this.prevSelection.r, this.prevSelection.c];
            this.tiles['r'+r+'c'+c].userDeactivates();
        }

        if (this.selection) {
            [r,c] = [this.selection.r, this.selection.c];
            this.tiles['r'+r+'c'+c].userActivates();
        }
    },

    alert: function() {
        fabric.util.animateColor('#573', '#F22', 300, {
            onChange: function(c) {
               this.ui.pane.set('fill', c);
               this.canvas.renderAll();
            }.bind(this),
            onComplete: function() {
               this.ui.pane.set('fill', '#573');
               this.canvas.renderAll();
            }.bind(this)
          });
    }


});