"use client";

import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from "ogl";

/**
 * A slowly turning network of nodes: a quiet picture of "connected systems", behind the hero diagram.
 * ~80 points and their nearest links, one draw call each. Pauses off-screen and when the tab is hidden.
 */
const POINTS = 130;
const LINK = 1.0;

const pointVert = /* glsl */ `
  attribute vec3 position; attribute vec3 color; attribute float size;
  uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform float uScale;
  varying vec3 vColor; varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = color; vDepth = clamp((mv.z + 7.0) / 4.0, 0.0, 1.0);
    gl_PointSize = size * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const pointFrag = /* glsl */ `
  precision highp float; varying vec3 vColor; varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = 1.0 - smoothstep(0.22, 0.5, d);
    gl_FragColor = vec4(vColor, a * (0.4 + 0.6 * vDepth));
  }`;
const lineVert = /* glsl */ `
  attribute vec3 position; attribute vec3 color;
  uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
  varying vec3 vColor; varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = color; vDepth = clamp((mv.z + 7.0) / 4.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }`;
const lineFrag = /* glsl */ `
  precision highp float; varying vec3 vColor; varying float vDepth;
  void main() { gl_FragColor = vec4(vColor, 0.85 * (0.25 + 0.75 * vDepth)); }`;

const VIOLET = [0.54, 0.52, 1.0];
const BLUE = [0.49, 0.74, 1.0];
const mix = (t: number) => VIOLET.map((v, i) => v + (BLUE[i] - v) * t);

export default function NodeField() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio, 1.5), powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the hero simply stays 2D
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    el.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 38 });
    camera.position.set(0, 0, 7);
    const scene = new Transform();

    // Fibonacci sphere with jitter, so it reads as organic rather than a perfect globe
    const pos: number[] = [];
    const col: number[] = [];
    const size: number[] = [];
    for (let i = 0; i < POINTS; i++) {
      const y = 1 - (i / (POINTS - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const k = 2.1 * (0.88 + Math.random() * 0.24);
      pos.push(Math.cos(th) * r * k, y * k, Math.sin(th) * r * k);
      col.push(...mix((y + 1) / 2));
      size.push(i % 9 === 0 ? 40 : 15 + Math.random() * 9);
    }
    const lp: number[] = [];
    const lc: number[] = [];
    for (let i = 0; i < POINTS; i++)
      for (let j = i + 1; j < POINTS; j++) {
        const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        if (Math.hypot(dx, dy, dz) < LINK) {
          lp.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
          lc.push(col[i * 3], col[i * 3 + 1], col[i * 3 + 2], col[j * 3], col[j * 3 + 1], col[j * 3 + 2]);
        }
      }

    const pointGeo = new Geometry(gl, {
      position: { size: 3, data: new Float32Array(pos) },
      color: { size: 3, data: new Float32Array(col) },
      size: { size: 1, data: new Float32Array(size) },
    });
    const lineGeo = new Geometry(gl, {
      position: { size: 3, data: new Float32Array(lp) },
      color: { size: 3, data: new Float32Array(lc) },
    });
    const points = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: pointGeo,
      program: new Program(gl, { vertex: pointVert, fragment: pointFrag, transparent: true, depthTest: false, uniforms: { uScale: { value: 300 } } }),
    });
    const lines = new Mesh(gl, {
      mode: gl.LINES,
      geometry: lineGeo,
      program: new Program(gl, { vertex: lineVert, fragment: lineFrag, transparent: true, depthTest: false }),
    });
    const group = new Transform();
    group.setParent(scene);
    points.setParent(group);
    lines.setParent(group);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
      (points.program.uniforms.uScale as { value: number }).value = renderer.dpr * (h / 900) * 4.6;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // gentle pointer parallax
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / innerWidth - 0.5) * 0.5;
      target.y = (e.clientY / innerHeight - 0.5) * 0.35;
    };
    addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    const clock = performance.now();
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      cur.x += (target.x - cur.x) * 0.04;
      cur.y += (target.y - cur.y) * 0.04;
      group.rotation.y = (t - clock) * 0.00006 + cur.x;
      group.rotation.x = 0.18 + cur.y;
      renderer.render({ scene, camera });
    };
    const run = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? run() : stop(); });
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : run());
    document.addEventListener("visibilitychange", onVis);
    run();
    requestAnimationFrame(() => el.classList.add("is-on"));

    return () => {
      stop();
      io.disconnect(); ro.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gl.canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={host} className="node-field" aria-hidden="true" />;
}
