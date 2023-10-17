import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { EPH_KEYPAIR, MAX_EPOCH, REDIRECT_URI } from './consts';
import { JWT_RANDOMNESS } from './priv_const';


export function getOAuthUrl(redirect_uri: string, maxEpoch: number) {

    // Use const ephemeralKeyPair for reproducibility

    // Use const RANDOMNESS for reproducibility
    const jwtRandomness = JWT_RANDOMNESS;
    // const jwtRandomness = generateRandomness();
    console.log(`publicKey = ${EPH_KEYPAIR.getPublicKey()}`);
    const nonce = generateNonce(EPH_KEYPAIR.getPublicKey(), maxEpoch, BigInt(jwtRandomness));
    const params = new URLSearchParams({
        state: new URLSearchParams({
            redirect_uri: redirect_uri
        }).toString(),
        client_id: '595966210064-3nnnqvmaelqnqsmq448kv05po362smt2.apps.googleusercontent.com',
        redirect_uri: 'https://zklogin-dev-redirect.vercel.app/api/auth',
        response_type: 'id_token',
        scope: 'openid',
        nonce: nonce,
    });

    return {
        url:`https://accounts.google.com/o/oauth2/v2/auth?${params}`,
        jwtRandomness: jwtRandomness.toString()
    };
}

// Use const MAX_EPOCH for reproducibility.
// Note that the REDIRECT_URI in this case will go to a ERR_CONNECTION_REFUSED
// After visiting this link jwt will be available on the url fragment.
console.log(getOAuthUrl(REDIRECT_URI, MAX_EPOCH));

