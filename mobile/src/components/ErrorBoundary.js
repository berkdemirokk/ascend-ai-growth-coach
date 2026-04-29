import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Bir şeyler ters gitti</Text>
          <Text style={styles.subtitle}>
            Beklenmedik bir hata oluştu. Aşağıdaki butona basarak tekrar dene.
          </Text>
          {__DEV__ && this.state.error?.message && (
            <View style={styles.devBox}>
              <Text style={styles.devLabel}>HATA (dev only)</Text>
              <Text style={styles.devText}>{String(this.state.error?.message)}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleReset}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B14' },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: { fontSize: 64, marginBottom: 24 },
  title: {
    color: '#F5F5FA',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9898B0',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  devBox: {
    width: '100%',
    backgroundColor: '#161626',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    marginBottom: 24,
  },
  devLabel: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  devText: {
    color: '#F5F5FA',
    fontSize: 12,
    fontFamily: 'Menlo',
  },
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5F5FA',
    fontWeight: '700',
    fontSize: 16,
  },
});
