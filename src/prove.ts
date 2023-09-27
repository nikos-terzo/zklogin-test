import { jwtToAddress } from "@mysten/zklogin";
import { JWT_TOKEN } from "./priv_const";
import { getSalt } from "./salt";
import { getProof } from "./proof";
import { EPH_PUBLIC_KEY, MAX_EPOCH, RANDOMNESS } from "./consts";

getSalt(JWT_TOKEN).then(async (salt) => {
    console.log(`salt = ${salt}`);
    console.log(`address = ${jwtToAddress(JWT_TOKEN, BigInt(salt))}`);

    const resp = await getProof(JWT_TOKEN, EPH_PUBLIC_KEY, MAX_EPOCH, RANDOMNESS, salt);
    console.log(JSON.stringify(resp));
});
