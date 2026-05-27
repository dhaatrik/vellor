import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 outColor;
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.001; // Scale time so it's a smooth slow undulation

    // Kinetic vector deformation
    vec2 pos = uv;
    pos.x += sin(pos.y * 5.0 + t * 0.4) * 0.015;
    pos.y += sin(pos.x * 5.0 + t * 0.4) * 0.015;

    // Razor-sharp digital coordinate grid mesh using fract
    vec2 grid = fract(pos * 40.0);

    // Calculate distance to grid lines
    vec2 dist = abs(grid - 0.5);

    // Make the grid wireframes extremely thin
    vec2 lines = smoothstep(0.48, 0.5, dist);
    float gridAlpha = max(lines.x, lines.y);

    vec3 bgColor = vec3(0.0, 0.0, 0.0);
    // Absolute minimal alpha of neon green token rgba(0, 255, 102, 0.03)
    vec3 gridColor = vec3(0.0, 1.0, 0.4);
    float gridIntensity = 0.03;

    vec3 finalColor = mix(bgColor, gridColor, gridAlpha * gridIntensity);
    outColor = vec4(finalColor, 1.0);
}
`;

export const TerminalBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('WebGL2 not supported');
      return;
    }

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linking program:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

    let animationFrameId: number;

    const handleResize = () => {
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    // Initial size
    handleResize();
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvas) {
      resizeObserver.observe(document.body);
    }

    const render = (time: number) => {
      // Dynamic canvas resizing moved to resize event listener
      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform1f(timeUniformLocation, time);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      if (vao) gl.deleteVertexArray(vao);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);

      if (program) {
        if (vertexShader) gl.detachShader(program, vertexShader);
        if (fragmentShader) gl.detachShader(program, fragmentShader);
        gl.deleteProgram(program);
      }

      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
};
