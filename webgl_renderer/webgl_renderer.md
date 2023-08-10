---
layout: page
title: WebGL renderer (WIP)
---

Experimenting with raymarching SDF in WebGL.

Use **Up**, **Down**, **Left**, **Right** arrows for camera control.

<div class="renderer"></div>

<script id="vs-sdf" type="x-shader/x-vertex">
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

<script id="ps-sdf" type="x-shader/x-fragment">
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
    #define MAX_RAYMARCH_STEPS 512

    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;
    uniform vec3 u_currentCamAngles;
    uniform mat4 u_camera;
    uniform vec3 u_cameraOrigin;
    uniform vec3 u_cameraFront;
    uniform vec3 u_cameraLookat;

    uniform vec4 u_color;
    uniform vec3 u_translate;
    uniform vec2 u_resolution;
    uniform int u_visMode;

    uniform vec3 u_lights[1];

    out vec4 o_color;

    // Tonemapping
    // linear white point
    const float W = 1.2;
    const float T2 = 7.5;

    float filmic_reinhard_curve (float x) {
        float q = (T2*T2 + 1.0)*x*x;
        return q / (q + x + T2*T2);
    }

    vec3 filmic_reinhard(vec3 x) {
        float w = filmic_reinhard_curve(W);
        return vec3(
            filmic_reinhard_curve(x.r),
            filmic_reinhard_curve(x.g),
            filmic_reinhard_curve(x.b)) / w;
    }


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

    // -- Rand / noises
    float rand(float co) {
        return fract(sin(co*(91.3458)) * 47453.5453);
    }

    float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    float rand(vec3 co){
        return rand(co.xy+rand(co.z));
    }

    vec3 hash(vec3 p){
        p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
                dot(p,vec3(269.5,183.3,246.1)),
                dot(p,vec3(113.5,271.9,124.6)));
        return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    }

    // Gradient noise from iq
    // return value noise (in x) and its derivatives (in yzw)
    vec4 noised(vec3 x){
        vec3 p = floor(x);
        vec3 w = fract(x);
        vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);

        vec3 ga = hash( p+vec3(0.0,0.0,0.0) );
        vec3 gb = hash( p+vec3(1.0,0.0,0.0) );
        vec3 gc = hash( p+vec3(0.0,1.0,0.0) );
        vec3 gd = hash( p+vec3(1.0,1.0,0.0) );
        vec3 ge = hash( p+vec3(0.0,0.0,1.0) );
        vec3 gf = hash( p+vec3(1.0,0.0,1.0) );
        vec3 gg = hash( p+vec3(0.0,1.0,1.0) );
        vec3 gh = hash( p+vec3(1.0,1.0,1.0) );

        float va = dot( ga, w-vec3(0.0,0.0,0.0) );
        float vb = dot( gb, w-vec3(1.0,0.0,0.0) );
        float vc = dot( gc, w-vec3(0.0,1.0,0.0) );
        float vd = dot( gd, w-vec3(1.0,1.0,0.0) );
        float ve = dot( ge, w-vec3(0.0,0.0,1.0) );
        float vf = dot( gf, w-vec3(1.0,0.0,1.0) );
        float vg = dot( gg, w-vec3(0.0,1.0,1.0) );
        float vh = dot( gh, w-vec3(1.0,1.0,1.0) );

        return vec4( va + u.x*(vb-va) + u.y*(vc-va) + u.z*(ve-va) + u.x*u.y*(va-vb-vc+vd) + u.y*u.z*(va-vc-ve+vg) + u.z*u.x*(va-vb-ve+vf) + (-va+vb+vc-vd+ve-vf-vg+vh)*u.x*u.y*u.z,    // value
                    ga + u.x*(gb-ga) + u.y*(gc-ga) + u.z*(ge-ga) + u.x*u.y*(ga-gb-gc+gd) + u.y*u.z*(ga-gc-ge+gg) + u.z*u.x*(ga-gb-ge+gf) + (-ga+gb+gc-gd+ge-gf-gg+gh)*u.x*u.y*u.z +   // derivatives
                    du * (vec3(vb,vc,ve) - va + u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) + u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) + u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh) ));
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

    float G1V(float dnv, float k){
    return 1.0/(dnv*(1.0-k)+k);
}

    float ggx(vec3 n, vec3 v, vec3 l, float rough, float f0){
        float alpha = rough*rough;
        vec3 h = normalize(v+l);
        float dnl = clamp(dot(n,l), 0.0, 1.0);
        float dnv = clamp(dot(n,v), 0.0, 1.0);
        float dnh = clamp(dot(n,h), 0.0, 1.0);
        float dlh = clamp(dot(l,h), 0.0, 1.0);
        float f, d, vis;
        float asqr = alpha*alpha;
        const float pi = 3.14159;
        float den = dnh*dnh*(asqr-1.0)+1.0;
        d = asqr/(pi * den * den);
        dlh = pow(1.0-dlh, 5.0);
        f = f0 + (1.0-f0)*dlh;
        float k = alpha/1.0;
        vis = G1V(dnl, k)*G1V(dnv, k);
        float spec = dnl * d * f * vis;
        return spec;
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
    float sdSphere(vec3 p, float r) {
        return length(p) - r;
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

    Surface opSMin(Surface s1, Surface s2, float k) {
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
        mat4 txBackwall = Translate(vec3(0,0,2.0));
        vec4 xformBackWall = vec4(p, 1.0) * txBackwall;

        Surface backwall = Surface(sdBox(xformBackWall.xyz, vec3(2.2, 5.0, 0.5)), 0);

        Surface plane = Surface(sdSphere(p - vec3(0.0,-200.0,0.0), 200.0), 1);
        Surface sur = plane;


        float displacement = sin(5.0 * p.x) * sin(5.0 * p.y) * sin(5.0 * p.z) * 0.015;
        Surface head = Surface(sdSphere(p - vec3(0, 1.5, 0), 2.0), 0);
        Surface neck = Surface(sdEllipsoid(p - vec3(0,1.0,0), vec3(1.0, 2.5, 1.6)), 0);
        Surface eyeR = Surface(sdSphere(p - vec3(0.62, 1.8, -2.0), 0.25), 2);
        Surface eyeL = Surface(sdSphere(p - vec3(-0.62, 1.8, -2.0), 0.25), 2);
        Surface mouth = Surface(sdEllipsoid(p - vec3(0,1.2,-1.98), vec3(0.2, 0.7, 0.2)), 2);
        Surface hair0 = Surface(sdEllipsoid(p - vec3(0,1.8,-0.5), vec3(0.1, 2.5, 0.1)), 2);
        Surface hair1 = Surface(sdEllipsoid(p - vec3(1.2,1.8,-0.8), vec3(0.1, 1.5, 0.1)), 2);
        Surface hair2 = Surface(sdEllipsoid(p - vec3(-1.2,1.8,-0.8), vec3(0.1, 1.5, 0.1)), 2);

        Surface character = opSMin(head,neck,1.0);
        character = opSMin(character,eyeL,0.1);
        character = opSMin(character,eyeR,0.1);
        character = opSMin(character,mouth,0.1);
        character = opSMin(character,hair0,0.1);
        character = opSMin(character,hair1,0.1);
        character = opSMin(character,hair2,0.1);

        sur = character;

        sur.d += displacement;

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
        float t = 0.5 * ray.direction.y + 0.3;
        return (1.0 - t) * vec3(1,1,1) + t * NormalizeRGB(0, 191, 255);
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

    // SSS: https://www.shadertoy.com/view/lllBDM
    float Subsurface(vec3 hit, vec3 v, vec3 n){
        vec3 d = refract(v, n, 1.0/1.5);
        vec3 o = hit;
        float a = 0.0;

        const float max_scatter = 2.5;
        for(float i = 0.1; i < max_scatter; i += 0.2)
        {
            o += i*d;
            float t = MapD(o);
            a += t;
        }
        float thickness = max(0.0, -a);
        const float scatter_strength = 16.0;
        return scatter_strength*pow(max_scatter*0.5, 3.0)/thickness;
    }

    vec3 Shade(Ray ray) {
        HitResult result = RayMarch(ray);

        vec3 light = u_lights[0];

        vec3 color = u_color.xyz;
        if (result.bHit) {
            vec3 N = CalcNormal(result.hit);
            vec3 V = ray.direction;

            if (u_visMode == VM_NORMAL) {
                color = (N + vec3(1.0)) * 0.5;
            } else {

                vec3 L = normalize(vec3(light - result.hit));
                float shadow = 1.0;

                float fresnel = pow( max(0.0, 1.00+dot(N, V)), 2.6 );
                // Default material (id = 0)
                vec3 albedo = NormalizeRGB(245,98,0);
                vec3 ambient = NormalizeRGB(227, 211, 228);

                // Eye
                if (result.material == 2)
                {
                    albedo = vec3(0.1,0.2,0.6);
                }

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
                vec3 sky = vec3(0.5,0.65,0.8)*2.0;
                float diffuse = max(0.0, dot(N, L));
                float spec = ggx(N, V, L, 3.0, fresnel);
                float ss = max(0.2, Subsurface(result.hit, V, N));

                diffuse = mix(diffuse, smoothstep(0.25, 0.9, pow(ss, 0.6)), 0.97);
                color = ambient + albedo * diffuse * 1.2 + 2.0 * spec + fresnel * sky;
                color *= 0.5;
            }
        } else {
            // color = Sky(ray);
            color = vec3(.969, .906, .808);
            color = NormalizeRGB(188, 245, 231);
        }

        return color;
    }

    #define AA 4

    void main()
    {
        vec2 uv = (gl_FragCoord.xy - vec2(0.5) * u_resolution.xy) / u_resolution.y;

        // Mouse
        vec2 mouse = u_mouse / u_resolution - 0.5;
        float yaw = u_currentCamAngles.x;
        float pitch = u_currentCamAngles.y;

        vec3 color = vec3(1,0,0);
        if (u_visMode == VM_SCREEN_UV) {
            color = vec3(uv,0);
        } else {

            vec3 origin = u_cameraOrigin + vec3(mouse.x, mouse.y, -6.0) * 2.0;
            //vec3 direction = normalize(vec3(cos(yaw) * cos(pitch), sin(pitch), sin(yaw) * cos(pitch)));
            vec3 rd = normalize(vec3(uv, -1));
            vec3 lookat = u_cameraLookat;
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
                    color = Shade(ray);

                    totalColor += color;
                }
            }
            color = totalColor / max(float(AA*AA), 1e-4);
            #else
            ray.direction = normalize(vec3(uv, -1.0));
            color = Shade(ray);
            #endif

        }

        // final color
        float vignette = 1.21 / (1.1 + 1.1*dot(uv, uv));
        vignette *= vignette;
        vignette = mix(1.0, smoothstep(0.1, 1.1, vignette), 0.25);
        color = vignette * color;
        color = filmic_reinhard(color);
        color = smoothstep(0.125, 1.41,color);
        // gamma correction
        color = pow(color, vec3(1.0/2.2));
        o_color = vec4(color, 1);
    }
</script>

<!-- <script type="text/javascript" src="https://unpkg.com/glsl-canvas-js/dist/umd/glsl-canvas.min.js"></script>

<canvas class="glsl-canvas" controls data-fragment-url="/webgl_renderer/shaders/main.frag" width="500" height="500" data-mode="flat"></canvas> -->

<button id="vismode">Change vis mode</button>

<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/core/gl-matrix-min.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/utility.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/math/vec2f.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/math/vec3f.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/core/mesh2d.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/core/ray.js"></script>
<script src="{{ base.url | prepend: site.url }}/assets/js/webgl_renderer/main.js"></script>

