tam.Tile = fabric.util.createClass(fabric.Observable, {
    initialize: function(opts) {
        this.board = opts.board;
        this.ranges = [];
        this.r = opts.r;
        this.c = opts.c;
        this.fixed = false;
        this.active = false;
        this.value = null;
        this.notes = new Set();
        // ui
        this.ui = null;
        this.buildUI();
    },

    /////////////////////////////////////
    // user interactions
    userClears: function() {
        this.value = null;
        this.notes.clear();
        this.render();
    },

    userSetsValue: function(value) {
        this.value = value;
        this.notes.clear();
        this.render();
        this.trigger('user:setsValue', {target:this});
    },

    userTogglesNote: function(note) {
        this.value = null;
        var nts = this.notes;
        nts.has(note) ? nts.delete(note) : nts.add(note);
        this.render();
        this.trigger('user:togglesNote', {target:this})
    },

    userActivates: function() {
        this.active = true;
        this.highlightRangesOn();
    },

    userDeactivates: function() {
        this.active = false;
        this.highlightRangesOff();
    },

    userTogglesFix: function() {
        this.fixed = !this.fixed;
        this.render();
    },

    /////////////////////////////////////
    // todo
    addRange: function(range) {
        this.ranges.push(range);
    },

    highlightRangesOn: function() {
        this.ranges.forEach( range => range.highlightOn() );
    },
    highlightRangesOff: function() {
        this.ranges.forEach( range => range.highlightOff() );
    },

    /////////////////////////////////////
    // UI related
    buildUI: function() {
        
        // var ui = new fabric.Group([], {
        //     left: 50 + this.c * 30,
        //     top: 50 + this.r * 30
        // });
        
        var tileUiEls = [];

        // tile rectangle
        var tileRec = new fabric.Rect({
            width: 90,
            height: 90,
            fill: '#bca'
        });
        this.board.add(tileRec);
        tileUiEls.push(tileRec);
        
        // value
        var valueText = new fabric.Text('', {
            left: 20,
            top: - 3,
            fontSize: 90,
            fill: '#337',
            fontFamily: 'Comic Sans'
        });
        this.board.add(valueText);
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
                this.board.add(t);
                tileUiEls.push(t);
                noteTexts[num] = t;
            }
        }

        // positioning
        var tileUi = new fabric.Group(tileUiEls);
        tileUi.left = tileUi.left + 5 + (this.c - 1) * 91 + ~~((this.c - 1) / 3) * 3;
        tileUi.top = tileUi.top + 5 + (this.r - 1) * 91 + ~~((this.r - 1) / 3) * 3;
        this.board.add(tileUi);

        this.ui = {
            uiGroup: tileUi,
            tile: tileRec,
            value: valueText,
            notes: noteTexts
        };
    },

    props: function() {
        props = [];
        if (this.fixed) { props.push('fixed'); }
        if (this.active) { props.push('active'); }
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
            ["fixed", "#000"],
            ["", "#337"]
        ]);
        ui.value.set('fill', valFillColor);

        // tile fill color
        let tileFillColor = tam.utils.propmatch(this.props(), [
            ["active-fixed", "#eee"],
            ["fixed", "#ccc"],
            ["active", "#efd"],
            ["highlighted", "#dec"],
            ["", "#bca"]
        ]);
        ui.tile.set('fill', tileFillColor);
        
        /*
        // fixed: value color changed
        ui.value.set('fill', this.fixed ? '#000' : '#337');

        // active: tile fill color changed
        ui.tile.set('fill', this.active ? '#efd' : '#bca');
        */

        //this.board.renderAll();
    }

});