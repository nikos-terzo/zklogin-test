import { EPH_KEYPAIR, MAX_EPOCH } from "./consts";
import { JWT_RANDOMNESS, JWT_TOKEN } from "./priv_const";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";
import { getProof } from "./proof";
import { getSalt } from "./salt";
import { ZkSignatureInputs, genAddressSeed, getZkSignature, jwtToAddress } from "@mysten/zklogin";
import { decodeJwt } from 'jose';

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
    txb.setGasOwner(address);
    txb.setSender(address);
    const giftCoin = txb.splitCoins(txb.gas, [txb.pure(3000000)]);

    txb.transferObjects([giftCoin], txb.pure(to));

    const { bytes, signature: userSignature } = await txb.sign({
        client,
        signer,
    });

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
            signature: zkSignature,
            options: {
                showEffects: true
            }
        });

        console.log(JSON.stringify(resp));
    } catch (e) {
        console.log(`Error ${e}`);
    }
}

sendCoinsFromZKAddress("0x32d3acb283559f180d6cb896ec461288c44f37e8a6e86a350cfa154a56df524c");

