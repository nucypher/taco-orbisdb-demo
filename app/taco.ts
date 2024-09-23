import {conditions, decrypt, domains, encrypt, initialize, ThresholdMessageKit} from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
import {ethers} from "ethers";

let globalAuthProvider: EIP4361AuthProvider | null = null;

export async function initializeAuthProvider() {
    if (!globalAuthProvider) {
        await initialize();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        globalAuthProvider = new EIP4361AuthProvider(
            provider,
            provider.getSigner(),
        );
    }
    return globalAuthProvider;
}


const rpcCondition = new conditions.base.rpc.RpcCondition({
    chain: 80002,
    method: 'eth_getBalance',
    parameters: [':userAddress'],
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
    encryptedMessage: string,
    authProvider?: EIP4361AuthProvider
): Promise<String> {
    try {
        const tmk = ThresholdMessageKit.fromBytes(decodeB64(encryptedMessage));
        const conditionContext = conditions.context.ConditionContext.fromMessageKit(tmk);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        if (!authProvider) {
            authProvider = await initializeAuthProvider();
        }
        
        conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);
        
        const decrypted = await decrypt(
            provider,
            domains.TESTNET,
            tmk,
            conditionContext
        );
        
        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error("Decryption failed:", error);
        return encryptedMessage;
    }
}

export function encodeB64(uint8Array: any) {
    return Buffer.from(uint8Array).toString("base64") as String;
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
