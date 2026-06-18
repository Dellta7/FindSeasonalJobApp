import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import AppRoot from './src/AppRoot';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Bold': Roboto_700Bold,
  });

  useEffect(() => {
    console.log('Fonts status:', fontsLoaded);
    if (fontsLoaded) {
      console.log('Hiding Splash Screen...');
      SplashScreen.hideAsync().catch(err => console.error('Error hiding splash screen:', err));
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    console.log('Fonts not yet loaded');
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <Text>Loading Fonts...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate 
          loading={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
              <Text>Loading Storage...</Text>
            </View>
          } 
          persistor={persistor}
        >
          <AppRoot />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
