import { SiweMessage } from "@didtools/cacao";
import {
  conditions,
  decrypt,
  encrypt,
  ThresholdMessageKit,
} from "@nucypher/taco";
import {
  SingleSignOnEIP4361AuthProvider,
  USER_ADDRESS_PARAM_EXTERNAL_EIP4361,
} from "@nucypher/taco-auth";
import { DIDSession } from "did-session";
import { ethers } from "ethers";
import { useContext } from "react";
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
  ) {
    if (!isInitialized) return;

    const siweInfo = await loadSiweFromOrbisSession();
    if (!siweInfo.message || !siweInfo.signature) {
      console.error("SIWE message or signature missing");
      return "<Decryption failed. This may be because the user has not yet logged in.>";
    }
    const authProvider =
      await SingleSignOnEIP4361AuthProvider.fromExistingSiweInfo(
        siweInfo.message,
        siweInfo.signature,
      );

    const tmk = ThresholdMessageKit.fromBytes(decodeB64(encryptedMessage));
    const conditionContext =
      conditions.context.ConditionContext.fromMessageKit(tmk);
    conditionContext.addAuthProvider(
      USER_ADDRESS_PARAM_EXTERNAL_EIP4361,
      authProvider,
    );

    try {
      const decrypted = await decrypt(provider, domain, tmk, conditionContext);
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("Decryption failed:", error);
      return "<Decryption failed>";
    }
  }

  async function loadSiweFromOrbisSession(): Promise<{
    message: string | undefined;
    signature: string | undefined;
  }> {
    const session = localStorage.getItem("orbis:session");

    if (!session) {
      console.error("No orbis-session found on local storage");
      return { message: undefined, signature: undefined };
    }

    const didSession = await DIDSession.fromSession(session);
    const siweMessage = SiweMessage.fromCacao(didSession.cacao);
    const message = siweMessage.toMessageEip55();
    const signature = siweMessage.signature;
    return { message, signature };
  }

  function encodeB64(uint8Array: any) {
    return Buffer.from(uint8Array).toString("base64") as String;
  }

  function decodeB64(b64String: any) {
    return new Uint8Array(Buffer.from(b64String, "base64"));
  }

  return { isInitialized, encryptWithTACo, decryptWithTACo };
}
