import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context";
import { useNavigate } from "react-router";
import { GameItem } from "../components";
import style from "../pages/Home.module.css";

const bufferToBase64 = (buffer: any) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base64ToBuffer = (base64: any) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

export default function RegisterCredential() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useContext(UserContext);
  const [success, setSuccess] = useState(false);
  const [action, setAction] = useState('');

  const registerCredential = async () => {
    setAction('registered');
    setIsLoading(true);
    try {
      const credentialCreationOptions = await (await fetch(`/api/registration-options`, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })).json();

      credentialCreationOptions.challenge = new Uint8Array(credentialCreationOptions.challenge.data);
      credentialCreationOptions.user.id = new Uint8Array(credentialCreationOptions.user.id);
      credentialCreationOptions.user.name = user?.username;
      credentialCreationOptions.user.displayName = user?.username;
      credentialCreationOptions.authenticatorSelection = {};

      const credential = await navigator.credentials.create({
        publicKey: credentialCreationOptions
      });

      // @ts-ignore
      const credentialId = bufferToBase64(credential?.rawId);

      const data = {
        rawId: credentialId,
        response: {
          // @ts-ignore
          attestationObject: bufferToBase64(credential?.response.attestationObject),
          // @ts-ignore
          clientDataJSON: bufferToBase64(credential?.response.clientDataJSON),
          id: credential?.id,
          type: credential?.type
        }
      };

      const res: { status: string, publicKey: string, rawId: string} = await (await fetch(`/api/register`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({credential: data}),
        credentials: 'include'
      })).json();

      if (res.status !== 'ok') {
        throw new Error('Registration failed');
      }

      user!.rawId = res.rawId;
      user!.publicKey = res.publicKey
      login(user!);

      setSuccess(true);
      setError('');

    } catch (err) {
      console.error('registration failed', err);
      setError('Registration Failed');
    } finally {
      setIsLoading(false);
    }
  }

  const authCredential = async () => {
    setAction('authenticated');
    setIsLoading(true);

    try {
      const credentialRequestOptions = await (await fetch(`/api/authentication-options`, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })).json();

      const credentialId = user!.rawId;

      credentialRequestOptions.challenge = new Uint8Array(credentialRequestOptions.challenge.data);
      credentialRequestOptions.allowCredentials = [
        {
          id: base64ToBuffer(credentialId),
          type: 'public-key',
          transports: [ "usb", "nfc", "ble", "hybrid", "internal" ]
        }
      ];

      const credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions
      });

      const data = {
        // @ts-ignore
        rawId: bufferToBase64(credential?.rawId),
        response: {
          // @ts-ignore
          authenticatorData: bufferToBase64(credential?.response.authenticatorData),
          // @ts-ignore
          signature: bufferToBase64(credential.response.signature),
          // @ts-ignore
          userHandle: bufferToBase64(credential.response.userHandle),
          // @ts-ignore
          clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
          id: credential?.id,
          type: credential?.type
        }
      };

      const response = (await fetch(`/api/authenticate`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({credential: data}),
        credentials: 'include'
      }));

      if(response.status !== 200) {
        setError('Credential has expired, please register a new credential');
      } else {
        await response.json();

        setSuccess(true);
        setError('');
      }
    } catch(e) {
      console.error('authentication failed', e);

      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className={style.containerOuter}>
        {isLoading && 'Loading...'}<br/>
        {!success && !user?.rawId ?
          <button className={style.gameButton} disabled={isLoading} onClick={registerCredential}>Register Credential</button> :
          <button className={style.gameButton} disabled={isLoading} onClick={authCredential}>Authenticate Credential</button>}
        {success && !error && <>
          <p>Credential {action} successfully.</p><br/>
        </>}
        <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>
      </div>
    </>
  );
}
