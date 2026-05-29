// Google Charts default series colors — same palette Google Forms uses,
// so the pie/bar slices match the look in the reference screenshot.
export const palette = [
  '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#0099C6',
  '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499', '#22AA99',
  '#AAAA11', '#6633CC', '#E67300', '#8B0707', '#651067', '#329262',
]

export const colorAt = (i) => palette[i % palette.length]
