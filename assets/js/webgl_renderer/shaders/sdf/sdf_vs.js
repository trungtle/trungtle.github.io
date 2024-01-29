export default `#version 300 es
#define POSITION_LOCATION 0

precision highp float;
precision highp int;

in vec4 a_position;
uniform vec2 u_resolution;

void main()
{
    vec2 pos_clipspace = (a_position.xy / u_resolution) * vec2(2.0,2.0) - vec2(1.0,1.0);
    gl_Position = vec4(pos_clipspace * vec2(1,-1), 0.0, 1.0);
}
`;
