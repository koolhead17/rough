import { RoughGenerator } from './generator';
import { Options, Drawable, OpSet } from './core';
import { Point } from './geometry.js';

export class RoughGeneratorAsync extends RoughGenerator {
  // @ts-ignore
  async line(x1: number, y1: number, x2: number, y2: number, options?: Options): Promise<Drawable> {
    const o = this._options(options);
    return this._drawable('line', [await this.lib.line(x1, y1, x2, y2, o)], o);
  }

  // @ts-ignore
  async rectangle(x: number, y: number, width: number, height: number, options?: Options): Promise<Drawable> {
    const o = this._options(options);
    const paths = [];
    if (o.fill) {
      const points: Point[] = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
      if (o.fillStyle === 'solid') {
        paths.push(await this.lib.solidFillPolygon(points, o));
      } else {
        paths.push(await this.lib.patternFillPolygon(points, o));
      }
    }
    paths.push(await this.lib.rectangle(x, y, width, height, o));
    return this._drawable('rectangle', paths, o);
  }

  // @ts-ignore
  async ellipse(x: number, y: number, width: number, height: number, options?: Options): Promise<Drawable> {
    const o = this._options(options);
    const paths = [];
    if (o.fill) {
      if (o.fillStyle === 'solid') {
        const shape = await this.lib.ellipse(x, y, width, height, o);
        shape.type = 'fillPath';
        paths.push(shape);
      } else {
        paths.push(await this.lib.patternFillEllipse(x, y, width, height, o));
      }
    }
    paths.push(await this.lib.ellipse(x, y, width, height, o));
    return this._drawable('ellipse', paths, o);
  }

  // @ts-ignore
  async circle(x: number, y: number, diameter: number, options?: Options): Promise<Drawable> {
    const ret = await this.ellipse(x, y, diameter, diameter, options);
    ret.shape = 'circle';
    return ret;
  }

  // @ts-ignore
  async linearPath(points: Point[], options?: Options): Promise<Drawable> {
    const o = this._options(options);
    return this._drawable('linearPath', [await this.lib.linearPath(points, false, o)], o);
  }

  // @ts-ignore
  async arc(x: number, y: number, width: number, height: number, start: number, stop: number, closed: boolean = false, options?: Options): Promise<Drawable> {
    const o = this._options(options);
    const paths = [];
    if (closed && o.fill) {
      if (o.fillStyle === 'solid') {
        const shape = await this.lib.arc(x, y, width, height, start, stop, true, false, o);
        shape.type = 'fillPath';
        paths.push(shape);
      } else {
        paths.push(await this.lib.patternFillArc(x, y, width, height, start, stop, o));
      }
    }
    paths.push(await this.lib.arc(x, y, width, height, start, stop, closed, true, o));
    return this._drawable('arc', paths, o);
  }

  // @ts-ignore
  async curve(points: Point[], options?: Options): Promise<Drawable> {
    const o = this._options(options);
    return this._drawable('curve', [await this.lib.curve(points, o)], o);
  }

  // @ts-ignore
  async polygon(points: Point[], options?: Options): Promise<Drawable> {
    const o = this._options(options);
    const paths = [];
    if (o.fill) {
      if (o.fillStyle === 'solid') {
        paths.push(await this.lib.solidFillPolygon(points, o));
      } else {
        const size = this.computePolygonSize(points);
        const fillPoints: Point[] = [
          [0, 0],
          [size[0], 0],
          [size[0], size[1]],
          [0, size[1]]
        ];
        const shape = await this.lib.patternFillPolygon(fillPoints, o);
        shape.type = 'path2Dpattern';
        shape.size = size;
        shape.path = this.polygonPath(points);
        paths.push(shape);
      }
    }
    paths.push(await this.lib.linearPath(points, true, o));
    return this._drawable('polygon', paths, o);
  }

  // @ts-ignore
  async path(d: string, options?: Options): Promise<Drawable> {
    const o = this._options(options);
    const paths: OpSet[] = [];
    if (!d) {
      return this._drawable('path', paths, o);
    }
    if (o.fill) {
      if (o.fillStyle === 'solid') {
        const shape: OpSet = { type: 'path2Dfill', path: d, ops: [] };
        paths.push(shape);
      } else {
        const size = this.computePathSize(d);
        const points: Point[] = [
          [0, 0],
          [size[0], 0],
          [size[0], size[1]],
          [0, size[1]]
        ];
        const shape = await this.lib.patternFillPolygon(points, o);
        shape.type = 'path2Dpattern';
        shape.size = size;
        shape.path = d;
        paths.push(shape);
      }
    }
    paths.push(await this.lib.svgPath(d, o));
    return this._drawable('path', paths, o);
  }
}