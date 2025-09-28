import React from "react";
import { Text } from "react-native";
import { logError } from "../utils/logger";

type Props = { children: React.ReactNode };

export default class ErrorBoundary extends React.Component<
  Props,
  { hasError: boolean }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    logError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Text>Oops! Something went wrong.</Text>
        </>
      );
    }
    return this.props.children;
  }
}
