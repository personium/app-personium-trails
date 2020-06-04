import React, { useState, useCallback, useEffect } from 'react';
import { Segment, Header, Select, Button, Form } from 'semantic-ui-react';

import webdav from 'webdav';
import { atomLocalMode } from '../common/state';
import { useRecoilValue } from 'recoil';
import { authState as handler } from '../lib/personium_auth_adapter';

export function ImportPage(props) {
  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState(null);
  const [sending, setSending] = useState(false);
  const localMode = useRecoilValue(atomLocalMode);

  useEffect(() => {
    // on mounted
    // if (localMode) {
    //   setTimeout(() => {
    //     setFiles(
    //       [1, 2, 3, 4, 5].map(item => ({
    //         key: `${item}.json`,
    //         value: `${item}.json`,
    //         text: `${item}/${item}.json`,
    //       }))
    //     );
    //   }, 1000);
    //   return;
    // }

    // ToDo: refactoring
    const client = webdav.createClient(handler.boxUrl, {
      token: {
        access_token: handler.accessToken.access_token,
        token_type: 'Bearer',
      },
    });
    client
      .getDirectoryContents('/imported', {
        deep: false,
      })
      .then(items => items.filter(item => item.type === 'directory'))
      .then(items =>
        Promise.all(
          items.map(item => client.getDirectoryContents(item.filename))
        )
      )
      .then(results => [].concat(...results))
      .then(items => items.filter(item => item.type === 'file'))
      .then(items =>
        items.map(item => ({
          key: item.filename,
          value: item.filename,
          text: item.filename,
        }))
      )
      .then(setFiles);
  }, []);

  const onSelected = useCallback((e, data) => {
    setSelected(data.value);
  });

  const onSubmit = useCallback(() => {
    if (localMode) return;
    console.log('start import', selected);
    setSending(true);
    fetch(`${handler.boxUrl}Engine/process_imported_data`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${handler.accessToken.access_token}`,
      },
      body: JSON.stringify({ target: selected.replace('/imported/', '') }),
    })
      .then(res => res.json())
      .then(jsonDat => {
        console.log(jsonDat);
        setSelected(null);
        setSending(false);
      });
  }, [selected, setSending, setSelected]);
  return (
    <>
      <Segment>
        <Header as="h3">Google Takeout file importer</Header>
        <Form loading={files === null}>
          <Form.Field>
            <label>File to import</label>
            <Select
              placeholder="Select your file"
              onChange={onSelected}
              options={files}
            />
          </Form.Field>
          <Button onClick={onSubmit} disabled={selected === null || sending}>
            {sending ? 'Sending...' : 'Start Import'}
          </Button>
        </Form>
      </Segment>
    </>
  );
}
