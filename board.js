tam.Board = fabric.util.createClass(fabric.Observable, {
    initialize: function(opts) {
        this.tiles = null;
        this.ranges = [];
        this.activeTile = null;
        this.activeTilePos = null;
        this.sameValueRangeHL = false;

        // ui
        this.canvas = opts.canvas;
        this.ui = null;
        this.buildUI();
        this.buildBoard();
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

    userTypesValue: function(Num) {
        if (this.activeTile) { this.activeTile.setValue(Num); }
    },

    userTypesNote: function(Num) {
        if (this.activeTile) { this.activeTile.toggleNote(Num); }
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

    render: function() {
        var r,c;

        // reset decorations (model) on all ranges and tiles
        this.ranges.forEach( range => { range.highlightOff(); });
        for (let key in this.tiles) { this.tiles[key].sameValueHighLightOff(); }

        // decorate
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