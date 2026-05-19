"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroShaderBackgroundProps {
  className?: string;
}

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_pointer_strength;
uniform float u_dark;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    amplitude *= 0.52;
  }

  return value;
}

float blob(vec2 p, vec2 center, float radius, float softness) {
  return 1.0 - smoothstep(radius, radius + softness, length(p - center));
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 pointer = (u_pointer - 0.5) * vec2(aspect, 1.0);
  vec2 pointer_delta = p - pointer;
  float pointer_wave = exp(-dot(pointer_delta, pointer_delta) * 8.0) * u_pointer_strength;

  p += pointer_delta * pointer_wave * 0.16;
  p.x += sin(p.y * 5.0 + u_time * 0.18) * 0.025;
  p.y += cos(p.x * 4.0 - u_time * 0.14) * 0.02;

  float paper = fbm(p * 3.0 + u_time * 0.025);
  float marbling = fbm(p * 1.35 + vec2(paper * 1.7, u_time * 0.035));
  float contour = abs(sin((p.x * 3.1 + p.y * 2.3 + marbling * 2.8 + u_time * 0.055) * 3.14159));
  float ink = smoothstep(0.62, 0.96, contour) * 0.08;

  vec3 base_light = vec3(0.961, 0.937, 0.894);
  vec3 base_dark = vec3(0.102, 0.094, 0.086);
  vec3 base = mix(base_light, base_dark, u_dark);

  vec3 mustard = vec3(0.839, 0.702, 0.278);
  vec3 teal = vec3(0.435, 0.616, 0.604);
  vec3 salmon = vec3(0.851, 0.545, 0.451);
  vec3 lavender = vec3(0.722, 0.655, 0.800);
  vec3 slime = vec3(0.624, 0.690, 0.435);
  vec3 ink_color = mix(vec3(0.275, 0.247, 0.227), vec3(0.910, 0.878, 0.831), u_dark);

  float mustard_blob = blob(p, vec2(-0.34 * aspect, 0.20), 0.52, 0.50);
  float teal_blob = blob(p, vec2(0.34 * aspect, -0.06), 0.48, 0.48);
  float salmon_blob = blob(p, vec2(0.06 * aspect, 0.38), 0.32, 0.42);
  float lavender_blob = blob(p, vec2(-0.02 * aspect, -0.36), 0.42, 0.46);
  float slime_blob = blob(p, pointer, 0.12 + pointer_wave * 0.18, 0.36) * pointer_wave;

  vec3 color = base;
  color = mix(color, mustard, mustard_blob * (0.20 - u_dark * 0.06));
  color = mix(color, teal, teal_blob * (0.18 - u_dark * 0.05));
  color = mix(color, salmon, salmon_blob * (0.16 - u_dark * 0.04));
  color = mix(color, lavender, lavender_blob * (0.18 - u_dark * 0.05));
  color = mix(color, slime, slime_blob * 0.26);
  color = mix(color, ink_color, ink * (0.65 + pointer_wave * 0.35));

  float edge_fade = smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x) * smoothstep(0.0, 0.16, uv.y) * smoothstep(1.0, 0.72, uv.y);
  float alpha = (0.72 + pointer_wave * 0.12) * edge_fade;

  gl_FragColor = vec4(color, alpha);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function HeroShaderBackground({ className }: HeroShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const pointerLocation = gl.getUniformLocation(program, "u_pointer");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const pointerStrengthLocation = gl.getUniformLocation(program, "u_pointer_strength");
    const darkLocation = gl.getUniformLocation(program, "u_dark");
    const buffer = gl.createBuffer();
    let frameId: number | null = null;

    if (!buffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const pointer = {
      x: 0.72,
      y: 0.42,
      targetX: 0.72,
      targetY: 0.42,
      strength: 0,
      targetStrength: 0,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);

      return width > 1 && height > 1;
    };

    const movePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      if (x < 0 || x > 1 || y < 0 || y > 1) {
        pointer.targetStrength = 0;
        return;
      }

      pointer.targetX = x;
      pointer.targetY = 1 - y;
      pointer.targetStrength = 1;
    };

    const handlePointerMove = (event: PointerEvent) => {
      movePointer(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      movePointer(touch.clientX, touch.clientY);
    };

    const handlePointerLeave = () => {
      pointer.targetStrength = 0;
    };

    const render = (time = 0) => {
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;
      pointer.strength += (pointer.targetStrength - pointer.strength) * 0.08;
      pointer.targetStrength *= 0.982;

      if (!resize()) {
        frameId = window.requestAnimationFrame(render);
        return;
      }

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(timeLocation, time * 0.001);
      gl.uniform1f(pointerStrengthLocation, pointer.strength);
      gl.uniform1f(darkLocation, document.documentElement.classList.contains("dark") ? 1 : 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      setIsReady(true);

      if (!reduceMotion) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const scheduleRender = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(scheduleRender);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", scheduleRender, { passive: true });
    window.addEventListener("load", scheduleRender, { once: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    scheduleRender();

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleRender);
      window.removeEventListener("load", scheduleRender);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 isolate overflow-hidden",
        "bg-[radial-gradient(circle_at_22%_24%,rgba(214,179,71,0.22),transparent_34%),radial-gradient(circle_at_76%_42%,rgba(111,157,154,0.20),transparent_36%),radial-gradient(circle_at_48%_80%,rgba(184,167,204,0.16),transparent_38%)]",
        className,
      )}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "block h-full w-full mix-blend-multiply transition-opacity duration-300 dark:mix-blend-screen",
          isReady ? "opacity-80 dark:opacity-55" : "opacity-0",
        )}
      />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(245,239,228,0.60),rgba(245,239,228,0.10)_42%,rgba(245,239,228,0.68))] dark:bg-[linear-gradient(115deg,rgba(26,24,22,0.50),rgba(26,24,22,0.10)_42%,rgba(26,24,22,0.58))]" />
    </div>
  );
}
