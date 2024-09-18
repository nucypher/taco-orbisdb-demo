import {conditions, decrypt, domains, encrypt, initialize, ThresholdMessageKit} from '@nucypher/taco';
import {ethers} from "ethers";

const rpcCondition = new conditions.base.rpc.RpcCondition({
    chain: 80002,
    method: 'eth_getBalance',
    parameters: [':userAddressExternalEIP4361'],
    returnValueTest: {
      comparator: '>',
      value: 0,
    },
  });

export async function encryptWithTACo(
    messageToEncrypt: string,
): Promise<String> {
    await initialize();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tmk = await encrypt(
      provider,
      domains.TESTNET,
      messageToEncrypt,
      rpcCondition,
      0,
      provider.getSigner(),
    );
    return encodeB64(tmk.toBytes());
}

export async function decryptWithTACo(
    encryptedMessage: ThresholdMessageKit,
    conditionContext?: conditions.context.ConditionContext
): Promise<Uint8Array> {
    await initialize();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return await decrypt(
        provider,
        domains.TESTNET,
        encryptedMessage,
        conditionContext,
    )
}

export function encodeB64(uint8Array: any) {
    return Buffer.from(uint8Array).toString("base64");
}
  
export function decodeB64(b64String: any) {
    return new Uint8Array(Buffer.from(b64String, "base64"));
}

// export function parseUrsulaError(error: String): Array<String> {
//     const jsonLike = error.split('TACo decryption failed with errors:')[1].trim();

//     // Escape double quotes inside the error message strings
//     const escaped = jsonLike.replace(/ThresholdDecryptionRequestFailed\('(.*?)'\)/g, 'ThresholdDecryptionRequestFailed(\\"$1\\")');

//     // Parse the escaped string as JSON
//     const errors = JSON.parse(escaped);

//     // Extract the specific part of the error messages
//     const errorParts = Object.values(errors).map(error => {
//         const match = error.match(/Node (.*?) raised (.*?)(?=\")/);
//         return match ? match[2] : null; // match[2] contains the error type
//     });

//     return [...new Set(errorParts.filter(Boolean))];
// }
