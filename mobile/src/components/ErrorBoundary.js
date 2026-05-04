import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { LT } from '../config/lightTheme';
import { LEGAL } from '../config/constants';

const RAPID_CRASH_WINDOW_MS = 60_000;
const RAPID_CRASH_THRESHOLD = 3;

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null, recentCrashes: [] };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
    const now = Date.now();
    const recent = (this.state.recentCrashes || []).filter(
      (t) => now - t < RAPID_CRASH_WINDOW_MS,
    );
    recent.push(now);
    this.setState({ info, recentCrashes: recent });
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
  };

  handleContact = () => {
    const email = LEGAL?.SUPPORT_EMAIL;
    if (!email) return;
    const subject = encodeURIComponent('Ascend — Crash report');
    const body = encodeURIComponent(
      `Crash detail:\n${this.state.error?.message || 'unknown'}\n\nWhat I was doing:\n`,
    );
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`).catch(() => {});
  };

  render() {
    if (!this.state.error) return this.props.children;

    const inLoop =
      (this.state.recentCrashes?.length || 0) >= RAPID_CRASH_THRESHOLD;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Bir şeyler ters gitti</Text>
          <Text style={styles.subtitle}>
            Beklenmedik bir hata oluştu. Devam etmeyi dene.
          </Text>

          {inLoop ? (
            <Text style={styles.loopWarn}>
              Hata tekrar ediyor — uygulamayı kapatıp açman gerekebilir, ya da
              destek ekibine yaz.
            </Text>
          ) : null}

          {__DEV__ && this.state.error?.message ? (
            <View style={styles.devBox}>
              <Text style={styles.devLabel}>HATA (dev only)</Text>
              <Text style={styles.devText}>
                {String(this.state.error?.message)}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={this.handleReset}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Tekrar Dene</Text>
          </TouchableOpacity>

          {inLoop ? (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={this.handleContact}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>Destek ile İletişim</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LT.background },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: { fontSize: 64, marginBottom: 24 },
  title: {
    color: LT.onSurface,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: LT.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  loopWarn: {
    color: LT.primary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  devBox: {
    width: '100%',
    backgroundColor: LT.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: LT.primary,
    marginBottom: 24,
  },
  devLabel: {
    color: LT.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  devText: {
    color: LT.onSurface,
    fontSize: 12,
    fontFamily: 'Menlo',
  },
  primaryBtn: {
    backgroundColor: LT.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 220,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: LT.onPrimary,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryBtnText: {
    color: LT.onSurfaceVariant,
    fontWeight: '700',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
