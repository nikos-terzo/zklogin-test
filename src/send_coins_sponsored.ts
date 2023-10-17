import { EPH_KEYPAIR, MAX_EPOCH } from "./consts";
import { JWT_RANDOMNESS, JWT_TOKEN, USER1_SECRET_KEY } from "./priv_const";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";
import { getProof } from "./proof";
import { getSalt } from "./salt";
import { ZkSignatureInputs, genAddressSeed, getZkSignature, jwtToAddress } from "@mysten/zklogin";
import { decodeJwt } from 'jose';
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64, toB64 } from "@mysten/bcs";

async function sendCoinsFromZKAddress(to: string) {

    const salt = await getSalt(JWT_TOKEN);

    const address = jwtToAddress(JWT_TOKEN, BigInt(salt));
    console.log(`salt = ${salt}`);
    console.log(`address = ${address}`);

    const signer = EPH_KEYPAIR;

    const proof = await getProof(JWT_TOKEN, signer.getPublicKey(), MAX_EPOCH, JWT_RANDOMNESS, salt);

    const client = new SuiClient({
        url: "http://127.0.0.1:9000"
    });

    const txb = new TransactionBlock();

    txb.setGasBudget(10_000_000);
    const sponsor = Ed25519Keypair.fromSecretKey(
        Uint8Array.from(
            Array.from(
                fromB64(USER1_SECRET_KEY!)),
        ).slice(1)
    );
    const giftCoin = txb.splitCoins(txb.gas, [txb.pure(3000000)]);

    txb.transferObjects([giftCoin], txb.pure(to));

    // Sponsor diff
    const kindBytes = await txb.build({ client, onlyTransactionKind: true });

    const sponsoredTxb = TransactionBlock.fromKind(kindBytes);
    sponsoredTxb.setSender(address);
    sponsoredTxb.setGasOwner(sponsor.toSuiAddress());
    
    const { bytes: bytes1, signature: sponsorSig } = await sponsoredTxb.sign({
        client,
        signer: sponsor
    });
    // Sponsor diff end

    const { bytes, signature: userSignature } = await sponsoredTxb.sign({
        client,
        signer: EPH_KEYPAIR,
    });

    console.log(`bytes === bytes1: ${bytes === bytes1}`);

    const decodedJWT = decodeJwt(JWT_TOKEN);
    console.log(decodedJWT);

    if (!decodedJWT.sub || !decodedJWT.iss || !decodedJWT.aud) {
        throw new Error('Missing jwt data');
    }

    const addressSeed = genAddressSeed(
        BigInt(salt),
        "sub",
        decodedJWT.sub!,
        Array.isArray(decodedJWT.aud) ? decodedJWT.aud[0] : decodedJWT.aud!).toString();

    const inputs: ZkSignatureInputs = { ...proof, addressSeed };

    console.log(inputs);
    const zkSignature = getZkSignature({
        inputs,
        maxEpoch: MAX_EPOCH,
        userSignature
    });



    try {
        const resp = await client.executeTransactionBlock({
            transactionBlock: bytes,
            signature: [zkSignature, sponsorSig],
            requestType: 'WaitForLocalExecution',
            options: {
                showEffects: true
            }
        });

        console.log(JSON.stringify(resp));
    } catch (e) {
        console.log(`Error ${e}`);
        // Returns
        // Invalid user signature: Expect 1 signer signatures but got 2.
    }
}

sendCoinsFromZKAddress("0x37512f8d193651a25ef310ec70b13000b692cff364c58769410bc651630e51ff");

