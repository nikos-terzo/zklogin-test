import { PublicKey } from "@mysten/sui.js/cryptography";
import { toBigIntBE } from "bigint-buffer";

export async function getProof(jwt_token: string, publicKey: PublicKey, maxEpoch: number, randomness: string, salt: string) {
    const extendedEphemeralPublicKey = toBigIntBE(
        Buffer.from(publicKey.toSuiBytes()),
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
            salt,
            keyClaimName: 'sub'
        })
    };
    const response = await fetch(url, data);
    return await response.json();
}
