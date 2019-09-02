// helpers
var split = (str, sep) => str == "" ? [] : str.split(sep);

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