import React, { useCallback } from 'react';

import { authState } from './lib/personium_auth_adapter';
import { atom, useRecoilState, useSetRecoilState } from 'recoil';
import { $barInstalled } from './common/auth';

const $installStatus = atom({
  key: 'bar_install_status',
  default: [],
});

const $installing = atom({
  key: 'bar_installing',
  defualt: false,
});

export function PersoniumBarInstaller() {
  const [installStatus, setInstallStatus] = useRecoilState($installStatus);
  const [installing, setInstalling] = useRecoilState($installing);
  const setBarInstalled = useSetRecoilState($barInstalled);

  const handleClick = useCallback(async () => {
    let pollingStatusID = -1;

    function updateInstallStatus(text) {
      setInstallStatus(c => [...c, { time: Date.now(), text }]);
    }

    if (authState.accessToken.access_token === undefined) {
      setInstalling(true);
      return () => {
        setInstalling(false);
      };
    }
    if (installing) return;

    setInstalling(true);

    const { access_token } = authState.accessToken;

    const res = await fetch(
      'https://app-personium-trails.appdev.personium.io/__/app-personium-trails.bar'
    );
    if (res.status !== 200) {
      throw new Error('Downloading Barfile is failed');
    }

    // download to memory
    const buff = await res.arrayBuffer();
    console.log(`Downloaded ${buff.byteLength} bytes`);

    const boxURL = `${authState._targetCell}app-personium-trails`;

    const sendRes = await fetch(boxURL, {
      method: 'MKCOL',
      body: buff,
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/zip',
      },
      redirect: 'manual',
    });
    if (sendRes.status === 202) {
      // Accepted
      // const boxStatusURL = sendRes.headers.get('location');
      pollingStatusID = setInterval(async () => {
        const boxStatus = await fetch(boxURL, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }).then(res => res.json());

        const statusText =
          boxStatus.box.status === 'ready'
            ? boxStatus.box.status
            : `${boxStatus.box.status} ${boxStatus.box.progress}`;

        updateInstallStatus(statusText);
        if (boxStatus.box.status === 'ready') {
          clearInterval(pollingStatusID);

          // update boxURL
          authState
            .updateBoxUrl()
            .then(() => {
              console.log('bar installation is done');
              setBarInstalled(true);
            })
            .catch(res => {
              console.log('bar installation is failed', res);
              setBarInstalled(false);
            });
        }
      }, 500);
    } else {
      const err = await sendRes.json();
      updateInstallStatus(err.message.value);
    }
  }, [installing, setInstallStatus, setInstalling, setBarInstalled]);

  if (authState.accessToken === null) {
    return <h1>Login First</h1>;
  }
  return (
    <>
      <h1>Install Application</h1>
      <div>
        <button onClick={handleClick} disabled={installing}>
          Start Install
        </button>
      </div>
      <div>
        {installStatus.map(item => {
          return <p key={`installation-status-${item.time}`}>{item.text}</p>;
        })}
      </div>
    </>
  );
}
