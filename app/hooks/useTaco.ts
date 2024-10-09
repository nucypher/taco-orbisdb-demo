import {
  conditions,
  decrypt,
  domains,
  encrypt,
  ThresholdMessageKit,
} from "@nucypher/taco";
import {
  EIP4361AuthProvider,
  USER_ADDRESS_PARAM_DEFAULT,
} from "@nucypher/taco-auth";
import { ethers } from "ethers";

let authManager = {
  provider: null,
  authProvider: null,
  currentAccount: null,

  async initialize() {
    if (!this.provider) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.updateAccount();
      this.setupAccountChangeListener();
    }
    return this.authProvider;
  },

  async updateAccount() {
    const accounts = await this.provider.listAccounts();
    this.currentAccount = accounts[0];
    this.authProvider = new EIP4361AuthProvider(
      this.provider,
      this.provider.getSigner(),
    );
  },

  setupAccountChangeListener() {
    window.ethereum.on("accountsChanged", async (accounts) => {
      const newAccount = accounts[0];
      if (newAccount !== this.currentAccount) {
        await this.updateAccount();
      }
    });
  },
};

export async function getAuthProvider() {
  return authManager.initialize();
}
const rpcCondition = new conditions.base.rpc.RpcCondition({
  chain: 80002,
  method: "eth_getBalance",
  parameters: [":userAddress"],
  returnValueTest: {
    comparator: ">",
    value: 0,
  },
});

export async function encryptWithTACo(
  messageToEncrypt: string,
): Promise<String> {
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
): Promise<String> {
  try {
    const tmk = ThresholdMessageKit.fromBytes(decodeB64(encryptedMessage));
    const conditionContext =
      conditions.context.ConditionContext.fromMessageKit(tmk);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const authProvider = await getAuthProvider();
    console.log(authProvider);

    conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);

    const decrypted = await decrypt(
      provider,
      domains.TESTNET,
      tmk,
      conditionContext,
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
