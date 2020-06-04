import xpath from 'xpath';
import { DOMParser, XMLSerializer } from 'xmldom';

function unnormalize(str) {
  const namespaceURI = str
    .split(':')
    .slice(null, -1)
    .join(':');
  const [localName] = str.split(':').slice(-1);
  return { namespaceURI, localName };
}

export function composeXMLACL(acls) {
  const baseStr = '<acl xmlns="DAV:" xmlns:p="urn:x-personium:xmlns"></acl>';
  const baseStrAce =
    '<ace xmlns="DAV:" xmlns:p="urn:x-personium:xmlns"><principal></principal><grant><privilege></privilege></grant></ace>';
  const select = xpath.useNamespaces({
    D: 'DAV:',
    p: 'urn:x-personium:xlmns',
  });

  const basedom = new DOMParser().parseFromString(baseStr);
  const aclNode = select('/D:acl', basedom, true);

  for (const acl of acls) {
    const acedom = new DOMParser().parseFromString(baseStrAce);
    const { principal, privileges } = acl;
    const { namespaceURI, localName } = unnormalize(principal);
    select('/D:ace/D:principal', acedom, true).appendChild(
      acedom.createElementNS(namespaceURI, localName)
    );
    for (const privilege of privileges) {
      const privilegeNode = select('/D:ace/D:grant/D:privilege', acedom, true);
      const {
        namespaceURI: pnamespaceURI,
        localName: plocalName,
      } = unnormalize(privilege);
      privilegeNode.appendChild(
        acedom.createElementNS(pnamespaceURI, plocalName)
      );
    }
    aclNode.appendChild(acedom);
  }

  const result = [
    '<?xml version="1.0" encoding="utf-8" ?>',
    new XMLSerializer().serializeToString(basedom),
  ];
  return [].concat(...result).join('\n');
}

export async function setACL(url, access_token, acls) {
  // [{ principal: 'DAV::all', privileges: ['DAV::read'] }],
  const dat = composeXMLACL(acls);
  console.log(url, dat);
  const res = await fetch(url, {
    method: 'ACL',
    headers: {
      Accept: 'text/plain',
      Authorization: `Bearer ${access_token}`,
    },
    body: dat,
  });
  return res;
}

export async function statDirectory(url, access_token) {
  const res = await fetch(url, {
    method: 'PROPFIND',
    headers: {
      Authorization: `Bearer ${access_token}`,
      depth: 1,
    },
  });
  if (res.status === 404) {
    return [];
  }

  const select = xpath.useNamespaces({
    D: 'DAV:',
    p: 'urn:x-personium:xlmns',
  });

  const normalize = node => {
    return `${node.namespaceURI}:${node.localName}`;
  };

  return new Map(
    await res.text().then(text => {
      const doc = new DOMParser().parseFromString(text);
      const responses = select('/D:multistatus/D:response', doc);
      return responses.map(response => {
        const filePath = select('D:href/text()', response, true).nodeValue;
        const aceElems = select('D:propstat/D:prop/D:acl/D:ace', response);
        const aces = aceElems.map(ace => {
          const principal = normalize(select('D:principal/*', ace, true));
          const privileges = select('D:grant/D:privilege/*', ace).map(
            normalize
          );
          return [principal, new Set(privileges)];
        });
        return [filePath, { acl: new Map(aces) }];
      });
    })
  );
}
