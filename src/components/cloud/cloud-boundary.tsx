'use client';
// Why a client component: an error boundary must be a class component with state, and it exists
// only to keep the chips as the view when the cloud fails to mount for any reason (D18). It
// renders nothing on error, so there is nothing to undo.
import { Component, type ReactNode } from 'react';

interface CloudBoundaryProps {
  children: ReactNode;
}

interface CloudBoundaryState {
  failed: boolean;
}

export class CloudBoundary extends Component<CloudBoundaryProps, CloudBoundaryState> {
  state: CloudBoundaryState = { failed: false };

  static getDerivedStateFromError(): CloudBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
