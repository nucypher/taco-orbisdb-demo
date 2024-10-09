import { useEffect, useContext } from "react";
import {
  conditions,
  decrypt,
  encrypt,
  ThresholdMessageKit,
} from "@nucypher/taco";
import {
  EIP4361AuthProvider,
  USER_ADDRESS_PARAM_DEFAULT,
} from "@nucypher/taco-auth";
import { ethers } from "ethers";
import { TACoContext } from "../context/TACoContext";

export default function useTaco() {
  const { isInitialized, ritualId, domain } = useContext(TACoContext);

  async function encryptWithTACo(
    messageToEncrypt: string,
    condition: conditions.condition.Condition,
    provider: ethers.providers.Provider,
    signer: ethers.Signer,
  ) {
    if (!isInitialized) return;

    const tmk = await encrypt(
      provider,
      domain,
      messageToEncrypt,
      condition,
      ritualId,
      signer,
    );

    return encodeB64(tmk.toBytes());
  }

  async function decryptWithTACo(
    encryptedMessage: string,
    provider: ethers.providers.Provider,
    signer: ethers.Signer,
  ) {
    if (!isInitialized) return;

    try {
      const tmk = ThresholdMessageKit.fromBytes(decodeB64(encryptedMessage));
      const conditionContext =
        conditions.context.ConditionContext.fromMessageKit(tmk);

      const authProvider = new EIP4361AuthProvider(provider, signer);

      conditionContext.addAuthProvider(
        USER_ADDRESS_PARAM_DEFAULT,
        authProvider,
      );

      const decrypted = await decrypt(provider, domain, tmk, conditionContext);

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("Decryption failed:", error);
      return encryptedMessage;
    }
  }

  function encodeB64(uint8Array: any) {
    return Buffer.from(uint8Array).toString("base64") as String;
  }

  function decodeB64(b64String: any) {
    return new Uint8Array(Buffer.from(b64String, "base64"));
  }

  return { isInitialized, encryptWithTACo, decryptWithTACo };
}
