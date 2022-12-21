import * as React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { faker } from '@faker-js/faker';

import {
  StyleSheet,
  ScrollView,
  Text,
  Button,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import {
  configure,
  setProperties,
  sendEvent,
  onBeforeSend,
  privacy,
  getVisitorId,
  setVisitorId as setPianoVisitorId,
  getUser,
  setUser as setPianoUser,
  deleteUser,
  sendEvents,
  PrivacyModes,
} from 'react-native-piano-analytics';

configure({
  collectDomain: 'lem.nouvelobs.com',
  site: 561551,
  path: 'hit.obs',
});

setProperties({
  site_level2: 'NOTR - App mobile Android',
});

const privacyModes: PrivacyModes[] = [
  PrivacyModes.EXEMPT,
  PrivacyModes.OPT_IN,
  PrivacyModes.OPT_OUT,
];

export default function App() {
  const [mode, setMode] = React.useState<string>('');
  const [nextMode, setNextMode] = React.useState<string>('');
  const [visitorId, setVisitorId] = React.useState<string>();
  const [user, setUser] = React.useState<any>();
  const [lastHit, setLastHit] = React.useState<any>();
  const [lastEvent, setLastEvent] = React.useState<React.ReactNode>();

  React.useEffect(() => {
    return onBeforeSend((data) => {
      setLastHit({ ...data });
      const lastFetchedEvent = [...data.events].pop();

      if (typeof lastFetchedEvent !== 'undefined') {
        const [key = 'totally_not_defined_var'] =
          lastFetchedEvent.name.split('.');
        if (key in lastFetchedEvent.data) {
          setLastEvent(
            <Text style={styles.center}>
              Sent <Text style={styles.bold}>{lastFetchedEvent.name}</Text>
              {'\n'} with name{' '}
              <Text style={styles.bold}>
                {
                  lastFetchedEvent.data[
                    key as keyof typeof lastFetchedEvent['data']
                  ]
                }
              </Text>
              {'\n\n'}
              <Text style={styles.monospaced}>
                {JSON.stringify(Object.keys(lastFetchedEvent.data))}
              </Text>
            </Text>
          );
        }
      }
    });
  }, []);

  React.useEffect(() => {
    if (mode) {
      setNextMode(() => {
        const index = (privacyModes as string[]).indexOf(mode);
        return privacyModes[(index + 1) % privacyModes.length] as string;
      });
    }
  }, [mode]);

  React.useEffect(() => {
    sendEvent('page.display', { page: 'test' });
    setTimeout(() => {
      setTimeout(() => {
        sendEvents([
          { name: 'page.display', properties: { page: 'test-3000ms' } },
          { name: 'click.action', properties: { click: 'test-3000ms' } },
        ]);
      }, 3000);
    }, 1000);
  }, [mode, visitorId, user]);

  React.useEffect(() => {
    privacy.getPrivacyMode().then(setMode);
    getVisitorId().then(setVisitorId);
    getUser().then(setUser);
  }, []);

  return (
    <SafeAreaProvider>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        <SafeAreaView style={[styles.container, styles.page]}>
          <Text style={styles.bold}>Privacy mode</Text>
          <Text>{mode || 'unknown'}</Text>
          <View style={styles.thinSeparator} />
          <Text style={styles.bold}>Visitor id</Text>
          <Text>{visitorId || 'unknown'}</Text>
          <View style={styles.thinSeparator} />
          <Text style={styles.bold}>User</Text>
          <Text>{user ? JSON.stringify(user, null, '  ') : 'unknown'}</Text>
          <Button
            title="Randomize user"
            onPress={() => {
              sendEvent('click.action', { click: 'Random User' });
              setPianoUser(faker.datatype.uuid(), faker.vehicle.manufacturer());
              getUser().then(setUser);
            }}
          />
          <Button
            title="Remove current user"
            onPress={() => {
              sendEvent('click.action', { click: 'Remove User' });
              deleteUser();
              getUser().then(setUser);
            }}
          />
          <View style={styles.thinSeparator} />
          <Button
            title="Randomize visitor"
            onPress={() => {
              sendEvent('click.action', { click: 'Random Visitor' });
              setPianoVisitorId(faker.datatype.uuid());
              setTimeout(() => {
                getVisitorId().then(setVisitorId);
              }, 500);
            }}
          />
          <View style={styles.thinSeparator} />
          <Button
            title={`Switch privacy mode to ${nextMode}`}
            onPress={() => {
              privacy.setPrivacyMode(nextMode);
              privacy.getPrivacyMode().then(setMode);
            }}
          />
          {lastEvent && (
            <>
              <View style={styles.thinSeparator} />
              {lastEvent}
            </>
          )}
          <Text style={{ textAlign: 'center', marginTop: 'auto' }}>
            Swipe to right to show last hit{' '}
          </Text>
        </SafeAreaView>

        <ScrollView style={styles.page}>
          <Button
            title="Send click event"
            onPress={() => {
              sendEvent('click.action', { click: faker.science.unit().name });
            }}
          />
          <Button
            title="Send multiple events"
            onPress={() => {
              sendEvents([
                {
                  name: 'page.display',
                  properties: { page: faker.company.name() },
                },
                {
                  name: 'click.navigation',
                  properties: { click: faker.color.human() },
                },
              ]);
            }}
          />
          {lastHit && (
            <Text style={styles.monospaced}>
              {JSON.stringify(lastHit, null, '  ')}
            </Text>
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  thinSeparator: {
    width: '80%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#000c',
    marginVertical: 10,
  },
  page: {
    width: Dimensions.get('window').width,
  },
  center: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  monospaced: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
