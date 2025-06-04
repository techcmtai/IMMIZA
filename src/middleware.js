import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const token = request.cookies.get('token')?.value;

  console.log('Middleware - Request path:', request.nextUrl.pathname);
  console.log('Middleware - Token present:', token ? 'Yes' : 'No');

  // If the user is trying to access admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      console.log('Middleware - No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('Middleware - Token found, validating...');

    try {
      // Define both the new and old JWT secrets for backward compatibility
      const JWT_SECRET = process.env.JWT_SECRET || 'immiza-secure-jwt-secret-key-2025';
      const OLD_JWT_SECRET = 'immiza-secure-jwt-secret-key-2023'; // The previous secret

      // Make sure token is a string
      const tokenString = String(token);

      // Basic validation: JWT tokens should have 3 parts separated by dots
      if (!tokenString || !tokenString.includes('.') || tokenString.split('.').length !== 3) {
        console.log('Middleware - Malformed token format:', tokenString.substring(0, 10) + '...');
        return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
      }

      console.log('Middleware - Token format valid, verifying signature...');
      console.log('Middleware - Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
      console.log('Middleware - Using OLD_JWT_SECRET:', OLD_JWT_SECRET.substring(0, 10) + '...');

      // Try to verify with the current secret first
      let payload;
      try {
        console.log('Middleware - Attempting to verify with current secret');
        const result = await jwtVerify(
          tokenString,
          new TextEncoder().encode(JWT_SECRET)
        );
        payload = result.payload;
        console.log('Middleware - Token verified with current secret');
      } catch (newSecretError) {
        console.log('Middleware - Failed to verify with current secret:', newSecretError.message);
        // If that fails, try with the old secret
        try {
          console.log('Middleware - Attempting to verify with old secret');
          const result = await jwtVerify(
            tokenString,
            new TextEncoder().encode(OLD_JWT_SECRET)
          );
          payload = result.payload;
          console.log('Middleware - Token verified with old secret');
        } catch (oldSecretError) {
          console.log('Middleware - Failed to verify with old secret:', oldSecretError.message);

          // As a last resort, try with a hardcoded secret
          try {
            console.log('Middleware - Attempting with hardcoded secret as last resort');
            const hardcodedSecret = 'immiza-secure-jwt-secret-key-2025';
            const result = await jwtVerify(
              tokenString,
              new TextEncoder().encode(hardcodedSecret)
            );
            payload = result.payload;
            console.log('Middleware - Token verified with hardcoded secret');
          } catch (hardcodedError) {
            console.log('Middleware - Failed with hardcoded secret:', hardcodedError.message);
            // If all fail, throw the original error
            throw newSecretError;
          }
        }
      }

      // Check if user is admin
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Middleware error:', error);
      console.log('Middleware - Error details:', error.message);
      console.log('Middleware - Error code:', error.code);
      console.log('Middleware - Redirecting to login page with error');
      return NextResponse.redirect(new URL('/login?error=auth_failed&message=' + encodeURIComponent(error.message), request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
};
