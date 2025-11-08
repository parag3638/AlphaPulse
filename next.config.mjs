/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;


// // next.config.mjs
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     async rewrites() {
//         return [
//             {
//                 source: '/api/auth/:path*',
//                 // destination: 'https://authbackend-cc2d.onrender.com/api/auth/:path*',
//                 destination: 'http://localhost:9000/api/auth/:path*',
//             },
//         ]
//     },
// }

// export default nextConfig
