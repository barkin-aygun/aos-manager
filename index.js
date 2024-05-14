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

const parse_units = (lines) => {
    if (lines === undefined) {
        return []
    }
    let cur_index = -1
    let result = []
    let cur_unit = {}
    const desc_regex = new RegExp(/(\d)+ x (.*) \((\d+)\)(\*)*/)
    const artifact_regex = new RegExp(/- Artefacts: (.*)/)
    const spell_regex = new RegExp(/- Spells: (.+)/)
    const gen_regex = new RegExp(/- General/)
    const trait_regex = new RegExp(/- Command Traits: (.+)/)
    const other_regex = new RegExp(/- (.+)/)
    
    while (cur_index < lines.length) {
        cur_index++;
        let line = lines[cur_index]

        if (desc_regex.test(line)) {
            let [match, models, name, points, battalion] = line.match(desc_regex)
            if (cur_unit.hasOwnProperty("name")) {
                result.push(cur_unit)
            }

            cur_unit = {
                name,
                models,
                points,
                details: []
            }

            if (battalion) {
                cur_unit.battalion = battalion.length
            }
        } else if (artifact_regex.test(line)) {
            let [m, arts] = line.match(artifact_regex)

            cur_unit.artifacts = arts.split(', ')
        } else if (spell_regex.test(line)) {
            let [m, spells] = line.match(spell_regex)

            cur_unit.spells = spells.split(', ')
        } else if (gen_regex.test(line)) {
            cur_unit.general = true;
        } else if (trait_regex.test(line)) {
            let [m, traits] = line.match(trait_regex)
            cur_unit.traits = traits.split(', ')
        } else if (other_regex.test(line)) {
            let [m, other] = line.match(other_regex)
            cur_unit.details.push(other.trim())
        }
    }
    result.push(cur_unit)

    return result
}

const parse_battalion = (line) => {
    const bat_regex = new RegExp(/(\*+)(.*)/)

    if (bat_regex.test(line)) {
        let [m, battalion, name] = line.match(bat_regex)
        return {
            num: battalion.length,
            name
        }
    } 
    
    return undefined
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
let armylines = []

line_indices.forEach((l, i, arr) => {
    if (l !== -1) {
        let next_index = arr.findIndex((lt, it) => it > i && lt !== -1)
        armylines[index_keys[i]] = list_lines.slice(l + 1, arr[next_index] - 1).filter(x => x !== "")
        if (i === arr.length - 1) {
            armylines[index_keys[i]] = list_lines.slice(l).filter(x => x !== "")
        }
    }
});

army.leader = parse_units(armylines.leader)
army.batleline = parse_units(armylines.battleline)
army.artillery = parse_units(armylines.artillery)
army.behemoth = parse_units(armylines.behemoth)
army.other = parse_units(armylines.other)
army.terrain = parse_units(armylines.terrain)

// battalion
army.battalions = armylines.battalion.map(parse_battalion).filter(x => x)

console.log(armylines.total_points)
// total
let [m, pts, total] = armylines.total_points[0].match(/TOTAL POINTS: \((\d+)\/(\d+)\)/)
army.total_points = [+pts, +total]

console.log(army)