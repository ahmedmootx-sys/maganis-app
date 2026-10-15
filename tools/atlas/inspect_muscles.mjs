import fs from 'node:fs'

const lines = fs.readFileSync('.cache/bp3d/isa_parts_list_e.txt', 'utf8').split(/\r?\n/)
const muscles = []
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split('\t')
  if (parts.length >= 3) {
    muscles.push({ fma: parts[0], bp: parts[1], name: parts[2] })
  }
}

console.log('Total entries in isa_parts_list_e.txt:', muscles.length)
const filtered = muscles.filter((m) =>
  /back|dorsi|latis|spin|lumb|abdom|rectus|oblique|transver|flexor.*ulnar/i.test(m.name),
)
console.log('Matching back/lumb/abdom/etc:', filtered.length)
for (const m of filtered) {
  console.log(`${m.fma}\t${m.bp}\t${m.name}`)
}
