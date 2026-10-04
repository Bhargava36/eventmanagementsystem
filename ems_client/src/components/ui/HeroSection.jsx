"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import useTheme from "@/Hooks/useTheme";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import * as THREE from "three";

export const CanvasRevealEffect = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true,
  reverse = false,
}) => {
  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors ?? [[0, 255, 255]]}
          dotSize={dotSize ?? 3}
          opacities={
            opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]
          }
          shader={`
            ${reverse ? 'u_reverse_active' : 'false'}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
          center={["x", "y"]}
        />
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-white to-white/0 dark:from-black dark:to-black/0" />
      )}
    </div>
  );
};

const DotMatrix = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 5,
  dotSize = 40,
  shader = "",
  center = ["x", "y"],
}) => {
  const uniforms = React.useMemo(() => {
    let colorsArray = [
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
    ];
    if (colors.length === 2) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[1],
      ];
    } else if (colors.length === 3) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[2],
        colors[2],
      ];
    }
    return {
      u_colors: {
        value: colorsArray.map((color) => [
          color[0] / 255,
          color[1] / 255,
          color[2] / 255,
        ]),
        type: "uniform3fv",
      },
      u_opacities: {
        value: opacities,
        type: "uniform1fv",
      },
      u_total_size: {
        value: totalSize,
        type: "uniform1f",
      },
      u_dot_size: {
        value: dotSize,
        type: "uniform1f",
      },
      u_reverse: {
        value: shader.includes("u_reverse_active") ? 1 : 0,
        type: "uniform1i",
      },
    };
  }, [colors, opacities, totalSize, dotSize, shader]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform int u_reverse;

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }
        float map(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        void main() {
            vec2 st = fragCoord.xy;
            ${center.includes("x")
          ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));"
          : ""
        }
            ${center.includes("y")
          ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));"
          : ""
        }

            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);

            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            float animation_speed_factor = 0.5;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);

            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);

            float current_timing_offset;
            if (u_reverse == 1) {
                current_timing_offset = timing_offset_outro;
                 opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            } else {
                current_timing_offset = timing_offset_intro;
                 opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            }

            vec2 mouse_pixel = vec2((u_mouse.x * 0.5 + 0.5) * u_resolution.x, (-u_mouse.y * 0.5 + 0.5) * u_resolution.y);
            float dist_to_mouse = distance(mouse_pixel, st);
            float mouse_effect = smoothstep(300.0, 0.0, dist_to_mouse);
            
            opacity += mouse_effect * 0.6;
            opacity = clamp(opacity, 0.0, 1.0);

            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
    />
  );
};

const ShaderMaterial = ({
  source,
  uniforms,
}) => {
  const { size } = useThree();
  const ref = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const getUniforms = useCallback(() => {
    const preparedUniforms = {};

    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];

      switch (uniform.type) {
        case "uniform1f":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1f" };
          break;
        case "uniform1i":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1i" };
          break;
        case "uniform3f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector3().fromArray(uniform.value),
            type: "3f",
          };
          break;
        case "uniform1fv":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" };
          break;
        case "uniform3fv":
          preparedUniforms[uniformName] = {
            value: uniform.value.map((v) =>
              new THREE.Vector3().fromArray(v)
            ),
            type: "3fv",
          };
          break;
        case "uniform2f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector2().fromArray(uniform.value),
            type: "2f",
          };
          break;
        default:
          console.error(`Invalid uniform type for '${uniformName}'.`);
          break;
      }
    }

    preparedUniforms["u_time"] = { value: 0, type: "1f" };
    preparedUniforms["u_mouse"] = { value: new THREE.Vector2(0, 0), type: "2f" };
    preparedUniforms["u_resolution"] = {
      value: new THREE.Vector2(size.width * 2, size.height * 2),
    };
    return preparedUniforms;
  }, [size.width, size.height, uniforms]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const timestamp = state.clock.getElapsedTime();

    const material = ref.current.material;
    const timeLocation = material.uniforms.u_time;
    timeLocation.value = timestamp;

    if (material.uniforms.u_mouse) {
      material.uniforms.u_mouse.value.set(mouseRef.current.x, mouseRef.current.y);
    }
  });

  useEffect(() => {
    if (ref.current) {
      const material = ref.current.material;
      const updatedUniforms = getUniforms();
      for (const key in updatedUniforms) {
        if (material.uniforms[key] && key !== "u_time") {
          material.uniforms[key].value = updatedUniforms[key].value;
        }
      }
    }
  }, [getUniforms, uniforms]);

  const material = useMemo(() => {
    const materialObject = new THREE.ShaderMaterial({
      vertexShader: `
      precision mediump float;
      in vec2 coordinates;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        float x = position.x;
        float y = position.y;
        gl_Position = vec4(x, y, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
      `,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });

    return materialObject;
  }, [getUniforms, source]);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const Shader = ({ source, uniforms }) => {
  return (
    <Canvas className="absolute inset-0  h-full w-full">
      <ShaderMaterial source={source} uniforms={uniforms} />
    </Canvas>
  );
};

const HeroSection = ({ className }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeInputRefs = useRef([]);
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setStep("code");
    }
  };

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 500);
    }
  }, [step]);

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      }

      if (index === 5 && value) {
        const isComplete = newCode.every(digit => digit.length === 1);
        if (isComplete) {
          setReverseCanvasVisible(true);

          setTimeout(() => {
            setInitialCanvasVisible(false);
          }, 50);

          setTimeout(() => {
            setStep("success");
          }, 2000);
        }
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackClick = () => {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  };

  return (
    <div className={cn("flex w-[100%] flex-col min-h-screen bg-white dark:bg-black relative transition-colors duration-300", className)}>
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName={theme === "dark" ? "bg-black" : "bg-white"}
              colors={theme === "dark" ? [
                [167, 243, 208],
                [167, 243, 208],
              ] : [
                [4, 120, 87],
                [4, 120, 87],
              ]}
              dotSize={20}
              reverse={false}
            />
          </div>
        )}

        {reverseCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={4}
              containerClassName={theme === "dark" ? "bg-black" : "bg-white"}
              colors={theme === "dark" ? [
                [167, 243, 208],
                [167, 243, 208],
              ] : [
                [4, 120, 87],
                [4, 120, 87],
              ]}
              dotSize={20}
              reverse={true}
            />
          </div>
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9)_0%,_rgba(255,255,255,0)_100%)] dark:bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.9)_0%,_rgba(0,0,0,0)_100%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white to-white/0 dark:from-black dark:to-black/0 pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 items-center justify-center">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center relative min-h-[calc(100vh-140px)] mt-[100px] sm:mt-[120px] mb-12 px-4 sm:px-6">
          
          {/* Central Hero Content */}
          <div className="w-full max-w-4xl text-center">
            <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-8 text-center"
                  >
                    <div className="space-y-4">
                      <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                        className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-black dark:text-white leading-[1.12]"
                      >
                        Where builders connect, <br className="hidden sm:inline" />
                        and bold ideas take flight.
                      </motion.h1>

                      <p className="text-lg sm:text-xl text-black/70 dark:text-white/70 font-normal max-w-2xl mx-auto leading-relaxed pt-1">
                        Find exciting hackathons, team up with passionate creators, and build projects you're truly proud of.
                      </p>
                    </div>

                    {/* Luxury Action CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                      {/* Explore Events - Luxury Primary Button */}
                      <Link
                        to="/events"
                        className="relative group overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-semibold text-sm sm:text-base tracking-wide shadow-[0_10px_25px_-5px_rgba(5,150,105,0.4)] hover:shadow-[0_20px_35px_-8px_rgba(5,150,105,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
                      >
                        {/* Shimmer light sweep */}
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                        
                        <span className="relative z-10">Explore Events</span>
                        <span className="relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-1.5 font-bold">
                          →
                        </span>
                      </Link>

                      {/* Member Login - Sleek Luxury Secondary Button */}
                      <Link
                        to="/user/login"
                        className="relative group w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-black/15 dark:border-white/20 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.07] dark:hover:bg-white/[0.1] text-black dark:text-white font-medium text-sm sm:text-base tracking-wide backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                      >
                        <span>Member Login</span>
                      </Link>
                    </div>

                    {/* Secondary Access Links */}
                    <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-black/60 dark:text-white/60 pt-1">
                      <Link to="/user/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-4 transition-colors">
                        New member? Create an account
                      </Link>
                      <span className="text-black/30 dark:text-white/30">•</span>
                      <Link to="/admin/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-4 transition-colors">
                        Organizer portal
                      </Link>
                    </div>

                    {/* Subtle Metrics Strip */}
                    <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-2xl mx-auto border-t border-black/10 dark:border-white/10 mt-6 text-center">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">50+</div>
                        <div className="text-xs text-black/50 dark:text-white/50 mt-1 font-medium">Hackathons Hosted</div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">10K+</div>
                        <div className="text-xs text-black/50 dark:text-white/50 mt-1 font-medium">Builders Connected</div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">₹25L+</div>
                        <div className="text-xs text-black/50 dark:text-white/50 mt-1 font-medium">Prizes Awarded</div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">100%</div>
                        <div className="text-xs text-black/50 dark:text-white/50 mt-1 font-medium">Free for Students</div>
                      </div>
                    </div>

                    <p className="text-xs text-black/40 dark:text-white/40 pt-4">
                      By continuing, you agree to HackHub <Link to="#" className="underline text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors">Terms of Service</Link>, <Link to="#" className="underline text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors">Privacy Notice</Link>, and <Link to="#" className="underline text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors">Policies</Link>.
                    </p>
                  </motion.div>
                ) : step === "code" ? (
                  <motion.div
                    key="code-step"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-black dark:text-white">We sent you a code</h1>
                      <p className="text-[1.25rem] text-black/50 dark:text-white/50 font-light">Please enter it</p>
                    </div>

                    <div className="w-full">
                      <div className="relative rounded-full py-4 px-5 border border-black/10 dark:border-white/10 bg-transparent">
                        <div className="flex items-center justify-center">
                          {code.map((digit, i) => (
                            <div key={i} className="flex items-center">
                              <div className="relative">
                                <input
                                  ref={(el) => {
                                    codeInputRefs.current[i] = el;
                                  }}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={1}
                                  value={digit}
                                  onChange={e => handleCodeChange(i, e.target.value)}
                                  onKeyDown={e => handleKeyDown(i, e)}
                                  className="w-8 text-center text-xl bg-transparent text-black dark:text-white border-none focus:outline-none focus:ring-0 appearance-none"
                                  style={{ caretColor: 'transparent' }}
                                />
                                {!digit && (
                                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                                    <span className="text-xl text-black dark:text-white">0</span>
                                  </div>
                                )}
                              </div>
                              {i < 5 && <span className="text-black/20 dark:text-white/20 text-xl">|</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <motion.p
                        className="text-white/50 hover:text-white/70 transition-colors cursor-pointer text-sm"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        Resend code
                      </motion.p>
                    </div>

                    <div className="flex w-full gap-3">
                      <motion.button
                        onClick={handleBackClick}
                        className="rounded-full bg-black dark:bg-white text-white dark:text-black font-medium px-8 py-3 hover:bg-black/90 dark:hover:bg-white/90 transition-colors w-[30%]"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        Back
                      </motion.button>
                      <motion.button
                        className={`flex-1 rounded-full font-medium py-3 border transition-all duration-300 ${code.every(d => d !== "")
                          ? "bg-black dark:bg-white text-white dark:text-black border-transparent hover:bg-black/90 dark:hover:bg-white/90 cursor-pointer"
                          : "bg-gray-200 dark:bg-[#111] text-black/50 dark:text-white/50 border-black/10 dark:border-white/10 cursor-not-allowed"
                          }`}
                        disabled={!code.every(d => d !== "")}
                      >
                        Continue
                      </motion.button>
                    </div>

                    <div className="pt-16">
                      <p className="text-xs text-white/40">
                        By signing up, you agree to the <Link to="#" className="underline text-white/40 hover:text-white/60 transition-colors">MSA</Link>, <Link to="#" className="underline text-white/40 hover:text-white/60 transition-colors">Product Terms</Link>, <Link to="#" className="underline text-white/40 hover:text-white/60 transition-colors">Policies</Link>, <Link to="#" className="underline text-white/40 hover:text-white/60 transition-colors">Privacy Notice</Link>, and <Link to="#" className="underline text-white/40 hover:text-white/60 transition-colors">Cookie Notice</Link>.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-step"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-black dark:text-white">You're in!</h1>
                      <p className="text-[1.25rem] text-black/50 dark:text-white/50 font-light">Welcome</p>
                    </div>

                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="py-10"
                    >
                      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="w-full rounded-full bg-black dark:bg-white text-white dark:text-black font-medium py-3 hover:bg-black/90 dark:hover:bg-white/90 transition-colors"
                    >
                      Continue to Dashboard
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
  );
};


export default HeroSection;