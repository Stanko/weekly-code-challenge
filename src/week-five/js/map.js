const map = `
xxxxxxxxxxxxxxxxxxxxxxxxxxxXXxxxxxxx           
x                x      x          x
x        x       x      x          x
x        x       x          xx     x
x     xxxx   t                     x
x                    o   o     xxxxx
x          o                       x
x              xxx       o         x
x    o  o  o   xt                  x
X              x        xxxxx  xxxxx
X              x                   x
x     t                 x          x
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`;

export default map
  .trim()
  .split('\n')
  .map((row) => row.split(''));
