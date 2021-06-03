precision mediump float;

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_surfaceToView;
varying vec4 v_color;
varying vec3 v_worldPosition;
varying vec3 v_viewWorldPosition;

uniform sampler2D ambientMap;
uniform sampler2D diffuseMap;
uniform sampler2D shininessMap;
uniform sampler2D normalMap;
uniform vec3 diffuse;
uniform vec3 ambient;
uniform vec3 specular;
uniform float shininess;
uniform vec3 Ia;
uniform vec3 Is;
uniform vec3 L;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 tangent = normalize(v_tangent);
    vec3 bitangent = normalize(cross(normal,tangent));

    mat3 tbn = mat3(tangent, bitangent, normal);
    normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
    normal = normalize(tbn * normal);

    vec4 diffMap = texture2D(diffuseMap, v_texcoord);
    vec4 sMap = texture2D(shininessMap, v_texcoord);
    vec4 ambiMap = texture2D(ambientMap, v_texcoord);

    vec3 eyeToSurfaceDir = normalize(v_worldPosition - v_viewWorldPosition);

    vec3 result = ambient * Ia * ambiMap.rgb;

    float lambertian = max(dot(normal, L), 0.0) ;
    if(lambertian > 0.0)
        result += diffuse * lambertian * diffMap.rgb * v_color.rgb
                + specular * pow(max(dot(reflect(eyeToSurfaceDir, normal), v_surfaceToView), 0.0), shininess) * sMap.rgb;

    gl_FragColor = vec4(result, 1.0);
}