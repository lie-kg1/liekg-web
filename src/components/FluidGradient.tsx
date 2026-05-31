import { useRef, useEffect } from "react";

export default function FluidGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const vertSrc = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    let fragSrc = "";
    let animationId = 0;
    let isActive = true;

    async function init() {
      if (!gl) return;
      try {
        const response = await fetch("/shaders/webgl-fluid-gradient.frag");
        fragSrc = await response.text();
      } catch {
        return;
      }

      function compile(type: number, src: string) {
        const shader = gl!.createShader(type)!;
        gl!.shaderSource(shader, src);
        gl!.compileShader(shader);
        return shader;
      }

      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );

      const aPos = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const uniformNames = [
        "u_time",
        "u_res",
        "u_color1",
        "u_color2",
        "u_color3",
        "u_color4",
        "u_colorIntensity",
        "u_mouse",
        "u_click",
        "u_scroll",
        "u_speed",
        "u_waveCount",
        "u_mouseInfluence",
        "u_distortion",
      ];
      for (const name of uniformNames) {
        uniforms[name] = gl.getUniformLocation(prog, name);
      }

      gl.uniform3f(uniforms.u_color1, 0.067, 0.067, 0.067);
      gl.uniform3f(uniforms.u_color2, 0.1, 0.1, 0.1);
      gl.uniform3f(uniforms.u_color3, 0.133, 0.133, 0.133);
      gl.uniform3f(uniforms.u_color4, 0.1, 0.1, 0.1);
      gl.uniform1f(uniforms.u_colorIntensity, 1.0);
      gl.uniform1f(uniforms.u_speed, 0.15);
      gl.uniform1f(uniforms.u_waveCount, 3.0);
      gl.uniform1f(uniforms.u_mouseInfluence, 0.15);
      gl.uniform1f(uniforms.u_distortion, 0.4);

      const mousePos = { x: 0, y: 0 };
      const smoothMouse = { x: 0, y: 0 };
      let mouseDown = false;
      let scrollAccum = 0;

      const onMouseMove = (e: MouseEvent) => {
        mousePos.x = e.clientX;
        mousePos.y = window.innerHeight - e.clientY;
      };
      const onMouseDown = () => {
        mouseDown = true;
      };
      const onMouseUp = () => {
        mouseDown = false;
      };
      const onWheel = (e: WheelEvent) => {
        scrollAccum += e.deltaY * 0.01;
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("wheel", onWheel);

      function resize() {
        if (!canvas || !gl) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uniforms.u_res, canvas.width, canvas.height);
      }

      window.addEventListener("resize", resize);
      resize();

      function render(now: number) {
        if (!isActive || !gl) return;
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1f(uniforms.u_time, now * 0.001);

        const dpr = window.devicePixelRatio || 1;
        smoothMouse.x += (mousePos.x * dpr - smoothMouse.x) * 0.1;
        smoothMouse.y += (mousePos.y * dpr - smoothMouse.y) * 0.1;
        gl.uniform2f(uniforms.u_mouse, smoothMouse.x, smoothMouse.y);

        gl.uniform1f(uniforms.u_click, mouseDown ? 1.0 : 0.0);
        gl.uniform1f(uniforms.u_scroll, scrollAccum);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationId = requestAnimationFrame(render);
      }

      animationId = requestAnimationFrame(render);

      return () => {
        isActive = false;
        cancelAnimationFrame(animationId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("resize", resize);
      };
    }

    const cleanupPromise = init();

    return () => {
      isActive = false;
      cancelAnimationFrame(animationId);
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />
    </div>
  );
}
