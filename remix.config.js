/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true
  },
  ignoredRouteFiles: ['**/.*'],
  serverModuleFormat: 'cjs',
  serverDependenciesToBundle: [
    /^rehype.*/,
    /^remark.*/,
    /^unified.*/,
    'postgres'
  ],
  tailwind: true,
  postcss: true
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
}
