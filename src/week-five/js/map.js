const textMap = `
xxxxxxxxxxxxxxxxxxxxxxxxxxxXXxxxxxxx           
x                x      x          x
x        x       x      x          x
x        x       x          xx     x
x     xxxx   t                     x
x                    o   o     xxxxx
x          o                       x
x              xxx       o         x
x    o  o  o   xt                  x
x              x        xxxxx  xxxxx
x              x                   x
x     t                 x          x
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`;

const emptyMap = `xxxxxxxxxxxxxxxXxxxxxxxxxxxxxxxxxxxx
x                                  x
x                                  x
x                                  x
x                                  x
x                                  x
X                                  X
x                                  x
x                                  x
x                                  x
x                                  x
x                                  x
xxxxxxxxxxxxxxxXxxxxxxxxxxxxxxxxxxxx`;

export { textMap, emptyMap };

export default textMap
  .trim()
  .split('\n')
  .map((row) => row.split(''));
