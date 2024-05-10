var fs = require('fs')

var list_lines = fs.readFileSync('seraphon.aos',{encoding: 'utf-8'}).split('\n')

/// General data structures

var army = {
    details: {},
    leader: [],
    battleline: [],
    behemoth: [],
    terrain: [],
    other: [],
    artillery: [],
    total_points: 0
}

/// Parse army general details
const parse_detail = (lines, key, value, result) => {
    let line = lines.find(l => l.includes(value));
    
    if (line) {
        let m = line.match(new RegExp(`${value}: (.*)`))
        if (m && m[1]) {
            result[key] = m[1]
        }
    }
}

// Army Details
parse_detail(list_lines, "faction", "Army Faction", army.details);
parse_detail(list_lines, "type", "Army Type", army.details);
parse_detail(list_lines, "subfaction", "Army Subfaction", army.details);
parse_detail(list_lines, "grand_strategy", "Grand Stragety", army.details);

// Title lines
let leader_l = list_lines.findIndex(l => l === "LEADER")
let battleline_l = list_lines.findIndex(l => l === "BATTLELINE")
let artillery_l = list_lines.findIndex(l => l === "ARTILLERY")
let behemoth_l = list_lines.findIndex(l => l === "BEHEMOTH")
let other_l = list_lines.findIndex(l => l === "OTHER")
let terrain_l = list_lines.findIndex(l => l === "TERRAIN")
let battalion_l = list_lines.findIndex(l => l.includes("CORE BATTALIONS"))
let total_p_l = list_lines.findIndex(l => l.includes("TOTAL POINTS:"))

// Slice LEADER to NEXT
const line_indices = [leader_l, battleline_l, artillery_l, behemoth_l, other_l, terrain_l, battalion_l, total_p_l]
const index_keys = ["leader", "battleline", "artillery", "behemoth", "other", "terrain", "battalion", "total_points"]

line_indices.forEach((l, i, arr) => {
    if (l !== -1) {
        let next_index = arr.findIndex((lt, it) => it > i && lt !== -1)
        army[index_keys[i]] = list_lines.slice(l + 1, arr[next_index] - 1).filter(x => x !== "")
    }
});



console.log(army)