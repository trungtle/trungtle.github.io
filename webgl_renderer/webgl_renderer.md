---
layout: page
title: WebGL renderer (WIP)
---

Use **Up**, **Down**, **Left**, **Right** arrows for camera control.

<div class="renderer"></div>

<script id="vs" type="x-shader/x-vertex">
    #version 300 es
    #define POSITION_LOCATION 0
    
    precision highp float;
    precision highp int;

    layout(location = POSITION_LOCATION) in vec2 pos;
    uniform vec2 u_resolution;

    void main()
    {
        vec2 pos_clipspace = (pos / u_resolution) * vec2(2.0,2.0) - vec2(1.0,1.0);
        gl_Position = vec4(pos_clipspace, 0.0, 1.0);
    }
</script>

<script id="fs" type="x-shader/x-fragment">
    #version 300 es
    precision highp float;
    precision highp int;

    // Visualization mode
    #define VM_DEFAULT       0
    #define VM_NORMAL        1
    #define VM_SCREEN_UV     2

    #define PI (3.14159265359)

    #define MAX_DIST 500.0
    #define MIN_DIST 0
    #define SURFACE_LEVEL 1e-4
    #define MAX_RAYMARCH_STEPS 256

    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;
    uniform vec3 u_currentCamAngles;
    uniform mat4 u_camera;
    uniform vec3 u_cameraOrigin;
    uniform vec3 u_cameraFront;

    uniform vec4 u_color;
    uniform vec3 u_translate;
    uniform vec2 u_resolution;
    uniform int u_visMode;

    uniform vec3 u_lights[1];

    out vec4 o_color;

    // Rotation matrix around the X axis.
    mat4 Translate(vec3 t) {
        return mat4(
            vec4(1, 0, 0, t.x),
            vec4(0, 1, 0, t.y),
            vec4(0, 0, 1, t.z),
            vec4(0, 0, 0, 1)
        );
    }

    mat4 RotateX(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat4(
            vec4(1, 0, 0, 0),
            vec4(0, c, -s, 0),
            vec4(0, s, c, 0),
            vec4(0, 0, 0, 1)
        );
    }

    // Rotation matrix around the Y axis.
    mat4 RotateY(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat4(
            vec4(c, 0, s, 0),
            vec4(0, 1, 0, 0),
            vec4(-s, 0, c, 0),
            vec4(0, 0, 0, 1)
        );
    }

    // Rotation matrix around the Z axis.
    mat4 RotateZ(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat4(
            vec4(c, -s, 0, 0),
            vec4(s, c, 0, 0),
            vec4(0, 0, 1, 0),
            vec4(0, 0, 0, 1)
        );
    }

    float ToRad(float degree) {
        return degree * PI / 360.0;
    }

    // Identity matrix.
    mat3 Identity() {
        return mat3(
            vec3(1, 0, 0),
            vec3(0, 1, 0),
            vec3(0, 0, 1)
        );
    }

    float rand(float co) { 
        return fract(sin(co*(91.3458)) * 47453.5453); 
    }

    float rand(vec2 co) { 
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); 
    }

    float rand(vec3 co){ 
        return rand(co.xy+rand(co.z)); 
    }

    vec3 NormalizeRGB(vec3 RGB) {
        return RGB / vec3(255.0);
    }

    vec3 NormalizeRGB(int R, int G, int B) {
        return vec3(float(R) / 255.0, float(G) / 255.0, float(B) / 255.0);
    }

    // --- Materials --- //
    float checkers(in vec2 p)
    {
        vec2 s = sign(fract(p*.5)-.5);
        return .5 - .5*s.x*s.y;
    }

    // https://iquilezles.org/articles/checkerfiltering
    float CheckersGradBox( in vec2 p )
    {
        // filter kernel
        vec2 w = fwidth(p) + 0.001;
        // analytical integral (box filter)
        vec2 i = 2.0*(abs(fract((p-0.5*w)*0.5)-0.5)-abs(fract((p+0.5*w)*0.5)-0.5))/w;
        // xor pattern
        return 0.5 - 0.5*i.x*i.y;                  
    }

    // --- Ray --- //

    struct Ray {
        vec3 origin;
        vec3 direction;
    };

    struct HitResult {
        vec3 hit;       
        bool bHit;
        float d;
        int material;
    };

    struct Surface {
        float d;
        int material;
    };

    // ------ //

    vec3 PointOnRay(Ray r, float t) {
        return r.origin + r.direction * t;
    }

    // --- SDF functions --- //
    // https://iquilezles.org/articles/distfunctions/
    float sdSphere(vec3 p, vec3 center, float r) {        
        return length(p - center) - r;
    }

    float sdPlane(vec3 p, float height) {
        return p.y + height;
    }

    float sdEllipsoid(vec3 p, vec3 r)
    {
        float k0 = length(p/r);
        float k1 = length(p/(r*r));
        return k0*(k0-1.0)/k1;
    }

    float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }
        
    Surface opSmoothUnion(Surface s1, Surface s2, float k) {
        float h = clamp( 0.5 + 0.5*(s2.d-s1.d)/k, 0.0, 1.0 );
        float d = mix(s2.d, s1.d, h) - k*h*(1.0-h); 
        if (s1.d < s2.d) {
            return Surface(d, s1.material);
        } else {
            return Surface(d, s2.material);
        }
    }

    Surface opMin(Surface s1, Surface s2) {
        float d = min(s1.d, s2.d);
        if (s1.d < s2.d) {
            return Surface(d, s1.material);
        } else {
            return Surface(d, s2.material);
        }
    }
    // ------ //

    Surface SceneBasicShapes(vec3 p) {
        mat4 tx = Translate(u_translate);
        mat4 rx = RotateX(u_time);
        mat4 ry = RotateY(u_time);
        mat4 rz = RotateZ(u_time);
        vec4 xformP = vec4(p, 1.0) * tx * rx;
        Surface plane = Surface(sdSphere(p, vec3(0.0,-200.0,0.0), 200.0), 1);
        Surface e1 = Surface(sdEllipsoid(p, vec3(0.28,0.5,0.02)), 0);
        Surface b1 = Surface(sdBox(xformP.xyz, vec3(0.2, 1.0, 0.5)), 0);
        mat4 txBackwall = Translate(vec3(0,0,2.0));
        vec4 xformBackWall = vec4(p, 1.0) * txBackwall;
        Surface backwall = Surface(sdBox(xformBackWall.xyz, vec3(2.2, 5.0, 0.5)), 0);
        Surface s1 = Surface(sdSphere(p, vec3(0.0,0.5,0.0), 0.5), 0);
        Surface s2 = Surface(sdSphere(p, vec3(1.0,0.5,0.0), 0.2), 0);
        Surface s3 = Surface(sdSphere(p, vec3(-1.0,0.5,0.0), 0.2), 0);
        Surface s4 = Surface(sdSphere(p, vec3(0.0,0.5,0.5), 0.2), 0);

        Surface sur = plane;

        Surface torso = opSmoothUnion(s1, s2, 1.0);
        torso = opSmoothUnion(torso, s3, 1.0);
        torso = opSmoothUnion(torso, s4, 1.0);
        sur = opMin(sur, torso);
        // sur = opMin(sur, backwall);

        return sur;
    }

    Surface Map(vec3 p) {
        Surface mr = SceneBasicShapes(p);
        return mr;
    }

    float MapD(vec3 p) {
        Surface mr = SceneBasicShapes(p);
        return mr.d;
    }

    mat3 Camera(vec3 cameraPos, vec3 lookAtPoint) {
        vec3 cd = normalize(lookAtPoint - cameraPos); // camera direction
        vec3 cr = normalize(cross(vec3(0, 1, 0), cd)); // camera right
        vec3 cu = normalize(cross(cd, cr)); // camera up
        
        return mat3(-cr, cu, -cd); // negative signs can be turned positive (or vice versa) to flip coordinate space conventions
    }

    float CalcAO( in vec3 pos, in vec3 nor)
    {
        float occ = 0.0;
        float sca = 1.0;
        for( int i=0; i<5; i++ )
        {
            float hr = 0.01 + 0.12*float(i)/4.0;
            vec3 aopos =  nor * hr + pos;
            float dd = MapD(aopos);
            occ += (hr-dd)*sca;
            sca *= 0.95;
        }
        return clamp( 1.0 - 2.0*occ, 0.0, 1.0 );    
    }

    float CalcShadow(in Ray ray) {
        float k = 8.0;
        float t = 0.0;

        // How close th ray could have hit a surface
        float res = 1.0;
        float ph = 1e20;
        for (int i = 0; i < 32; i++) {
            vec3 p = PointOnRay(ray, t);
            float h = MapD(p);

            if (h < SURFACE_LEVEL || h > MAX_DIST) {
                break;
            }

            float y = (i==0) ? 0.0 : h*h/(2.0*ph);
            float d = sqrt(h * h - y * y);
            res = min(res, k * d / max(0.0, t - y));            
            ph = h;

            t += h;
        }

        res = clamp(res, 0.0, 1.0);
        res = res*res*(3.0 - 2.0*res);

        return res;
    }

    vec3 CalcNormal(vec3 pos) {
        vec2 e = vec2(1.0,-1.0)*0.5*5e-3;
        return normalize( e.xyy*MapD( pos + e.xyy ) + 
                        e.yyx*MapD( pos + e.yyx ) + 
                        e.yxy*MapD( pos + e.yxy ) + 
                        e.xxx*MapD( pos + e.xxx ) );
    }

    vec3 Sky(Ray ray) {
        float t = 0.5 * ray.direction.y + 1.0;
        return (1.0 - t) * vec3(1,1,1) + t * NormalizeRGB(135, 206, 235);
    }

    HitResult RayMarch(Ray ray) {
        HitResult result;

        float t = 0.0;
        for (int i = 0; i < MAX_RAYMARCH_STEPS; i++) {
            vec3 p = PointOnRay(ray, t);
            Surface mr = Map(p);
            float h = mr.d;

            if (h < SURFACE_LEVEL || h > MAX_DIST) {
                result.bHit = (h < SURFACE_LEVEL);
                break; 
            }
            result.hit = p;
            result.d = t;
            result.material = mr.material;
            t += h;
        }

        return result;
    }

    vec3 Render(Ray ray) {
        HitResult result = RayMarch(ray  );

        vec3 light = u_lights[0];

        vec3 color = u_color.xyz;
        if (result.bHit) {
            vec3 N = CalcNormal(result.hit);

            if (u_visMode == VM_NORMAL) {
                color = (N + vec3(1.0)) * 0.5;
            } else {

                vec3 L = normalize(vec3(light - result.hit));

                
                float shadow = 1.0;

                vec3 albedo = NormalizeRGB(0, 255, 205);
                vec3 ambient = NormalizeRGB(227, 211, 228);

                float occ;
                occ = 0.5+0.5*N.y;

                // Hit the floor
                if (result.material == 1) {
                    occ = 1.0;
                    albedo = 0.05 * vec3(1.0);
                    albedo *= 8.9 + CheckersGradBox(result.hit.xz * 2.0);

                    // Compute Shadow
                    Ray shadowRay;
                    shadowRay.origin = result.hit + L * 1e-5;
                    shadowRay.direction = L;

                    shadow = CalcShadow(shadowRay);
                }


                occ *= CalcAO(result.hit, N);

                vec3 specular = pow(dot(reflect(L, N), ray.direction), 2.0) * vec3(0.4);
                color = dot(N, L) * albedo * shadow + ambient * 0.1 + specular;
            }
        } else {
            color = Sky(ray);
        }

        return color;
    }

    #define AA 4

    void main()
    {
        vec2 uv = (gl_FragCoord.xy - vec2(0.5) * u_resolution.xy) / u_resolution.y;

        // Mouse
        vec2 mouse = u_mouse / u_resolution.x;
        float yaw = u_currentCamAngles.x;
        float pitch = u_currentCamAngles.y;

        vec3 color = vec3(1,0,0);
        if (u_visMode == VM_SCREEN_UV) {
            color = vec3(uv,0);
        } else {

            vec3 origin = u_cameraOrigin;
            vec3 direction = normalize(vec3(cos(yaw) * cos(pitch), sin(pitch), sin(yaw) * cos(pitch)));
            vec3 lookat = u_cameraOrigin + u_cameraFront;
            Ray ray;
            ray.origin = origin;

            mat3 cam = Camera(ray.origin, lookat);

            #if AA > 1
            vec3 totalColor = vec3(0.0);
            for (int m = 0; m < AA; m++) {
                for (int n = 0; n < AA; n++) {
                    vec2 offset = vec2(float(m), float(n)) / (u_resolution * vec2(AA));
                    float u = uv.x + offset.x;
                    float v = uv.y + offset.y;
                    ray.direction = cam * normalize(vec3(u,v, -1.0));
                    color = Render(ray);

                    totalColor += color;
                }
            }            
            color = totalColor / max(float(AA*AA), 1e-4);
            #else
            ray.direction = normalize(vec3(uv, -1.0));
            color = Render(ray);
            #endif

        }

        o_color = vec4(color,1);
    }
</script>

<!-- <script type="text/javascript" src="https://unpkg.com/glsl-canvas-js/dist/umd/glsl-canvas.min.js"></script>

<canvas class="glsl-canvas" controls data-fragment-url="/webgl_renderer/shaders/main.frag" width="500" height="500" data-mode="flat"></canvas> -->

<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/core/gl-matrix-min.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/utility.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/math/vec2f.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/math/vec3f.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/core/mesh2d.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/core/ray.js"></script>

<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/main.js"></script>

<button onclick="onVisMode();">Change vis mode</button>
