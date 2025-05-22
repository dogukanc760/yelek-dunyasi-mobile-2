import React from 'react';
import {StyleSheet} from 'react-native';
import WebView from 'react-native-webview';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type DocumentViewerParams = {
  url: string;
  title: string;
};

type DocumentViewerProps = {
  route: RouteProp<{params: DocumentViewerParams}, 'params'>;
  navigation: NativeStackNavigationProp<any>;
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({route}) => {
  const {url} = route.params;

  return (
    <WebView
      source={{uri: url}}
      style={styles.webview}
      startInLoadingState={true}
      scalesPageToFit={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});

export default DocumentViewer;
