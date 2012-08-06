function getHashedHeaders(content) {
    var lines = content.split(/\n|\r\n|\r/);
    return lines.map(function(line, index, lines) {
        var match = /^(\#{1,8})\s+(.+)$/.exec(line);

        return match ?  { 
            rank: match[1].length,
            name: match[2],
            line: index,
            link: linkify(match[2]),
            text: match[0]
            } : null;
    })
    .filter(filterNull);
}

function getUnderlinedHeaders(content) {
    var lines = content.split(/\n|\r\n|\r/);

    return lines.map(function(line, index, lines) {
        if (index === 0) return null;
        var rank, name;
                
        if (/^==+/.exec(line)) {
            rank = 1;
        } else if (/^--+/.exec(line)) {
            rank = 2;
        } else {
            return null;
        }
        name = lines[index - 1]; 
               
        return {
            rank: rank,
            name: name,
            line: index - 1,
            link: linkify(name),
            text: name + "\n" + lines[index]
        };
    })
    .filter(filterNull);
}

function filterNull(x) {
    return x !== null;
}

function linkify(text) {
    return "#" +
        text
        .toLowerCase()
        .trim()
        .replace(/ /g,'-')
        .replace(/[`.,()*]/g,'');
}

module.exports = {
    generate: function(input) {
        return getUnderlinedHeaders(input).concat(getHashedHeaders(input));
    },
    
    autoLinkifyHeaders: function(content) {
        return content.replace(/<h([1-6])>(.+?)<\/h[1-6]>/igm, function(match, type, text) {
            var link = linkify(text);
            return "<h" + type + "><a name='"+link.substr(1)+"' class='heading_anchor' href='"+link+"'><i class='headerLinkIcon'></i></a>"+text+"</h" + type + ">";
        });
    },
    
    headingTable: function (toh, maxLevel, classes) {
        if (toh.length > 1) {
            var tocHTML = "";
            var assignedLevel = 0;
            if (maxLevel instanceof Array) {
                classes = maxLevel;
                maxLevel = null;
            }
            if (!maxLevel) maxLevel = 4;
    
            var firstOL = 0; // a pathetic hack
            
            for (var h = 1; h < toh.length; h++) {
                var heading = toh[h];
                var currentLevel = heading.rank;

                if (currentLevel > maxLevel) continue;
    
                if (assignedLevel !== currentLevel - 1) {
                    tocHTML += "</li>"
                }
    
                while (assignedLevel < currentLevel) {
                    if (firstOL == 0) firstOL = 1;
                    else tocHTML += "<ol" + (classes.length ? " class='" + classes[0] + " level_" + assignedLevel + "'>" : ">")
                    assignedLevel++
                }
    
                while (assignedLevel > currentLevel) {
                    tocHTML += "</ol></li>"
                    assignedLevel--;
                }
    
                tocHTML += "<li" + (classes.length ? " class='" + classes[1] + " level_" + assignedLevel + "'>" : ">") + "<a href='" + heading.link + "'>" + heading.name + "</a>";
            }
    
            while (assignedLevel > 0) {
                tocHTML += "</li></ol>";
                assignedLevel--;
            }
        }
    
        return tocHTML;
    }
};