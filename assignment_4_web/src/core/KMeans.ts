// import * as d3 from 'd3';

const d3 = {} as any;

interface Dot {
  x: number;
  y: number;
  group?: Group;
  init?: {
    x: number;
    y: number;
    group?: Group;
  };
}

interface Group {
  dots: Dot[];
  color: string;
  center: {
    x: number;
    y: number;
  };
  init: {
    center: {
      x: number;
      y: number;
    };
  };
}

class KMeans {
  private hashKmeans = d3!.select("#kmeans") as any;
  private flag = false;
  private WIDTH = this.hashKmeans[0][0].offsetWidth - 20;
  private HEIGHT = Math.max(300, this.WIDTH * 0.7);
  private svg = d3.select("#kmeans svg")
  .attr('width', this.WIDTH)
  .attr('height', this.HEIGHT)
  .style('padding', '10px')
  .style('background', '#223344')
  .style('cursor', 'pointer')
  .style('-webkit-user-select', 'none')
  .style('-khtml-user-select', 'none')
  .style('-moz-user-select', 'none')
  .style('-ms-user-select', 'none')
  .style('user-select', 'none')
  .on('click', (event: any) => {
    event.preventDefault();
    this.step();
  });

  private groups: Group[] = [];
  private dots: Dot[] = [];

  private lineg = this.svg.append('g');
  private dotg = this.svg.append('g');
  private centerg = this.svg.append('g');

  constructor() {
    d3.selectAll("#kmeans button")
    .style('padding', '.5em .8em');

    d3.selectAll("#kmeans label")
    .style('display', 'inline-block')
    .style('width', '15em');

    d3.select("#step")
    .on('click', () => {
      this.step();
      this.draw();
    });
    d3.select("#restart")
    .on('click', () => {
      this.restart();
      this.draw();
    });
    d3.select("#reset")
    .on('click', () => {
      this.init();
      this.draw();
    });

    this.init();
    this.draw();
  }

  private step() {
    d3.select("#restart").attr("disabled", null);
    if (this.flag) {
      this.moveCenter();
      this.draw();
    } else {
      this.updateGroups();
      this.draw();
    }
    this.flag = !this.flag;
  }

  private init() {
    d3.select("#restart").attr("disabled", "disabled");

    const hashN = d3.select('#N') as any;
    const hashK = d3.select('#K') as any;

    const N = parseInt(hashN[0][0].value, 10);
    const K = parseInt(hashK[0][0].value, 10);
    this.groups = [];

    for (let i = 0; i < K; i++) {
      const x = Math.random() * this.WIDTH;
      const y = Math.random() * this.HEIGHT;
      const g: Group = {
        dots: [],
        color: 'hsl(' + (i * 360 / K) + ',100%,50%)',
        center: {
          x: x,
          y: y,
        },
        init: {
          center: {
            x: x,
            y: y,
          }
        }
      };
      g.init.center = {
        x: g.center.x,
        y: g.center.y
      };
      this.groups.push(g);
    }

    this.dots = [];
    this.flag = false;
    for (let i = 0; i < N; i++) {
      const dot: Dot = {
        x: Math.random() * this.WIDTH,
        y: Math.random() * this.HEIGHT,
        group: undefined
      };
      dot.init = {
        x: dot.x,
        y: dot.y,
        group: dot.group
      };
      this.dots.push(dot);
    }
  }

  private restart() {
    this.flag = false;
    d3.select("#restart").attr("disabled", "disabled");

    this.groups.forEach((g) => {
      g.dots = [];
      g.center.x = g.init.center.x;
      g.center.y = g.init.center.y;
    });

    for (let i = 0; i < this.dots.length; i++) {
      const dot = this.dots[i];
      this.dots[i] = {
        x: dot.init?.x || 0,
        y: dot.init?.y || 0,
        group: undefined,
        init: dot.init
      };
    }
  }

  private draw() {
    const circles = this.dotg.selectAll('circle').data(this.dots);

    circles
      .enter()
      .append('circle');

    circles
      .exit()
      .remove();

    circles
      .transition()
      .duration(500)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('fill', (d: any) => d.group ? d.group.color : '#ffffff')
      .attr('r', 5);

    if (this.dots[0].group) {
      const l = this.lineg.selectAll('line').data(this.dots);
      const updateLine = (lines: any) => {
        lines
          .attr('x1', (d: any) => d.x)
          .attr('y1', (d: any) => d.y)
          .attr('x2', (d: any) => d.group.center.x)
          .attr('y2', (d: any) => d.group.center.y)
          .attr('stroke', (d: any) => d.group.color);
      };

      updateLine(l.enter().append('line'));
      updateLine(l.transition().duration(500));
      l.exit().remove();

    } else {
      this.lineg.selectAll('line').remove();
    }

    const c = this.centerg.selectAll('path').data(this.groups);

    const updateCenters = (centers: any) => {
      centers
      .attr('transform', (d: any) => `translate(${d.center.x},${d.center.y}) rotate(45)`)
      .attr('fill', (d: any, i: any) => d.color)
      .attr('stroke', '#aabbcc');
    };

    c.exit().remove();
    updateCenters(c.enter()
      .append('path')
      .attr('d', (d3.svg as any).symbol().type('cross'))
      .attr('stroke', '#aabbcc'));

    updateCenters(c
      .transition()
      .duration(500));
  }

  private moveCenter() {
    this.groups.forEach((group, i) => {
      if (group.dots.length === 0) return;

      // get center of gravity
      let x = 0, y = 0;
      group.dots.forEach((dot) => {
        x += dot.x;
        y += dot.y;
      });

      group.center = {
        x: x / group.dots.length,
        y: y / group.dots.length
      };
    });
  }

  private updateGroups() {
    this.groups.forEach((g) => {
      g.dots = [];
    });
    this.dots.forEach((dot) => {
      // find the nearest group
      let min = Infinity;
      let group;
      this.groups.forEach((g) => {
        const d = Math.pow(g.center.x - dot.x, 2) + Math.pow(g.center.y - dot.y, 2);
        if (d < min) {
          min = d;
          group = g;
        }
      });

      // update group
      (group as any).dots.push(dot);
      dot.group = group;
    });
  }

}