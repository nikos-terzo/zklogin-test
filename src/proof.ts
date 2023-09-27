import { toBigIntBE } from "bigint-buffer";

export async function getProof(jwt_token: string, publicKey: Uint8Array, maxEpoch: number, randomness: number, salt: string) {
    const extendedEphemeralPublicKey = toBigIntBE(
        Buffer.from(publicKey),
    ).toString();
    const url = 'https://prover.mystenlabs.com/v1';
    const data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            jwt: jwt_token,
            extendedEphemeralPublicKey,
            maxEpoch,
            jwtRandomness: randomness,
            salt: salt,
            keyClaimName: 'sub'
        })
    };
    const response = await fetch(url, data);
    return await response.json();
}
