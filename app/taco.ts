import {conditions, decrypt, domains, encrypt, initialize, ThresholdMessageKit} from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
import {ethers} from "ethers";

let globalAuthProvider: EIP4361AuthProvider | null = null;
let currentAccount: string | null = null;

export async function initializeAuthProvider() {
    await initialize();
    if (!globalAuthProvider) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        const newAccount = accounts[0];
        globalAuthProvider = new EIP4361AuthProvider(
            provider,
            provider.getSigner(),
        );
        currentAccount = newAccount;
    }

    // Set up account change listener
    window.ethereum.on('accountsChanged', handleAccountChange);
    return globalAuthProvider;
}

async function handleAccountChange(accounts: string[]) {
    const newAccount = accounts[0];
    if (newAccount !== currentAccount) {
        globalAuthProvider = null;
        await initializeAuthProvider();
    }
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

export async function decryptWithTACo(encryptedMessage: string): Promise<String> {
    try {
        const tmk = ThresholdMessageKit.fromBytes(decodeB64(encryptedMessage));
        const conditionContext = conditions.context.ConditionContext.fromMessageKit(tmk);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        const authProvider = await initializeAuthProvider();
        console.log(authProvider);

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
