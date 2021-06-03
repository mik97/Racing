attribute vec2 a_texcoord;
attribute vec3 a_normal;
attribute vec3 a_tangent;
attribute vec4 a_position;
attribute vec4 a_color;

uniform vec3 u_viewWorldPosition;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_surfaceToView;
varying vec3 v_worldPosition;
varying vec3 v_viewWorldPosition;
varying vec4 v_color;

void main() {
    gl_Position = u_projection * u_view * u_world * a_position;

    v_surfaceToView = normalize(u_viewWorldPosition - (u_world * a_position).xyz);

    v_normal = normalize(mat3(u_world) * a_normal);

    v_color = a_color;

    v_texcoord = a_texcoord;

    v_worldPosition = (u_world * a_position).xyz;

    v_viewWorldPosition = u_viewWorldPosition;

    v_tangent = normalize(mat3(u_world) * a_tangent);
}

