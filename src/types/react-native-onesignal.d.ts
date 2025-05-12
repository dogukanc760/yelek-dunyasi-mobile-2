declare module 'react-nativse-onesignal' {
  export interface NotificationReceivedEvent {
    complete: (notification: any) => void;
    getNotification: () => any;
  }

  export interface OpenedEvent {
    notification: any;
    result: {
      actionId?: string;
      url?: string;
    };
  }

  export interface InAppMessageClickEvent {
    clickName: string;
    clickUrl?: string;
    firstClick: boolean;
    closesMessage: boolean;
  }

  export interface DeviceState {
    userId?: string;
    pushToken?: string;
    emailUserId?: string;
    emailAddress?: string;
    isSubscribed: boolean;
    isPushDisabled: boolean;
    isEmailSubscribed: boolean;
  }

  const OneSignal: {
    setAppId(appId: string): void;
    setLogLevel(logLevel: number, visualLevel: number): void;
    getDeviceState(): Promise<DeviceState>;
    setNotificationOpenedHandler(handler: (notification: any) => void): void;
    setInAppMessageClickHandler(handler: (event: any) => void): void;
    promptForPushNotificationsWithUserResponse(
      handler?: (response: boolean) => void,
    ): void;
  };

  export default OneSignal;
}
