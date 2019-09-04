tam.Tile = fabric.util.createClass({
    initialize: function(opts) {
        // model - constant part - set at creation
        this.board = opts.board;
        this.r = opts.r;
        this.c = opts.c;
        this.ranges = [];

        // model - variable part - mutated during game play
        //         shall be part of history
        this.fixed = false;
        this.value = null;
        this.notes = new Set();

        // model - presentation part - mutated according to presentation prefs
        this.sameValueHighlight = false;
        this.valueConflict = false;

        // view
        this.ui = null;
        this.buildUI();
    },

    // altering model
    addRange: function(range) { this.ranges.push(range); },

    toggleFix: function() { this.fixed = !this.fixed; },

    clear:  function() {
        this.value = null;
        this.notes.clear();
    },

    setValue: function(value) {
        this.value = value;
        this.notes.clear();
    },

    toggleNote: function(note) {
        this.value = null;
        var nts = this.notes;
        nts.has(note) ? nts.delete(note) : nts.add(note);
    },

    clearNote: function(note) {
        this.notes.delete(note);
    },

    saveState: function() {
        let state = {
            value: this.value,
            notes: Array.from(this.notes.values()),
            fixed: this.fixed
        };
        return state;
    },

    restoreState: function(savedState) {
        let {value, notes, fixed} = savedState;
        this.value = value;
        this.notes = new Set(notes);
        this.fixed = fixed;
    },

    // decoration
    decorationOff() {
        this.sameValueHighlight = false;
        this.valueConflict = false;
    },

    sameValueHighLightOn() { this.sameValueHighlight = true; },
    valueConflictOn() { this.valueConflict = true; },

    highlightRanges: function() {
        this.ranges.forEach( range => range.highlightOn() );
    },

    /////////////////////////////////////
    // UI related
    buildUI: function() {
        
        var canvas = this.board.canvas;
        var tileUiEls = [];

        // tile rectangle
        var tileRec = new fabric.Rect({
            width: 90,
            height: 90,
            fill: '#bca'
        });
        canvas.add(tileRec);
        tileUiEls.push(tileRec);
        
        // value
        var valueText = new fabric.Text('', {
            left: 20,
            top: - 3,
            fontSize: 90,
            fill: '#337',
            fontFamily: 'Comic Sans'
        });
        canvas.add(valueText);
        tileUiEls.push(valueText);

        // notes
        var noteTexts = {};
        for (var i = 0; i<3; i++) {
            for (var j = 0; j<3; j++) {
                var num = i*3 + j + 1;
                var t = new fabric.Text('' + num, {
                    left:  j * 30 + 7,
                    top:  i * 30 - 2,
                    fontSize: 30,
                    fill: '#235',
                    visible: false
                });
                canvas.add(t);
                tileUiEls.push(t);
                noteTexts[num] = t;
            }
        }

        // positioning
        var tileUi = new fabric.Group(tileUiEls);
        tileUi.left = tileUi.left + 5 + (this.c - 1) * 91 + ~~((this.c - 1) / 3) * 3;
        tileUi.top = tileUi.top + 5 + (this.r - 1) * 91 + ~~((this.r - 1) / 3) * 3;
        canvas.add(tileUi);

        this.ui = {
            uiGroup: tileUi,
            tile: tileRec,
            value: valueText,
            notes: noteTexts
        };
    },

    props: function() {
        props = [];
        if (this.board.activeTile == this) { props.push('active'); }
        if (this.fixed) { props.push('fixed'); }
        if (this.sameValueHighlight) { props.push('svhl'); }
        if (this.valueConflict) { props.push('conflict'); }
        if (this.ranges.some(range => range.highlighted)) { props.push('highlighted'); }
        return props.join("-");
    },

    render: function() {
        var ui = this.ui;

        // value
        var valueString = this.value || '';
        ui.value.set('text', '' + valueString);

        // notes
        for(let num=1; num <= 9; num++) {
            ui.notes[num].set('visible', this.notes.has(num));
        }

        // value fill color:
        let valFillColor = tam.utils.propmatch(this.props(), [
            ["svhl", "#AA0"],
            ["fixed", "#000"],
            ["", "#337"]
        ]);
        ui.value.set('fill', valFillColor);

        // tile fill color
        let tileFillColor = tam.utils.propmatch(this.props(), [
            ["conflict", "#e41"],
            ["active-fixed", "#eee"],
            ["fixed", "#ccc"],
            ["active", "#efd"],
            ["highlighted", "#dec"],
            ["", "#bca"]
        ]);
        ui.tile.set('fill', tileFillColor);

    }

});