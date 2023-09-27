
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { generateNonce } from '@mysten/zklogin';
import { EPH_PUBLIC_KEY, EPH_SECRET_KEY, MAX_EPOCH, RANDOMNESS, REDIRECT_URI } from './consts';


export function getOAuthUrl(redirect_uri: string, maxEpoch: number) {

    // Use const ephemeralKeyPair for reproducibility
    const ephemeralKeyPair = new Ed25519Keypair({
        publicKey: EPH_PUBLIC_KEY,
        secretKey: EPH_SECRET_KEY
    });

    // Use const RANDOMNESS for reproducibility
    const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, BigInt(RANDOMNESS));
    const params = new URLSearchParams({
        // When using the provided test client ID + redirect site, the redirect_uri needs to be provided in the state.
        state: new URLSearchParams({
            redirect_uri: redirect_uri
        }).toString(),
        // Test Client ID for devnet / testnet:
        client_id: '25769832374-famecqrhe2gkebt5fvqms2263046lj96.apps.googleusercontent.com',
        redirect_uri: 'https://zklogin-dev-redirect.vercel.app/api/auth',
        response_type: 'id_token',
        scope: 'openid',
        // See below for details about generation of the nonce
        nonce: nonce,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// Use const MAX_EPOCH for reproducibility.
// Note that the REDIRECT_URI in this case will go to a ERR_CONNECTION_REFUSED
// After visiting this link jwt will be available on the url fragment.
console.log(getOAuthUrl(REDIRECT_URI, MAX_EPOCH));

