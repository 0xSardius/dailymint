import { NextRequest, NextResponse } from 'next/server';
import { createClient, Errors } from '@farcaster/quick-auth';

const client = createClient();

async function resolveUser(fid: number) {
  try {
    // Get primary address from Farcaster API
    const res = await fetch(
      `https://api.farcaster.xyz/fc/primary-address?fid=${fid}&protocol=ethereum`,
    );
    
    let primaryAddress: string | undefined;
    if (res.ok) {
      const { result } = await res.json() as {
        result: {
          address: {
            fid: number;
            protocol: 'ethereum' | 'solana';
            address: string;
          };
        };
      };
      primaryAddress = result.address.address;
    }

    return {
      fid,
      primaryAddress,
    };
  } catch (error) {
    console.error('Error resolving user:', error);
    return {
      fid,
      primaryAddress: undefined,
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];
    const hostname = request.headers.get('host') || 'localhost:3000';

    try {
      const payload = await client.verifyJwt({
        token,
        domain: hostname,
      });

      if (!payload.sub) {
        return NextResponse.json(
          { error: 'Invalid token payload' },
          { status: 401 }
        );
      }

      const user = await resolveUser(parseInt(payload.sub));
      return NextResponse.json(user);
    } catch (error) {
      if (error instanceof Errors.InvalidTokenError) {
        console.info('Invalid token:', error.message);
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 