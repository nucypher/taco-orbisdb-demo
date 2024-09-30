import {conditions, decrypt, domains, encrypt, ThresholdMessageKit} from '@nucypher/taco';
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
): Promise<ThresholdMessageKit> {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(window.ethereum);
    return await encrypt(
      provider,
      domains.TESTNET,
      messageToEncrypt,
      rpcCondition,
      0,
      provider.getSigner(),
    );
}

export async function decryptWithTACo(
    encryptedMessage: ThresholdMessageKit,
    conditionContext?: conditions.context.ConditionContext
): Promise<Uint8Array> {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return await decrypt(
        provider,
        domains.TESTNET,
        encryptedMessage,
        conditionContext,
    )
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
