import fs from 'node:fs'
import path from 'node:path'

const names = JSON.parse(fs.readFileSync('src/data/muscle-names.json', 'utf8')).muscles
let atlas = fs.readFileSync('src/modules/workout/muscleAtlasData.ts', 'utf8')

for (const m of names) {
  const needle = new RegExp(`(id:\\s*['"]${m.id}['"],[^}]*?nameAr:\\s*['"])(.*?)(['"])`, 's')
  atlas = atlas.replace(needle, (match, p1, p2, p3) => {
    return p1 + m.gym_ar + p3
  })
}

fs.writeFileSync('src/modules/workout/muscleAtlasData.ts', atlas, 'utf8')
console.log('Successfully updated muscleAtlasData.ts with gym_ar names!')
