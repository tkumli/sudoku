tam.Board = fabric.util.createClass(fabric.Observable, {
    initialize: function(opts) {
        // basic state
        this.tiles = null;
        this.ranges = [];
        this.activeTile = null;
        this.activeTilePos = null;
        this.sameValueRangeHL = false;

        // history
        this.history = [];
        this.history.pos = -1;
        this.history.last = -1;

        // ui
        this.canvas = opts.canvas;
        this.ui = null;
        this.buildUI();
        this.buildBoard();
        this.saveStateToHistory();
    },

    load: function(puzzle) {
        let i = 0;
        for (k in this.tiles) {
            let tile = this.tiles[k];
            let value = parseInt(puzzle[i]);
            if (value == 0) {
                tile.clear();
                tile.fixOff();
            } else {
                tile.setValue(value);
                tile.fixOn();
            }
            i++;
        }
    },

    // not nice ...
    play: function() {
        if (!this.ideg) { this.ideg = this.ranges[20].tiles.subset(6); }
        let {value, done}  = this.ideg.next();
        if (done) {
            this.ideg = null;
            return;
        }
        value.forEach( function(tile) { tile.playHighlightOn()} );
    },


    fillNotes: function() {
        for (let k in this.tiles) {
            let tile = this.tiles[k];
            if ( (tile.value == null) && (tile.notes.size == 0) ) {
                tile.notes = new Set([1,2,3,4,5,6,7,8,9]);
            }
        }
    },

    /////////////////////////////////////
    // user interactions
    userMoves: function(dir) {

        if (this.activeTile) {
            let {r,c} = this.activeTilePos;

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

            this.activeTilePos = {r: r, c: c};
            this.activeTile = this.tiles['r' + r + 'c' + c];

        } else {
            this.activeTilePos = {r: 1, c: 1};
            this.activeTile = this.tiles['r1c1'];
        }
    },

    userJumps: function(whereto) {
        this.activeTilePos = this.activeTilePos || {r: 1, c: 1};

        var {r,c} = this.activeTilePos;

        var wheretoMap = {
            left:   (r, c) => ([r, 1]),
            right:  (r, c) => ([r, 9]),
            top:    (r, c) => ([1, c]),
            bottom: (r, c) => ([9, c]),
        };
        [r,c] = wheretoMap[whereto](r, c);

        this.activeTilePos = {r: r, c: c};
        this.activeTile = this.tiles['r'+r+'c'+c];
        console.log(this.activeTilePos);
    },

    userTypesValue: function(num) {
        if (this.activeTile) {
            this.activeTile.setValue(num);
            this.saveStateToHistory();
            this.activeTile.ranges.forEach( range => range.clearNoteOnTiles(num));
        }
    },

    userTypesNote: function(num) {
        if (this.activeTile) { this.activeTile.toggleNote(num); }
    },

    userCleares: function() {
        if (this.activeTile) { this.activeTile.clear(); }
    },

    userTogglesFix: function () {
        if (this.activeTile) { this.activeTile.toggleFix(); }
    },

    userRequestsHighlight: function() {
        this.sameValueRangeHL = !this.sameValueRangeHL;
    },

    // history handling
    saveStateToHistory: function() {
        let tiles = {};
        for (key in this.tiles) {
            tiles[key] = this.tiles[key].saveState();
        }
        this.history.pos++;
        this.history.last = this.history.pos;
        this.history[this.history.pos] = {
            activeTile: this.activeTile,
            tiles: tiles 
        };
    },

    restoreStateUndo: function() {
        if (this.history.pos == 0) {
            this.alert();
            return;
        }
        this.history.pos--;
        let item = this.history[this.history.pos];
        this.activeTile = item.activeTile;
        for (key in this.tiles) {
            this.tiles[key].restoreState(item.tiles[key]);
        }
    },

    restoreStateRedo: function() {
        if (this.history.pos == this.history.last) {
            this.alert();
            return;
        }
        this.history.pos++;
        let item = this.history[this.history.pos];
        this.activeTile = item.activeTile;
        for (key in this.tiles) {
            this.tiles[key].restoreState(item.tiles[key]);
        }
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
                    board: this,
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

    resetDecoration: function() {
        // reset decorations (model) on all ranges and tiles
        this.ranges.forEach( range => { range.highlightOff(); });
        for (let key in this.tiles) { this.tiles[key].decorationOff(); }
    },

    render: function() {

        // decorate based on active tile
        if (this.activeTile) {

            // 1) highlight active tile's ranges
            this.activeTile.highlightRanges();

            // 2) highlight tiles with the same value
            if (this.activeTile.value) {
                for (let key in this.tiles) {
                    if (this.tiles[key] == this.activeTile) { continue; }
                    if (this.tiles[key].value == this.activeTile.value) {
                        this.tiles[key].sameValueHighLightOn();
                        if (this.sameValueRangeHL) {
                            this.tiles[key].highlightRanges();
                        }
                    }
                }
            }

            // 3) strong indication for conflicting tiles
            let value = this.activeTile.value;
            if (value) {
                let sameValueTiles = new Set();
                this.activeTile.ranges.forEach( range => {
                    range.tiles.filter( tile => tile.value == value).forEach( tile => sameValueTiles.add(tile) );
                });
                if (sameValueTiles.size > 1) {
                    for (tile of sameValueTiles.values()) { tile.valueConflict = true; }
                }
            }

        }

        // update ui elements
        for (let key in this.tiles) { this.tiles[key].render(); }

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