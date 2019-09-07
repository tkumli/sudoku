// helpers
var split = (str, sep) => str == "" ? [] : str.split(sep);

// extending Set
Set.prototype.addMany= function(elements) {
    elements.forEach(el => this.add(el));
    return this;
}

Set.prototype.deleteMany = function(elements) {
    elements.forEach(el => this.delete(el));
    return this;
}

Set.prototype.filter = function(pred) {
    return new Set( Array.from(this.values()).filter(pred) );
}

Set.prototype.reduce = function(fun, init) {  // needed?
    return Array.from(this.values()).reduce(fun, init);
}

Set.complementer = function(universe, setA) {
    return (new Set(universe)).deleteMany(setA);
}

Set.union = function(sets) {
    if (arguments.length > 1) { sets = Array.from(arguments) }
    let union = new Set();
    sets.forEach( set => union.addMany(set) );
    return union;
}

// extending Array
Array.prototype.subset = function*(n, b=0) {
    for (let i = b; i <= this.length-n; i++) {
        switch (n) {
            case 1: 
                yield [this[i]];
                break;
            default:
                for ( sub of this.subset(n-1, i+1) ) {
                    yield [this[i]].concat(sub);
                }
        }
    }
}

tam.utils = {
    /*
     subject: string - properties joined with hyphen, e.g. "big-fat"
     patterns: array of [patternExp, value] pairs.
        patternExp: string - properties joined with hyphen.
        value: any value
     The subject e.g. "young-tall-...-nice" is matched against the
     patternExp strings in patterns. E.g.: [["young-tall", 20], ["young", 10], ... ]
       The value from first matching pattern is returned.
       The order of properties is not relevant eigther in subject or patterExp:
       "big-fat" will match "big-fat", "fat-big", "big", "fat" and "" but not "big-tall"
    */
    propmatch: function(subject, patterns) {
        var value;
        var subject = new Set(split(subject,"-"));
        patterns.some( p => {
            let pattern = split(p[0],"-");
            if (pattern.every( prop => subject.has(prop) ) ) {
                value = p[1];
                return true;
            }
        })
        return value;
    }
}