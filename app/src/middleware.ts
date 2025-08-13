// Temporarily disabled to debug authentication issues
export default function middleware() {
  return;
}

// import { withAuth } from 'next-auth/middleware';

// export default withAuth({
//   callbacks: {
//     authorized: ({ token }) => !!token,
//   },
// });

// export const config = {
//   matcher: [
//     '/profile/:path*',
//     '/activities/:path*',
//   ],
// }; 