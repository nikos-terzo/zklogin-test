import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

export const EPH_KEYPAIR = Ed25519Keypair.fromSecretKey(
    new Uint8Array([
        151, 96, 174, 84, 120, 118, 210, 96, 206, 153, 251, 149, 215, 219, 247, 29,
        29, 161, 188, 160, 168, 172, 137, 26, 192, 32, 12, 245, 136, 75, 124, 161
    ])
);
export const REDIRECT_URI = 'http://127.0.0.1:5173';
export const MAX_EPOCH = 1000;

