import { useEffect, useCallback } from 'react';
import {
  useRecoilValue,
  useSetRecoilState,
  atomFamily,
  selectorFamily,
} from 'recoil';

import { authState } from '../lib/personium_auth_adapter';
import { statListener, adapter, getYMD } from '../adapters/locations_direct';
import { setACL, statDirectory } from '../adapters/webdav';

export const locationODataFromId = selectorFamily({
  key: '_locationODataFromId',
  get: locationId => async ({ get }) => {
    console.log('locationODataFromId');
    const result = await adapter
      .getMoveDetail(locationId)
      .catch(res => adapter.getStayDetail(locationId))
      .catch(res => console.log('fetch error', res));
    return result;
  },
});

export const locationURLFromId = selectorFamily({
  key: '_locationURLFromId',
  get: locationId => ({ get }) => {
    // const odata = useRecoilValue(locationODataFromId(locationId));
    const odata = get(locationODataFromId(locationId));
    const timems = parseInt(odata.startTime.match(/\/Date\((\d+)\)\//)[1]);
    const filename = `${'placeId' in odata ? 's' : 'm'}_${timems}.json`;
    const folder = `${authState.boxUrl}exported/${getYMD(timems)}/`;
    const filepath = `${folder}${filename}`;
    return filepath;
  },
});

// todo: refactoring
export const locationACLStatusState = atomFamily({
  key: 'Location ACL Status',
  default: 'loading',
});

export function useLocationACLSubscribe(__id, filepath) {
  const setAclStatus = useSetRecoilState(locationACLStatusState(__id));

  useEffect(() => {
    function handleStatChange(stat) {
      if ('acl' in stat && stat.acl.has('DAV::all')) {
        setAclStatus(
          stat.acl.get('DAV::all').has('DAV::read') ? 'public' : 'private'
        );
      } else {
        setAclStatus('private');
      }
    }

    statListener.subscribe(filepath, handleStatChange);
    return function cleanup() {
      statListener.unsubscribe(filepath, handleStatChange);
    };
  }, []);

  const setLocationACLPrivate = useCallback(() => {
    setAclStatus('loading');
    setACL(filepath, authState.accessToken.access_token, []).then(() => {
      statListener.fire(filepath, { acl: new Map([]) }); // Todo: use PROPFIND to get current stat.
    });
  }, [__id, filepath]);

  const setLocationACLPublic = useCallback(() => {
    setAclStatus('loading');
    setACL(filepath, authState.accessToken.access_token, [
      { principal: 'DAV::all', privileges: ['DAV::read'] },
    ]).then(() => {
      statListener.fire(filepath, {
        acl: new Map([['DAV::all', new Set(['DAV::read'])]]), // Todo: use PROPFIND to get current stat.
      });
    });
  }, [__id, filepath]);

  const updateLocationACL = useCallback(() => {
    statDirectory(filepath, authState.accessToken.access_token).then(res => {
      if (!res.has(filepath)) {
        console.log(`${filepath} is not found(PROPPATCH)`);
        return;
      }
      statListener.fire(filepath, res.get(filepath));
    });
  });

  return { updateLocationACL, setLocationACLPrivate, setLocationACLPublic };
}
