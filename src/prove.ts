import { jwtToAddress } from "@mysten/zklogin";
import { JWT_RANDOMNESS, JWT_TOKEN } from "./priv_const";
import { getSalt } from "./salt";
import { getProof } from "./proof";
import { EPH_KEYPAIR, MAX_EPOCH } from "./consts";
// import { decodeJwt } from "jose";

// const decodedJWT = decodeJwt(JWT_TOKEN);

getSalt(JWT_TOKEN).then(async (salt) => {
    console.log(`salt = ${salt}`);
    console.log(`address = ${jwtToAddress(JWT_TOKEN, BigInt(salt))}`);

    const keypair = EPH_KEYPAIR;
    const resp = await getProof(JWT_TOKEN, keypair.getPublicKey(), MAX_EPOCH, JWT_RANDOMNESS, salt);
    console.log(JSON.stringify(resp));
});

