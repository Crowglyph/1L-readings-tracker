// A fixed palette assigned to courses in a stable order (alphabetical, as
// computed by the caller), so a course always gets the same color across
// reloads without needing to hardcode course names anywhere.
const PALETTE = [
  '#7A1F2B', // oxblood
  '#2F4A3D', // forest
  '#4A5B7A', // slate blue
  '#B98B2D', // ochre
  '#6B4E71', // plum
  '#3D6E6A', // teal
  '#8A5A3B', // rust
  '#5C6B73', // steel
]

export function buildCourseColorMap(courses) {
  const map = {}
  courses.forEach((c, i) => {
    map[c] = PALETTE[i % PALETTE.length]
  })
  return map
}
